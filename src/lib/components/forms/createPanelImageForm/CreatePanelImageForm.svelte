<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { readAssetDataUrl } from '#lib/client/assets/read-data-url.ts';
	import { workflowDeps } from '#lib/client/workflow-deps.ts';
	import { expectWorkflow } from '#lib/features/comics/client/workflows/asset-workflow.ts';
	import { commitCreatedPanelImageVariant } from '#lib/features/panels/client/workflows/commit-created-panel-image-variant.ts';
	import { commitGeneratedPanelImage } from '#lib/features/panels/client/workflows/commit-generated-panel-image.ts';
	import {
		CREATE_PANEL_IMAGE_ACTION,
		EXISTING_IMAGE_VALUE_KEY,
		REFERENCE_IMAGES_KEY,
		type CreatePanelImageResult,
	} from '#lib/features/panels/contracts/createPanelImage.ts';
	import { withGlobalInstructions } from '#lib/features/settings/client/global-instructions.ts';
	import { enhanceAction } from '#lib/forms/enhance-action.ts';
	import { encodeFormValue } from '#lib/forms/form-data.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { ImageVariantEnum, type ImageVariant } from '#lib/types/index.ts';
	import {
		IMAGE_VALUE_KEY,
		INCLUDE_IMAGE_VALUE_KEY,
		INSTRUCTIONS_VALUE_KEY,
	} from '#lib/utils/db/dbTypes.ts';

	import Image from '../../image/Image.svelte';
	import type { CreatePanelImageFormProps } from './createPanelImageFormTypes';

	const FAILED_MESSAGES: Record<ImageVariant, () => string> = {
		[ImageVariantEnum.enum.portrait]: () => m.portraitImageFailed(),
		[ImageVariantEnum.enum.landscape]: () => m.landscapeImageFailed(),
	};

	const handleSubmit = withGlobalInstructions(
		enhanceAction<CreatePanelImageResult>(
			m.loadingCreatePanelImage(),
			async ({ data, update, showError }) => {
				expectWorkflow(
					await (baseImage
						? commitCreatedPanelImageVariant(workflowDeps, data)
						: commitGeneratedPanelImage(workflowDeps, data)),
				);
				// The image that succeeded is saved; say which one wasn't made (REQ-103-3).
				if (data.failedVariant) {
					showError(FAILED_MESSAGES[data.failedVariant]());
				}
				await update();
				onSuccess?.();
			},
		),
	);

	let {
		label,
		values,
		imageName,
		imageVariant = ImageVariantEnum.enum.portrait,
		characterReferences,
		baseImage,
		onSuccess,
		submitButton = $bindable(),
	}: CreatePanelImageFormProps & { submitButton?: HTMLButtonElement } = $props();

	// The preview keeps the orientation of the image it shows, at the same 2:3 or 3:2 box.
	const previewSize = $derived(
		imageVariant === ImageVariantEnum.enum.landscape
			? { width: 75, height: 50 }
			: { width: 50, height: 75 },
	);

	const referenceFieldName = (characterId: string) => `reference-${characterId}`;

	/**
	 * The radios only carry crop ids. The chosen full-body crops are read from
	 * OPFS here, so the request stays small however many options are offered.
	 */
	const prepareSubmit: SubmitFunction<CreatePanelImageResult> = async (input) => {
		for (const group of characterReferences) {
			const name = referenceFieldName(group.characterId);
			const chosenId = input.formData.get(name);
			input.formData.delete(name);
			const chosen = group.options.find(({ imageId }) => imageId === chosenId);
			if (chosen) {
				input.formData.append(
					REFERENCE_IMAGES_KEY,
					await readAssetDataUrl(workflowDeps.assets, chosen.full.src),
				);
			}
		}
		if (baseImage) {
			input.formData.append(
				EXISTING_IMAGE_VALUE_KEY,
				await readAssetDataUrl(workflowDeps.assets, baseImage),
			);
		}
		return handleSubmit(input);
	};

	let imageUrl = $state<string | null>(null);

	$effect(() => {
		if (imageName) {
			readAssetDataUrl(workflowDeps.assets, imageName).then((url) => {
				imageUrl = url;
			});
		}
	});
</script>

<!-- multipart: the reference images are large data URLs that urlencoding would inflate -->
<form
	method="POST"
	enctype="multipart/form-data"
	action={`?/${CREATE_PANEL_IMAGE_ACTION}`}
	use:enhance={prepareSubmit}
>
	{#each Object.entries(values) as entry (entry[0])}
		<input type="hidden" name={entry[0]} value={encodeFormValue(entry[1])} />
	{/each}

	{#if imageName}
		<img width={previewSize.width} height={previewSize.height} src={imageUrl} alt="" />
		<label for={INCLUDE_IMAGE_VALUE_KEY}>
			<input type="hidden" name={IMAGE_VALUE_KEY} value={imageUrl} />
			<input type="checkbox" id={INCLUDE_IMAGE_VALUE_KEY} name={INCLUDE_IMAGE_VALUE_KEY} />
			<span>{m.includeImage()}</span>
		</label>
	{/if}

	{#each characterReferences as group (group.characterId)}
		<fieldset>
			<legend>{m.characterReference({ character: group.characterName })}</legend>
			<label>
				<input type="radio" name={referenceFieldName(group.characterId)} value="" checked />
				<span>{m.referenceNone()}</span>
			</label>
			{#each group.options as option (option.imageId)}
				<label>
					<input type="radio" name={referenceFieldName(group.characterId)} value={option.imageId} />
					<span>{m.panel({ number: option.panelNumber })}</span>
					<Image
						width={50}
						height={50}
						image={option.head}
						alt={m.characterReferenceThumbnail({
							character: group.characterName,
						})}
					/>
				</label>
			{/each}
		</fieldset>
	{/each}

	<label for={INSTRUCTIONS_VALUE_KEY}>
		{m.instructions()}
		<textarea id={INSTRUCTIONS_VALUE_KEY} name={INSTRUCTIONS_VALUE_KEY} rows={5}></textarea>
	</label>

	<button type="submit" bind:this={submitButton}>{label}</button>
</form>

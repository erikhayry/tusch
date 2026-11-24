<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { type GeneratingImageDialogProps } from './generatingImageDialogTypes';

	let { open, startedAt, panelNumber, panelTitle, variants, onCancel }: GeneratingImageDialogProps =
		$props();

	const titleId = $props.id();
	let dialog = $state<HTMLDialogElement>();
	let now = $state(Date.now());

	// A modal gets the inert page behind it and focus containment; closing it is the only exit.
	$effect(() => {
		if (!dialog) {
			return;
		}
		if (open && !dialog.open) {
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	});

	$effect(() => {
		if (!open) {
			return;
		}
		now = Date.now();
		const interval = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(interval);
	});

	const elapsed = $derived(Math.max(0, Math.floor((now - startedAt) / 1000)));
	const clock = $derived(`${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`);

	const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

	// Escape would throw away a paid image; Cancel generation is the only exit. Chrome closes a
	// modal on a second Escape even when the first is cancelled, so both events are blocked.
	// Tab wraps inside the dialog: the page behind is inert, so Tab past the last control would
	// leave for the browser's own controls.
	function onDialogKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			return;
		}
		if (event.key !== 'Tab' || !dialog) {
			return;
		}
		const controls = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)];
		const first = controls.at(0);
		const last = controls.at(-1);
		if (!first || !last) {
			event.preventDefault();
			return;
		}
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}
</script>

<dialog
	bind:this={dialog}
	aria-labelledby={titleId}
	onkeydown={onDialogKeydown}
	oncancel={(event) => event.preventDefault()}
>
	<div class="content">
		<span class="spinner" aria-hidden="true"></span>
		<h2 id={titleId} class="title">{m.generatingImageTitle()}</h2>
		<p class="subtitle">
			{m.panel({ number: panelNumber })}
			{#if panelTitle}
				<span aria-hidden="true">·</span>
				{panelTitle}
			{/if}
			<span aria-hidden="true">·</span>
			{variants}
		</p>
		<!-- The only live text in the dialog; the timer below is deliberately outside any live region. -->
		<p class="visually-hidden" role="status">{open ? m.generatingImageAnnouncement() : ''}</p>
		<div class="timer" role="timer">{clock}</div>
		<p class="timer-label">{m.generatingImageElapsed()}</p>
		<div class="track" role="progressbar" aria-label={m.generatingImageProgress()}>
			<span class="segment"></span>
		</div>
		<p class="note">
			<svg
				class="note-icon"
				viewBox="0 0 20 20"
				width="16"
				height="16"
				aria-hidden="true"
				focusable="false"
			>
				<circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" stroke-width="1.5" />
				<path d="M10 9v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				<circle cx="10" cy="6" r="1" fill="currentColor" />
			</svg>
			<span>{m.generatingImageNote()}</span>
		</p>
		<button type="button" class="cancel" onclick={onCancel}>{m.cancelGeneration()}</button>
	</div>
</dialog>

<style>
	dialog {
		inline-size: min(calc(100% - var(--space-3) * 2), var(--width-dialog));
		max-inline-size: none;
		margin: auto;
		padding: 0;
		border: none;
		border-radius: var(--radius-dialog);
		background: var(--color-surface);
		color: var(--color-text);
		box-shadow: var(--shadow-dialog);
	}

	dialog::backdrop {
		background: var(--color-scrim);
		backdrop-filter: blur(var(--blur-scrim));
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-5) var(--space-4) var(--space-4);
		text-align: center;
	}

	.title {
		margin: 0;
		font-size: var(--font-size-h3);
		font-weight: var(--font-weight-semibold);
	}

	.subtitle,
	.timer-label {
		margin: 0;
		font-size: var(--font-size-small);
		color: var(--color-muted);
	}

	.timer-label {
		text-transform: uppercase;
	}

	.spinner {
		inline-size: var(--spinner-size);
		block-size: var(--spinner-size);
		border: var(--border-width-thick) solid var(--color-border);
		border-block-start-color: var(--color-text);
		border-radius: var(--radius-pill);
		animation: spin var(--duration-spinner) linear infinite;
	}

	.timer {
		font-size: var(--font-size-timer);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		line-height: var(--line-height-heading);
	}

	.track {
		inline-size: 100%;
		block-size: var(--space-1);
		overflow: hidden;
		background: var(--color-background);
		border-radius: var(--radius-pill);
	}

	.segment {
		display: block;
		inline-size: var(--bar-segment);
		block-size: 100%;
		background: var(--color-muted);
		border-radius: inherit;
		animation: sweep var(--duration-bar) ease-in-out infinite;
	}

	.note {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
		margin: 0;
		padding: var(--space-2) var(--space-3);
		font-size: var(--font-size-small);
		text-align: start;
		color: var(--color-warning-text);
		background: var(--color-warning-bg);
		border-radius: var(--radius);
	}

	.note-icon {
		flex: none;
		margin-block-start: var(--space-1);
	}

	.cancel {
		inline-size: 100%;
		min-block-size: var(--control-min-size);
		font-size: var(--font-size-small);
		font-weight: 500;
		color: var(--color-danger);
		background: var(--color-background);
		border: var(--border-width) solid var(--color-danger);
		border-radius: var(--radius);
	}

	@keyframes spin {
		to {
			transform: rotate(1turn);
		}
	}

	@keyframes sweep {
		from {
			transform: translateX(var(--bar-sweep-from));
		}
		to {
			transform: translateX(var(--bar-sweep-to));
		}
	}

	/* Reduced motion: a slower spinner, and a static full bar in place of the sweep. */
	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation-duration: var(--duration-spinner-reduced);
		}

		.segment {
			animation: none;
			inline-size: 100%;
			opacity: 0.35;
		}
	}
</style>

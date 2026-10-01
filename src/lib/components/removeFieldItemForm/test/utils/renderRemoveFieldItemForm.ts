import RemoveFieldItemForm from '$lib/components/removeFieldItemForm/RemoveFieldItemForm.svelte';
import { RemoveFieldItemFormPropsMock } from '$lib/components/removeFieldItemForm/test/utils/mockremoveFieldItemForm';
import { render } from '@testing-library/svelte';

export function renderRemoveFieldItemForm(props = RemoveFieldItemFormPropsMock[0]) {
	const { getByRole } = render(RemoveFieldItemForm, props);

	return {
		getRemoveButton: () => getByRole('button', { name: props.removeButtonLabel }),
		props,
	};
}

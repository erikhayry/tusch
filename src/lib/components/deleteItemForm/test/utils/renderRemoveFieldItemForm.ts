import { RemoveFieldItemFormPropsMock } from '$lib/components/deleteItemForm/test/utils/mockDeleteItemForm';

import { render } from '@testing-library/svelte';
import DeleteItemForm from '../../DeleteItemForm.svelte';

export function renderRemoveFieldItemForm(props = RemoveFieldItemFormPropsMock[0]) {
	const { getByRole } = render(DeleteItemForm, props);

	return {
		getDeleteButton: () => getByRole('button', { name: props.label }),
		props,
	};
}

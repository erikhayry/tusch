export function formDataOf(entries: Record<string, string>): FormData {
	const formData = new FormData();
	Object.entries(entries).forEach(([key, value]) => formData.set(key, value));
	return formData;
}

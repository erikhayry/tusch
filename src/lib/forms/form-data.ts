const INTEGER_PATTERN = /^-?\d+$/;

export function readString(formData: FormData, name: string): string | undefined {
	const value = formData.get(name);

	return typeof value === 'string' ? value : undefined;
}

export function readCheckbox(formData: FormData, name: string): boolean {
	return formData.has(name);
}

export function readInteger(formData: FormData, name: string): unknown {
	const value = readString(formData, name);

	return value !== undefined && INTEGER_PATTERN.test(value) ? Number(value) : value;
}

export function readJsonField(formData: FormData, name: string): unknown {
	const value = readString(formData, name);
	if (value === undefined) return undefined;

	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
}

export function encodeFormValue(value: unknown): string {
	return typeof value === 'string' ? value : JSON.stringify(value);
}

export function base64ToBlob(base64Data: string) {
	// Extract content type and raw base64 string
	const [header, data] = base64Data.split(',');
	const mimeType = header.match(/:(.*?);/)?.[1];

	// Decode base64
	const binaryString = atob(data);
	const len = binaryString.length;
	const bytes = new Uint8Array(len);

	for (let i = 0; i < len; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}

	return new Blob([bytes], { type: mimeType });
}

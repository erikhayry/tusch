import { base64ToBlob } from './utils/base64ToBlob';

export async function saveImage(fileName: string, base64Data: string) {
	// 1. Get the OPFS root directory handle
	const root = await navigator.storage.getDirectory();

	// 2. Create or access a file in the directory
	const fileHandle = await root.getFileHandle(fileName, { create: true });

	// 3. Convert Base64 to Blob
	const imageBlob = base64ToBlob(base64Data);

	// 4. Create a writable stream and write content
	const writable = await fileHandle.createWritable();
	await writable.write(imageBlob);
	await writable.close();

	return fileName;
}

export async function getImageUrl(fileName: string) {
	try {
		const root = await navigator.storage.getDirectory();
		const fileHandle = await root.getFileHandle(fileName);
		const file = await fileHandle.getFile();
		return URL.createObjectURL(file);
	} catch {
		return '/fallback-placeholder.png'; // Fallback asset URL
	}
}

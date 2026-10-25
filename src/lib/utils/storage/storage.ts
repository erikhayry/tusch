import { generateId } from '../id';
import { base64ToBlob } from './utils/base64ToBlob';

async function getFileHandle(fileName: string, create: boolean = false) {
	const root = await navigator.storage.getDirectory();
	return await root.getFileHandle(fileName, { create });
}

export async function saveBlobImage(fileName: string, imageBlob: Blob) {
	const fileHandle = await getFileHandle(fileName, true);
	const writable = await fileHandle.createWritable();
	await writable.write(imageBlob);
	await writable.close();

	return fileName;
}

export async function saveBase64Image(imageData: string) {
	const imageBlob = base64ToBlob(`data:image/webp;base64,${imageData}`);

	return saveBlobImage(`${generateId()}.webp`, imageBlob);
}

export async function getImageUrl(fileName: string) {
	try {
		const fileHandle = await getFileHandle(fileName);
		const file = await fileHandle.getFile();
		return URL.createObjectURL(file);
	} catch {
		return '/fallback-placeholder.png'; // Fallback asset URL
	}
}

export async function getImage(fileName: string): Promise<string> {
	const fileHandle = await getFileHandle(fileName);
	const file = await fileHandle.getFile();

	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			// reader.result already includes the "data:image/png;base64,..." prefix
			resolve(reader.result as string);
		};

		reader.onerror = () => {
			reject(new Error('Failed to read file'));
		};

		reader.readAsDataURL(file);
	});
}

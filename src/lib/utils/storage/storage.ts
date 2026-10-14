import { base64ToBlob } from './utils/base64ToBlob';

async function getFileHandle(fileName: string, create: boolean = false) {
	const root = await navigator.storage.getDirectory();
	return await root.getFileHandle(fileName, { create });
}

export async function saveImage(fileName: string, base64Data: string) {
	const fileHandle = await getFileHandle(fileName, true);
	const imageBlob = base64ToBlob(base64Data);

	const writable = await fileHandle.createWritable();
	await writable.write(imageBlob);
	await writable.close();

	return fileName;
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

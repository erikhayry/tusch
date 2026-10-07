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

	return getImageUrl(fileName);
}

async function getImageUrl(fileName: string) {
	const root = await navigator.storage.getDirectory();
	const fileHandle = await root.getFileHandle(fileName);

	// Get File object
	const file = await fileHandle.getFile();

	// Create usable image URL
	return URL.createObjectURL(file);
}

// Usage in DOM:
// const imgUrl = await getImageUrlFromOPFS('photo.png');
// document.querySelector('img').src = imgUrl;

async function getFileHandle(fileName: string, create: boolean = false) {
	const root = await navigator.storage.getDirectory();
	return await root.getFileHandle(fileName, { create });
}

export async function saveBlobImage(fileName: string, imageBlob: Blob) {
	const fileHandle = await getFileHandle(fileName, true);
	try {
		const writable = await fileHandle.createWritable();
		await writable.write(imageBlob);
		await writable.close();
	} catch (error) {
		// The entry already exists; remove it so a failed write leaves no stray file
		// (the caller never learns its name, so it can't roll it back).
		await deleteImage(fileName).catch(() => undefined);
		throw error;
	}

	return fileName;
}

export async function readImage(fileName: string): Promise<Blob> {
	const fileHandle = await getFileHandle(fileName);
	return fileHandle.getFile();
}

export async function deleteImage(fileName: string): Promise<void> {
	const root = await navigator.storage.getDirectory();
	try {
		await root.removeEntry(fileName);
	} catch (error) {
		if (error instanceof DOMException && error.name === 'NotFoundError') return;
		throw error;
	}
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

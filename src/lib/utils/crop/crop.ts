import type { Crop } from '$lib/types';

export async function cropImage(uri: string, crop: Crop): Promise<Blob> {
	const image = new Image();

	image.src = uri;
	await image.decode();

	const canvas = document.createElement('canvas');
	canvas.width = crop.width;
	canvas.height = crop.height;

	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Could not create canvas context');
	}

	context.drawImage(
		image,
		crop.x,
		crop.y,
		crop.width,
		crop.height, // source rectangle
		0,
		0,
		crop.width,
		crop.height, // destination rectangle
	);

	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error('Crop failed'))),
			'image/webp',
		);
	});
}

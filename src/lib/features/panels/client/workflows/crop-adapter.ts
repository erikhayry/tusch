import type { Crop } from '$lib/types';
import { cropImage } from '$lib/utils/crop/crop';

export type CropBlob = (source: Blob, crop: Crop) => Promise<Blob>;

export const cropBlob: CropBlob = async (source, crop) => {
	const url = URL.createObjectURL(source);
	try {
		return await cropImage(url, crop);
	} finally {
		URL.revokeObjectURL(url);
	}
};

import { vi } from 'vitest';

vi.mock('$lib/utils/storage/storage.ts', () => ({
	getImageUrl: vi.fn().mockResolvedValue('blob:http://localhost/mock-image-url'),
	saveBlobImage: vi.fn().mockResolvedValue('blob:http://localhost/mock-image-url'),
	readImage: vi.fn().mockResolvedValue(new Blob()),
	deleteImage: vi.fn().mockResolvedValue(undefined),
}));

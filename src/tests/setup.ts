import { vi } from 'vitest';

vi.mock('$lib/utils/storage/storage.ts', () => ({
	getImageUrl: vi.fn().mockResolvedValue('blob:http://localhost/mock-image-url'),
	saveImage: vi.fn().mockResolvedValue('blob:http://localhost/mock-image-url'),
	getImage: vi.fn().mockResolvedValue('data:image/png;base64,'),
}));

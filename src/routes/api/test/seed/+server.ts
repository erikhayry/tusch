import { seedDB } from '$lib/utils/db/db.js';

export async function POST() {
	seedDB();

	return new Response(null, { status: 200 });
}

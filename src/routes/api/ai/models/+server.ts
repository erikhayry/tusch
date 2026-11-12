import { credentialsFromCookies, getAiGateway } from '$lib/server/ai/gateway';
import { toAiGatewayError } from '$lib/server/ai/openai-gateway';
import { AiModelsResponseSchema } from '$lib/types/routeData';
import { error, json } from '@sveltejs/kit';

export const GET = async ({ cookies }) => {
	try {
		const ids = await getAiGateway(credentialsFromCookies(cookies)).models();
		return json(AiModelsResponseSchema.parse({ data: ids.map((id) => ({ id })) }));
	} catch (cause) {
		const failure = toAiGatewayError(cause);
		error(failure.status ?? 502, failure.message);
	}
};

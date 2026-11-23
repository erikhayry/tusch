import { credentialsFromCookies, getAiGateway } from '#lib/server/ai/gateway.ts';
import { toAiGatewayError } from '#lib/server/ai/openai-gateway.ts';
import { AiModelsResponseSchema } from '#lib/types/routeData.ts';
import { error } from '@sveltejs/kit';

export const GET = async ({ cookies }) => {
	try {
		const ids = await getAiGateway(credentialsFromCookies(cookies)).models();
		return Response.json(AiModelsResponseSchema.parse({ data: ids.map((id) => ({ id })) }));
	} catch (cause) {
		const failure = toAiGatewayError(cause);
		error(failure.status ?? 502, failure.message);
	}
};

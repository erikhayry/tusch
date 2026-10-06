import { generateMocks } from '$lib/test/utils/generateMock';
import { SeasonEnum, TimeOfDayEnum } from '$lib/types';
import { InitialComicSchema } from '../aiTypes';

export const aiInitialResponse = generateMocks(InitialComicSchema, 3);

export const InitialComicContentMock = {
	data: {
		characters: [
			{
				id: 'cfb4c17e-4420-4a34-a709-29b16b608a8f',
				name: 'Arbetare',
				description: 'Man',
			},
			{
				id: 'cfb4c17e-4420-4a34-a709-29b16b608a8f',
				name: 'Ordförande',
				description: 'Old Man',
			},
		],
		panels: [
			{
				id: 'cfb4c17e-4420-4a34-a709-29b16b608a8f',
				dialogue: [
					{
						text: 'Arbetare: Vi kräver bättre villkor och rätten att organisera oss.',
						characterId: 'cfb4c17e-4420-4a34-a709-29b16b608a8f',
					},
				],
				captions: ['Ådalen, Sverige – den 14 maj 1931. En vårdag som snart blir historisk.'],
				visualDescription: 'visual mock',
				year: 1931,
				place: 'Ådalen',
				timeOfDay: TimeOfDayEnum.enum.afternoon,
				season: SeasonEnum.enum.summer,
			},
			{
				id: 'cfb4c17e-4420-4a34-a709-29b16b608a8f',
				dialogue: [
					{
						text: 'Ordförande: Låt våra röster höras!',
						characterId: 'cfb4c17e-4420-4a34-a709-29b16b608a8f',
					},
					{
						text: 'Arbetare: Vi står enade!',
						characterId: 'cfb4c17e-4420-4a34-a709-29b16b608a8f',
					},
				],
				captions: ['Demonstrationen närmar sig platsen längs dalgångens väg.'],
				visualDescription: 'visual mock',
				year: 1931,
				place: 'Ådalen',
				timeOfDay: TimeOfDayEnum.enum.afternoon,
				season: SeasonEnum.enum.summer,
			},
		],
		title: 'Ådals händelserna – serietecknad lösning (fiktiv tolkning)',
	},
};

export const CreatePanelContentMock = {
	data: {
		id: 'cfb4c17e-4420-4a34-a709-29b16b608a8f',
		dialogue: [
			{
				text: 'Ådalen, Sverige – den 14 maj 1931. En vårdag som snart blir historisk.',
				characterId: 'cfb4c17e-4420-4a34-a709-29b16b608a8f',
			},
		],
		captions: ['Ådalen, Sverige – den 14 maj 1931. En vårdag som snart blir historisk.'],
		visualDescription: 'visual mock',
		year: 1931,
		place: 'Ådalen',
		timeOfDay: TimeOfDayEnum.enum.afternoon,
		season: SeasonEnum.enum.summer,
	},
};

function createMessageResponse(content: unknown) {
	return {
		id: 'mock-gen-123',
		model: 'gpt-6-luna',
		output: [
			{
				id: 'rs_0486fa8154366c44006ac38066d99887d2badf9c0dbfba75d7',
				type: 'reasoning',
				content: [],
				encrypted_content: '',
				summary: [],
			},
			{
				id: 'msg_0486fa8154366c44006ac3806c5e5c87d2a1f2e51a9f4abb88',
				type: 'message',
				status: 'completed',
				content: [
					{
						type: 'output_text',
						annotations: [],
						logprobs: [],
						text: JSON.stringify(content),
					},
				],
				phase: 'final_answer',
				role: 'assistant',
			},
		],
	};
}

export const mockOpenAiInitComicResponse = createMessageResponse(InitialComicContentMock);
export const mockOpenAiCreatePanelResponse = createMessageResponse(CreatePanelContentMock);

export const imageResulSrcMock =
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

export const imageDataMock = {
	alt: 'En mångsidig grupp byggarbetare i skyddshjälmar och reflexvästar står tillsammans på en byggarbetsplats.',
	width: 1024,
	height: 1536,
};

export const mockOpenAiImageResponse = {
	id: 'resp_07184e8e23181516006ac3bc3d134887d2bc925e022278d08d',
	object: 'response',
	created_at: 1791212605,
	status: 'completed',
	access_programs: null,
	background: false,
	billing: {
		payer: 'openai',
	},
	completed_at: 1791212624,
	error: null,
	frequency_penalty: 0,
	incomplete_details: null,
	instructions: null,
	max_output_tokens: null,
	max_tool_calls: null,
	model: 'gpt-6-luna',
	moderation: null,
	output: [
		{
			id: 'rs_07184e8e23181516006ac3bc3df7f087d2b270dbed56d858a5',
			type: 'reasoning',
			content: [],
			encrypted_content:
				'gAAAAABqw7xRfYS7VqM-RIY5xggy8vpQph8moy5B6AoYCV_LlDgxfTeeklSHE3A3d4iINeYV43r4I4eKfDMz9wBAL7M1EBgl8N1LurF23GX2CYqQpXSuKgXES_-EAJ16c_LzcB6ajSgMEZYQqlctHmC18xHaPqFQI1A7AOxAqzM3lxeVfkoDPyvXj-IMoqoez727Yb4uIKMDPT7v9E9G6y2cVG2-2Okwaaw78-IRItIeETIw4-WIeQ8tbYuhYoo2B6Ugeixhu0314-s7R12OcPfC4GVnaJC2KpxDbI_s-DFkHMBPgO7kmqOLT0X2vJhw6BPc5Svw4gPm-NiHYSQv908uV972UcT9AR5JHGZGWYp88PV1O4tqQzMEeRv5MfiGwBWd-yMKdfKb4T4nZIT2K6GEQjCdG190BcWMj-Nw1szWIyK9SYp3-K_Y6I1jLCbvLfODyV64IUvkAtiIvPogJohjN-a6UCL_78jTx654WjhJHgykDKJ-kW204iGsm_gvIKSesj48QsEEENs9V_gXuBl3dck4UEaySjkDzK3Z1KHNP_dcj6iETe5s5BnzVIWcn0bndMYgb1diTk4tVO4fPwzLbm3zXmKjTM2QQ5CS9OR7ckM7sOpvVpDOBmE0-boL5Jb9CGhu4yWKWE66hQMa6lLkdaxQSDnhgU6S9jw4A0YRKthvdaq0jWM0djW5qSVkK4xJMyfdJzWs_WqHzxt73ZojlBlpSkJ_AMVF8_duurmV-dN-_5pDdU3eqVIvf6U1YiROzoy9gbewhpyXYqgqfUuDuW176XjAlLYal0L_2iU5bD05rfMT1vIDVqqvRjA3f4Yxtcgbc4ZOmPvaCsSOPGflgf8eNNM6SFseQYP9gdeZrCrROtA7IgrOBB2QPDS4vWvK-VFKyqubcvPwl4ueo_FTV1a8uC8m7oIhFQmDt2A2IoKB9rT0g5ECmCzK8OydTYfUr2XPMgD9KiwDLP-EtDT3aTU6XFCyIesBRKgywHt-t-phHlvGLyGTCtV3KhwnswoHez9YyNBciefEZ7vSYdNGoDFR5DDWpGU0ODKMjco2fo1UraTtB9wBjIzHpcyRQG1hgS6T1JtjY3Btxnonv3DQT-EjmKR0z57NsgpivKlvREtFVYXG3H9XwE4NADB1sYX_Nfo3Iw9HqJd8_yFZYLLwtA87Yhy60vZQH_MwLzVffnSdPR1unTidKzRA3DUKn7YsKubvnGPcT3g_PabkiZqo6ru6tNLBN5BGFdFCikPhbnv3_r5uwfCsZYvTSMB70kZOPL-QEJZC17zypn2xwC1yd_23zs8iU0h0Vowuob1c_ealTlCy1Xm264NmnO2vUWIj3hH-tYmn4xU3H8YI-214ZURsziDpevljq89FrCuTfOV9uDILgG5ovzxBL4v9Otfbu9pZrSr78393JSpltLEFtq3ku5nQzEFeW8FI8MdryXY5V8ZSZjU=',
			summary: [],
		},
		{
			id: 'ig_07184e8e23181516006ac3bc3e745c87d2aedb24b78c9df4e6',
			type: 'image_generation_call',
			status: 'completed',
			action: 'generate',
			background: 'opaque',
			output_format: 'webp',
			quality: 'low',
			result: imageResulSrcMock,
			revised_prompt:
				'A single comic-book panel showing a diverse group of workers standing together in a loose cluster, wearing practical work clothes and safety gear such as hard hats, reflective vests, and tool belts. Friendly determined expressions, varied ages and appearances. Bold clean ink outlines, expressive faces, vivid flat colors, subtle halftone shading, dynamic but readable composition. Simple workplace background, no speech bubbles, no lettering, no text, no logos.',
			size: '1024x1536',
		},
		{
			id: 'rs_07184e8e23181516006ac3bc4d627c87d281272da0ca8c4e35',
			type: 'reasoning',
			content: [],
			encrypted_content:
				'gAAAAABqw7xRgCzW2MdW682-7bZBH0W97ASIhskHJtag_SbfQBRG_-kH7X6JLNrTSPj6tH7MoGobWA4R4wwmJGtvW1JDSgsVI2inYIs0lidEzyNOJ3xYB_7yiraAHnI6qz62MVHXhi-ouzk6mvDB6yySq7etvh9yEpFSBJjFYzLKRe8y-BPmE0blgF2bWxT4AHlTfTlUJth5L6QFABOOJjPjhBFfMyt6Fej8QsE4wdK2aSfV3x3B6DHLUwKTjaCAqbLSar-AhcKN_beuRiA6qbFKxaPnGysO7ZvtbbjvCmrE-3P5cKckwlhRi13LxHBozg0hHofmGzI4htUy8sM0iUr9UtmBnVJKMf8ImpIQvj-JgqO3kSQZyIu7wRJnvGGs-dCeNqbqIaxC_pyGgOBDr2Ie1dLloWqe5k7I1yCJ_URMlAzEb0E2DLF0QOWW_Ie2fEJUdf0JrvwBwe3g3kerXQtwe6IkCyJKdKgPjf615RmSmHu1wENua2Ehsf0yOAERLvsogjGnxM20Ny5aAZ2B8zWW4kAIe73FCNmxjpWB7Gr3kopUaPqEQ-4UsKoljwDAkc6gQb9bPKnFTa_louISoJ4vXhEwhfSDTaNBK4sb5IFvnMDYqRVsZu6XgVbCRoKez6bAW5pUY6vEHm9BuDKy90J6fFlJ-Ey1GeDVCaraBI4YDcNw1G3miIz_ceMEOQRTiIHLwS84SduMqjGc82EPOqi2yZeNAQFuuQkluab8UGK5c3iVpbbDuV1hOpa2IKrTB12fnamZ5hpSzylVxpkdUExM5td014JDiVqIIOwImE7pAVNn2dDg5NvshApNCSGwAYyaWmpva1wAYT5pueOKqBzR4nR0G37DoTKW71OCcopQtu6rB4GDfxdd6L1wIB4cPtiD8vDLRmMdV0Mj_uzDquknbSrs1X8tD9TTKAPo4OCQvdZgNuGnJmb6A48RbeNtmHmMPs-VAqZNV4stdVqlRUi2GDE3IcsFDsck2iVwViXmN0TEyx3PuLX1nFJuAU3iWWKwypUw-ELRWUyZBzVwtzas-Onrx3rab1SFPKBZnDW5Eee3glNsMcw0z1aiR7NyOIJDiTfs9jywg4F6IZsS8l_qP-LCLwezPbwMzMYm_M23781dA0tN55iaWJ5QgM7CDCmtPdmnzmIRJYLUoSDYwWJjh-5TD4v0xrU1aB6BhgLnV443jN3YbT22O7B1vh2OChS6aWmgCLwMQ7L5I-OcFXx7ep3nNpqlR5NqtKu1OIG6xkbpJIwyyfHxf30j7UwYsnsEVqWLbo4ny8oAFwGsvyvynq3E_OI7_7XOwb9u96PL16XHAlwvUqfqoJ_r4cJvv4J8KuNjSK9_VgskttcFj4s99ap5jqwcY3gpsq8wgQ4V28Ny3TQ-gK9VNgEod2Y_E9jxfs7mByXzPXc9Mddbk855o029tOtSfyYbEBfNyys3Rjva9o5biuG02w4GA4QHiuQXxeUZXHzJo3vF63bZgL86FPmThVZwdqRC4mehuOAF3WLBEnlWmj3TCamaqGiX1hAVwnmVGiiOdFGuubEIAQFNJoU3xmx_xUO-YuDahRh7JFL_OkUA505qm5PCC9oYYKtsudQO15c1zhsN8ag4-pv3Z76pEcL_n1llZt0pPItsdNtkhWg6RjLveEmD-5_ryliATKoiaVoO38TaJgOFU6heItsajHCILs7c6DIfVh7lPJltbx7urhRqu34CljsuAQ_NuIaATb6qggRno3YH7i0t66aIn5BqPYqqJumewSz5k8zqw1D4XUx2Rb32PBSaGia_2Nhxx9VSRGYDlxXDkekYzhv2Uc0ti7jGG6nTdjYZi-3b37X2Laj8CIh1ob-hdX9iYKBmfZJR48ulU_6Do3sBVv71srmhAHY7hFyMEtTyUsobtCxV9achynjeruGOF8_IS7_ZPNlFLvLS9yX-1nOu8ynCFlWH7sMsHZr83WHKy4cHKrI9yRYUwFFaW4Ej-h3w7LF4y_fnt4XHVjuIDCfJWfpfK95vZAqavP3FiFMywYJHiRvNbZ9IdSAbnQX06oHm-nLcw7IDw1Ne1I6_NbvMKP3nEWy35Q6C_fndONR1cGInKAYALpZHh7buU8lQYkqnimePEJdd8wYhkP0ua54_FBzDx-ulJ6jO3p6OOsxXUDpp1QI8tZ6FLQxhNOXS9b3k5AVhet4-BnXnLpLW7aZbEHX2nPMH2tAfKifdXRT9ynuoGSlWpjKQJX3Wv6-ukYBiYKQgiyO67ePojDq13tbi3RO5CZBIjlCKMvTllY5exD7leEZoi6wzpO6KMgjHm3NcfLeikf7P_Qe9DBTVVkTB5Aay-cSXhvNNZkA_ayoqX1WoC6k_2ULDptjQ1LIFdubnsthdX51MIxXXWfnas4cBYFzSUul7XSaVpppg7w2Uv6XwZ6HaC36LbYlaXFkk2-OtYOSNLNwghI4PQjfFyGV4oFoXj1sj3Xnixe9EvczsHFYYKjca5IxSxX2skuy6AYB9awEBYZmQWNP6OV8h8-IbLVYWpyz9bYRIXADQizru1tP3ZHWphjEMJaIQ02IOAoBTe5M3DHF4Tn7EgfW1UxmjOWk4rUdsgccz_xgmH99NR8nfSulNdsxAqP7x5VGXHeVwzu5m6WQsQ6ln-xxF3O_sM7nDgVMlm7S_VhEikHfCJu4ETLDHYSoNqlsn4Krfxnqtb_1NAgRKO77hDC9uIaeP_Fb9ZQrG3sHJT1wNvJPC5AwBobGvzA8nNDVb_NmdYWEGi3DCxJgwuTuz26Dk7LuFlQQc16c1_M9cKI89BU9XCLrwg62H9kgXSJXgqY0lPln-aw04DxN6rhiu9JAL0pSazdXdJOxCZDn6m9UI5bAHj6Z2XkTxjI1VMj0396jIOqxGu2gFd8GL7eLuZtpOhYkacZaAj4dMQIDQe9FA2rQGIZviaEZc8NnjlYn7ARmp2LvZX6f9zhYH29CvGH7jtWEzpagt_sABM25yWJ4lUozPAaii_F_uC3bpmaQjUI5W10YmOihHC22vObE_8XEcH7iMZjxzkPy41g6xjjbJi2sZI_NhQe_AYOG0ly5ZJww5r41m_X4C_SYOMiPYWY0F9O__dSA1PMexGq5RkAkTSw2VewihxxVR863Ieb7_wyil5aMf8ZTjuYGG7rr1wBlJ00vO8RkiXxQ6RA==',
			summary: [],
		},
		{
			id: 'msg_07184e8e23181516006ac3bc503f8c87d284cf4a7c10028e37',
			type: 'message',
			status: 'completed',
			content: [
				{
					type: 'output_text',
					annotations: [],
					logprobs: [],
					text: `{"data":${JSON.stringify(imageDataMock)}}`,
				},
			],
			phase: 'final_answer',
			role: 'assistant',
		},
	],
	parallel_tool_calls: true,
	presence_penalty: 0,
	previous_response_id: null,
	prompt_cache_key: null,
	prompt_cache_retention: '24h',
	reasoning: {
		context: 'all_turns',
		effort: 'medium',
		mode: 'standard',
		summary: null,
	},
	safety_identifier: null,
	service_tier: 'default',
	store: true,
	temperature: 1,
	text: {
		format: {
			type: 'json_schema',
			description: null,
			name: 'schema',
			schema: {
				type: 'object',
				properties: {
					data: {
						type: 'object',
						properties: {
							src: {
								type: 'string',
							},
							alt: {
								type: 'string',
							},
							width: {
								type: 'number',
							},
							height: {
								type: 'number',
							},
						},
						required: ['src', 'alt', 'width', 'height'],
						additionalProperties: false,
					},
				},
				required: ['data'],
				additionalProperties: false,
			},
			strict: true,
		},
		verbosity: 'medium',
	},
	tool_choice: 'auto',
	tool_usage: {
		image_gen: {
			input_tokens: 93,
			input_tokens_details: {
				image_tokens: 0,
				text_tokens: 93,
			},
			output_tokens: 158,
			output_tokens_details: {
				image_tokens: 158,
				text_tokens: 0,
			},
			total_tokens: 251,
		},
		web_search: {
			num_requests: 0,
		},
	},
	tools: [
		{
			type: 'image_generation',
			background: 'opaque',
			model: 'gpt-image-2.5-flare',
			moderation: 'auto',
			n: 1,
			output_compression: 100,
			output_format: 'webp',
			quality: 'low',
			size: '1024x1536',
		},
	],
	top_logprobs: 0,
	top_p: 0.98,
	truncation: 'disabled',
	usage: {
		input_tokens: 2449,
		input_tokens_details: {
			cache_write_tokens: 0,
			cached_tokens: 0,
		},
		output_tokens: 497,
		output_tokens_details: {
			reasoning_tokens: 343,
		},
		total_tokens: 2946,
	},
	user: null,
	metadata: {},
};

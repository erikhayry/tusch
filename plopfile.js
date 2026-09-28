export default function (plop) {
	plop.setGenerator('entity', {
		description: 'Generates a new Svelte entity component (like Character, Monster, etc.)',
		prompts: [
			{
				type: 'input',
				name: 'name',
				message: 'What is the name of the entity? (e.g., Character, Monster, Npc)',
			},
		],
		actions: [
			{
				type: 'add',
				path: 'src/lib/components/{{camelCase name}}/{{pascalCase name}}.svelte',
				templateFile: 'plop-templates/component/component.svelte.hbs',
			},
			{
				type: 'add',
				path: 'src/lib/components/{{camelCase name}}/{{camelCase name}}Types.ts',
				templateFile: 'plop-templates/component/types.ts.hbs',
			},
			{
				type: 'add',
				path: 'src/lib/components/{{camelCase name}}/test/{{pascalCase name}}.svelte.spec.ts',
				templateFile: 'plop-templates/component/test.svelte.spec.ts.hbs',
			},
			{
				type: 'add',
				path: 'src/lib/components/{{camelCase name}}/test/utils/mock{{camelCase name}}.ts',
				templateFile: 'plop-templates/component/mock.ts.hbs',
			},
			{
				type: 'add',
				path: 'src/lib/components/{{camelCase name}}/test/utils/render{{pascalCase name}}.ts',
				templateFile: 'plop-templates/component/render.ts.hbs',
			},
		],
	});
}

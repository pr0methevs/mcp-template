import { type Tool } from './types';

export const availableTools: Tool[] = [
	{
		name: 'echo',
		description: 'Echoes back the provided message',
		inputSchema: {
			type: 'object',
			properties: {
				message: {
					type: 'string',
					description: 'The message to echo back'
				}
			},
			required: ['message']
		}
	},
	{
		name: 'add',
		description: 'Adds two numbers together',
		inputSchema: {
			type: 'object',
			properties: {
				a: {
					type: 'number',
					description: 'First number'
				},
				b: {
					type: 'number',
					description: 'Second number'
				}
			},
			required: ['a', 'b']
		}
	},
	{
		name: 'get_time',
		description: 'Returns the current server time',
		inputSchema: {
			type: 'object',
			properties: {}
		}
	}
];

export async function executeTool(name: string, args: Record<string, any>): Promise<any> {
	switch (name) {
		case 'echo':
			return {
				content: [
					{
						type: 'text',
						text: args.message
					}
				]
			};

		case 'add':
			const sum = args.a + args.b;
			return {
				content: [
					{
						type: 'text',
						text: `The sum of ${args.a} and ${args.b} is ${sum}`
					}
				]
			};

		case 'get_time':
			return {
				content: [
					{
						type: 'text',
						text: new Date().toISOString()
					}
				]
			};

		default:
			throw new Error(`Unknown tool: ${name}`);
	}
}

export function validateToolArgs(tool: Tool, args: Record<string, any>): void {
	const required = tool.inputSchema.required || [];

	for (const field of required) {
		if (!(field in args)) {
			throw new Error(`Missing required argument: ${field}`);
		}
	}

	for (const [key, value] of Object.entries(args)) {
		const schema = tool.inputSchema.properties[key];
		if (!schema) {
			throw new Error(`Unknown argument: ${key}`);
		}

		if (schema.type === 'number' && typeof value !== 'number') {
			throw new Error(`Argument ${key} must be a number`);
		}
		if (schema.type === 'string' && typeof value !== 'string') {
			throw new Error(`Argument ${key} must be a string`);
		}
	}
}

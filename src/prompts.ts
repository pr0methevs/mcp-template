import { type Prompt } from './types';

export const availablePrompts: Prompt[] = [
	{
		name: 'summarize',
		description: 'Summarize the given content',
		arguments: [
			{
				name: 'content',
				description: 'The content to summarize',
				required: true
			},
			{
				name: 'length',
				description: 'How brief the summary should be (short, medium, long)',
				required: false
			}
		]
	},
	{
		name: 'analyze_sentiment',
		description: 'Analyze the sentiment of the provided text',
		arguments: [
			{
				name: 'text',
				description: 'The text to analyze',
				required: true
			}
		]
	},
	{
		name: 'generate_ideas',
		description: 'Generate creative ideas for a given topic',
		arguments: [
			{
				name: 'topic',
				description: 'The topic to generate ideas for',
				required: true
			},
			{
				name: 'count',
				description: 'Number of ideas to generate',
				required: false
			}
		]
	}
];

export async function getPrompt(name: string, args?: Record<string, any>): Promise<any> {
	const prompt = availablePrompts.find(p => p.name === name);

	if (!prompt) {
		throw new Error(`Prompt not found: ${name}`);
	}

	// Validate required arguments
	if (prompt.arguments) {
		for (const arg of prompt.arguments) {
			if (arg.required && (!args || !(arg.name in args))) {
				throw new Error(`Missing required argument for prompt '${name}': ${arg.name}`);
			}
		}
	}

	// Generate prompt content based on name and arguments
	const messages = generatePromptMessages(name, args || {});

	return {
		messages
	};
}

function generatePromptMessages(name: string, args: Record<string, any>): Array<{
	role: string;
	content: string;
}> {
	switch (name) {
		case 'summarize':
			return [
				{
					role: 'user',
					content: `Please summarize the following content${args.length ? ` in a ${args.length} format` : ''}:\n\n${args.content}`
				}
			];

		case 'analyze_sentiment':
			return [
				{
					role: 'user',
					content: `Please analyze the sentiment of the following text and provide a detailed analysis:\n\n${args.text}`
				}
			];

		case 'generate_ideas':
			return [
				{
					role: 'user',
					content: `Generate ${args.count || 5} creative ideas for the following topic: ${args.topic}`
				}
			];

		default:
			throw new Error(`Unknown prompt: ${name}`);
	}
}

export function validatePromptArgs(prompt: Prompt, args?: Record<string, any>): void {
	if (!prompt.arguments) return;

	for (const arg of prompt.arguments) {
		if (arg.required && (!args || !(arg.name in args))) {
			throw new Error(`Missing required argument: ${arg.name}`);
		}
	}
}
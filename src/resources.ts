import { type Resource } from './types';

export const availableResources: Resource[] = [
	{
		uri: 'memory://scratch',
		name: 'Scratch Pad',
		description: 'A temporary scratch pad for notes and ideas',
		mimeType: 'text/plain'
	},
	{
		uri: 'memory://context',
		name: 'Context Storage',
		description: 'Stores conversation context and state',
		mimeType: 'application/json'
	},
	{
		uri: 'file://config',
		name: 'Configuration',
		description: 'Server configuration and settings',
		mimeType: 'application/json'
	}
];

// In-memory storage for resources
const resourceStorage: Record<string, string> = {
	'memory://scratch': '',
	'memory://context': '{}',
	'file://config': JSON.stringify({ version: '1.0.0', debug: false })
};

export async function readResource(uri: string): Promise<any> {
	const resource = availableResources.find(r => r.uri === uri);

	if (!resource) {
		throw new Error(`Resource not found: ${uri}`);
	}

	const content = resourceStorage[uri] || '';

	return {
		contents: [
			{
				uri,
				mimeType: resource.mimeType,
				text: content
			}
		]
	};
}

export async function writeResource(uri: string, content: string): Promise<any> {
	const resource = availableResources.find(r => r.uri === uri);

	if (!resource) {
		throw new Error(`Resource not found: ${uri}`);
	}

	// Don't allow writing to file:// resources
	if (uri.startsWith('file://')) {
		throw new Error(`Cannot write to read-only resource: ${uri}`);
	}

	resourceStorage[uri] = content;

	return {
		contents: [
			{
				uri,
				mimeType: resource.mimeType,
				text: content
			}
		]
	};
}

export function validateResourceUri(uri: string): void {
	if (!availableResources.some(r => r.uri === uri)) {
		throw new Error(`Unknown resource: ${uri}`);
	}
}
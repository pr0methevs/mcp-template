import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

// In-memory storage for resources
const resourceStorage: Record<string, string> = {
	'memory://scratch': '',
	'memory://context': '{}',
	'file://config': JSON.stringify({ version: '1.0.0', debug: false })
};

export function registerResources(server: McpServer) {
	server.resource(
		"scratch-pad",
		"memory://scratch",
		{
			mimeType: "text/plain",
			description: "A temporary scratch pad for notes and ideas"
		},
		async (uri) => ({
			contents: [{
				uri: uri.href,
				mimeType: "text/plain",
				text: resourceStorage["memory://scratch"]
			}]
		})
	);

	server.resource(
		"context-storage",
		"memory://context",
		{
			mimeType: "application/json",
			description: "Stores conversation context and state"
		},
		async (uri) => ({
			contents: [{
				uri: uri.href,
				mimeType: "application/json",
				text: resourceStorage["memory://context"]
			}]
		})
	);

	server.resource(
		"configuration",
		"file://config",
		{
			mimeType: "application/json",
			description: "Server configuration and settings"
		},
		async (uri) => ({
			contents: [{
				uri: uri.href,
				mimeType: "application/json",
				text: resourceStorage["file://config"]
			}]
		})
	);
}
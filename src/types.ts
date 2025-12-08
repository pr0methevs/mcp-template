export interface MCPRequest {
	jsonrpc: '2.0';
	id?: string | number;
	method: string;
	params?: Record<string, any>;
}

// Most types are now provided by @modelcontextprotocol/sdk
// Keeping this file for any custom application-specific types if needed, 
// otherwise it can be empty or removed.

export interface ServerCapabilities {
	tools?: {};
	resources?: {};
	prompts?: {};
}

export interface InitializeResult {
	protocolVersion: string;
	capabilities: ServerCapabilities;
	serverInfo: {
		name: string;
		version: string;
	};
}

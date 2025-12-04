import { Response } from 'express';

export interface MCPRequest {
	jsonrpc: '2.0';
	id?: string | number;
	method: string;
	params?: Record<string, any>;
}

export interface MCPResponse {
	jsonrpc: '2.0';
	id?: string | number;
	result?: any;
	error?: MCPError;
}

export interface MCPError {
	code: number;
	message: string;
	data?: any;
}

export interface MCPNotification {
	jsonrpc: '2.0';
	method: string;
	params?: Record<string, any>;
}

export interface Tool {
	name: string;
	description: string;
	inputSchema: {
		type: 'object';
		properties: Record<string, any>;
		required?: string[];
	};
}

export interface Resource {
	uri: string;
	name: string;
	description?: string;
	mimeType?: string;
}

export interface SSEConnection {
	id: string;
	res: Response;
	createdAt: Date;
}

export interface ServerCapabilities {
	tools?: {};
	resources?: {};
	prompts?: {};
}

export interface InitializeParams {
	protocolVersion: string;
	capabilities: {
		roots?: { listChanged?: boolean };
		sampling?: {};
	};
	clientInfo: {
		name: string;
		version: string;
	};
}

export interface InitializeResult {
	protocolVersion: string;
	capabilities: ServerCapabilities;
	serverInfo: {
		name: string;
		version: string;
	};
}

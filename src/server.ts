import { Request, Response } from 'express';
import {
	MCPRequest,
	MCPResponse,
	SSEConnection,
	InitializeParams,
	InitializeResult
} from './types';
import { availableTools, executeTool, validateToolArgs } from './tools';

export class MCPServer {
	private connections: Map<string, SSEConnection> = new Map();
	private messageIdCounter = 0;

	constructor(
		private serverName: string = 'mcp-express-server',
		private serverVersion: string = '1.0.0'
	) { }

	handleSSEConnection(req: Request, res: Response): void {
		const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		res.setHeader('Content-Type', 'text/event-stream');
		res.setHeader('Cache-Control', 'no-cache');
		res.setHeader('Connection', 'keep-alive');
		res.setHeader('X-Accel-Buffering', 'no');

		const connection: SSEConnection = {
			id: connectionId,
			res,
			createdAt: new Date()
		};

		this.connections.set(connectionId, connection);
		console.log(`SSE connection established: ${connectionId}`);

		res.write(`event: connected\ndata: ${JSON.stringify({ connectionId })}\n\n`);

		req.on('close', () => {
			this.connections.delete(connectionId);
			console.log(`SSE connection closed: ${connectionId}`);
		});
	}

	async handleMessage(req: Request, res: Response): Promise<void> {
		try {
			const request = req.body as MCPRequest;
			console.log('Received request:', JSON.stringify(request, null, 2));

			const response = await this.processRequest(request);
			console.log('Sending response:', JSON.stringify(response, null, 2));

			res.json(response);
		} catch (error) {
			console.error('Error handling message:', error);
			const errorResponse: MCPResponse = {
				jsonrpc: '2.0',
				id: req.body.id,
				error: {
					code: -32603,
					message: error instanceof Error ? error.message : 'Internal error'
				}
			};
			res.status(500).json(errorResponse);
		}
	}

	private async processRequest(request: MCPRequest): Promise<MCPResponse> {
		switch (request.method) {
			case 'initialize':
				return this.handleInitialize(request);

			case 'tools/list':
				return this.handleToolsList(request);

			case 'tools/call':
				return this.handleToolsCall(request);

			case 'ping':
				return this.handlePing(request);

			default:
				return {
					jsonrpc: '2.0',
					id: request.id,
					error: {
						code: -32601,
						message: `Method not found: ${request.method}`
					}
				};
		}
	}

	private handleInitialize(request: MCPRequest): MCPResponse {
		const params = request.params as InitializeParams;

		const result: InitializeResult = {
			protocolVersion: '2024-11-05',
			capabilities: {
				tools: {}
			},
			serverInfo: {
				name: this.serverName,
				version: this.serverVersion
			}
		};

		return {
			jsonrpc: '2.0',
			id: request.id,
			result
		};
	}

	private handleToolsList(request: MCPRequest): MCPResponse {
		return {
			jsonrpc: '2.0',
			id: request.id,
			result: {
				tools: availableTools
			}
		};
	}

	private async handleToolsCall(request: MCPRequest): Promise<MCPResponse> {
		try {
			const { name, arguments: args } = request.params as { name: string; arguments: Record<string, any> };

			const tool = availableTools.find(t => t.name === name);
			if (!tool) {
				return {
					jsonrpc: '2.0',
					id: request.id,
					error: {
						code: -32602,
						message: `Tool not found: ${name}`
					}
				};
			}

			validateToolArgs(tool, args || {});
			const result = await executeTool(name, args || {});

			return {
				jsonrpc: '2.0',
				id: request.id,
				result
			};
		} catch (error) {
			return {
				jsonrpc: '2.0',
				id: request.id,
				error: {
					code: -32602,
					message: error instanceof Error ? error.message : 'Invalid params'
				}
			};
		}
	}

	private handlePing(request: MCPRequest): MCPResponse {
		return {
			jsonrpc: '2.0',
			id: request.id,
			result: {}
		};
	}

	broadcastNotification(method: string, params?: Record<string, any>): void {
		const notification = {
			jsonrpc: '2.0',
			method,
			params
		};

		const data = `event: notification\ndata: ${JSON.stringify(notification)}\n\n`;

		for (const [id, connection] of this.connections) {
			try {
				connection.res.write(data);
			} catch (error) {
				console.error(`Failed to send to connection ${id}:`, error);
				this.connections.delete(id);
			}
		}
	}

	getConnectionCount(): number {
		return this.connections.size;
	}
}

import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MCPServer } from './server';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors());
app.use(express.json());

const mcpServer = new MCPServer(
	process.env.SERVER_NAME || 'mcp-express-server',
	process.env.SERVER_VERSION || '1.0.0'
);

app.get('/health', (req: Request, res: Response) => {
	res.json({
		status: 'healthy',
		timestamp: new Date().toISOString(),
		connections: mcpServer.getConnectionCount()
	});
});

app.get('/sse', (req: Request, res: Response) => {
	mcpServer.handleSSEConnection(req, res);
});

app.post('/message', async (req: Request, res: Response) => {
	await mcpServer.handleMessage(req, res);
});

app.get('/', (req: Request, res: Response) => {
	res.json({
		name: 'MCP Server',
		version: '1.0.0',
		endpoints: {
			health: 'GET /health',
			sse: 'GET /sse',
			message: 'POST /message'
		},
		documentation: 'https://modelcontextprotocol.io'
	});
});

app.listen(PORT, () => {
	console.table([
		{ Name: "MCP Server", URL: `http://${HOST}:${PORT}` },
  		{ Name: "Health check", URL: `http://${HOST}:${PORT}/health` },
		{ Name: "SSE endpoint", URL: `http://${HOST}:${PORT}/sse` },
		{ Name: "Message endpoint", URL: `http://${HOST}:${PORT}/message` },
	]);
});

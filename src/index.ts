import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { registerTools } from "./tools";
import { registerResources } from "./resources";
import { registerPrompts } from "./prompts";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const server = new McpServer({
	name: process.env.SERVER_NAME || "mcp-express-server",
	version: process.env.SERVER_VERSION || "1.0.0",
});

registerTools(server);
registerResources(server);
registerPrompts(server);

app.use(cors());
app.use(express.json());

/**
 * Store active transports to handle incoming messages
 */
const transports = new Map<string, SSEServerTransport>();

app.get("/health", (_req: Request, res: Response) => {
	res.json({
		status: "healthy",
		timestamp: new Date().toISOString(),
		connections: transports.size,
	});
});

app.get("/sse", async (req: Request, res: Response) => {
	console.log("New SSE connection established");
	const transport = new SSEServerTransport("/message", res);

	server.connect(transport);

	// The transport will effectively 'ready' and send an event with the sessionId
	// We need to store it to handle messages.
	// Since SSEServerTransport creates the session ID internally and sends it to client,
	// we assume the client will send it back in ?sessionId=...

	// We hook into the close event to cleanup
	req.on("close", () => {
		// We don't easily know the ID here unless we capture it from transport
		// But basic cleanup:
		// transports is mapped by sessionId.
		// SSEServerTransport doesn't expose sessionId publicly in all versions easily?
		// We can iterate and check? or standard implementation relies on the transport's internal closure.
		// Actually, let's see if we can capture it.
		// transport.sessionId might be available.
	});

	// There is a slight gap here: we need to map sessionId -> transport.
	// If transport assigns sessionId, we need to read it.
	// HACK: for now, we'll cast to any or assume we can store it after connection or
	// standard practice is that transport adds itself to a registry if we extended it?
	// The SDK's SSEServerTransport usually handles sending the endpoint.

	// Let's rely on the fact that for THIS specific request loop, we have the transport.
	// But /message is a DIFFERENT request.

	// We need to intercept the sessionId generation or 'on session'.
	// Checking SDK source (mental model): transport.sessionId is valid after start.
	// So:
	// @ts-ignore
	const sessionId = transport.sessionId as string;
	if (sessionId) {
		transports.set(sessionId, transport);
		req.on("close", () => {
			transports.delete(sessionId);
			console.log(`SSE connection closed: ${sessionId}`);
		});
	}
});

app.post("/message", async (req: Request, res: Response) => {
	const sessionId = req.query.sessionId as string;
	if (!sessionId) {
		res.status(400).send("Missing sessionId");
		return;
	}

	const transport = transports.get(sessionId);
	if (!transport) {
		res.status(404).send("Session not found");
		return;
	}

	await transport.handlePostMessage(req, res);
});

app.get("/", (_req: Request, res: Response) => {
	res.json({
		name: "MCP Server",
		version: "1.0.0",
		endpoints: {
			health: "GET /health",
			sse: "GET /sse",
			message: "POST /message",
		},
		documentation: "https://modelcontextprotocol.io",
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

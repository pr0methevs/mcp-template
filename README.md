# MCP Express Server

A Model Context Protocol (MCP) server implementation using TypeScript, Express.js, and Server-Sent Events (SSE) for real-time communication.

## Features

- **MCP Protocol Support**: Implements the Model Context Protocol specification
- **SSE Transport**: Real-time communication using Server-Sent Events
- **TypeScript**: Fully typed for better developer experience
- **Express.js**: Robust HTTP server framework
- **Environment Configuration**: Using dotenv for configuration management

## Project Structure

```
src/
├── index.ts    # Main entry point and Express server setup
├── server.ts   # MCP protocol handling and SSE transport layer
├── tools.ts    # Tool implementations and business logic
└── types.ts    # TypeScript type definitions
```

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```
PORT=3000
HOST=0.0.0.0
SERVER_NAME=mcp-express-server
SERVER_VERSION=1.0.0
```

## Development

Run in development mode with auto-reload:

```bash
npm run dev
```

## Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

## Production

Run the compiled server:

```bash
npm start
```

## API Endpoints

### `GET /`
Server information and available endpoints

### `GET /health`
Health check endpoint
- Returns server status and active connection count

### `GET /sse`
Server-Sent Events endpoint
- Establishes a persistent connection for real-time notifications
- Clients should connect here to receive server updates

### `POST /message`
MCP message endpoint
- Send JSON-RPC 2.0 formatted MCP requests
- Receives MCP responses

## Available Tools

The server comes with three example tools:

1. **echo**: Echoes back a message
2. **add**: Adds two numbers together
3. **get_time**: Returns the current server time

## MCP Protocol Usage

### Initialize Connection

```bash
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    }
  }'
```

### List Available Tools

```bash
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list"
  }'
```

### Call a Tool

```bash
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "add",
      "arguments": {
        "a": 5,
        "b": 3
      }
    }
  }'
```

## Adding New Tools

Edit `src/tools.ts` to add new tools:

```typescript
export const availableTools: Tool[] = [
  // ... existing tools
  {
    name: 'your_tool',
    description: 'Description of your tool',
    inputSchema: {
      type: 'object',
      properties: {
        param1: {
          type: 'string',
          description: 'Parameter description'
        }
      },
      required: ['param1']
    }
  }
];

// Add implementation in executeTool function
case 'your_tool':
  return {
    content: [{
      type: 'text',
      text: `Result: ${args.param1}`
    }]
  };
```

## License

MIT
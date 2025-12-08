# Server

This is a TypeScript implementation of an MCP (Model Control Protocol) server using Express. 

The server handles various methods for tool execution, resource management, and prompt handling via JSON-RPC over HTTP and Server-Sent Events (SSE).

## Key Components

### SSE Connection Management:

- Handles new SSE connections with unique IDs
- Maintains a map of active connections
- Sends connection notifications to clients
- Cleans up connections on close

### Request Processing:

- Parses incoming JSON-RPC requests
- Routes requests to appropriate handlers based on method
- Handles errors gracefully with proper JSON-RPC error codes

### Core Methods:

- initialize: Returns server capabilities and info
- tools/list: Lists available tools
- tools/call: Executes tools with validation
- resources/list: Lists available resources
- resources/read: Reads resource content
- prompts/list: Lists available prompts
- prompts/get: Retrieves prompt templates
- ping: Simple health check

### Broadcasting:

- Sends notifications to all connected clients
- Handles connection errors gracefully

### Validation:

- Validates tool arguments
- Validates resource URIs
- Validates prompt arguments

The server is designed to be extensible, with separate modules for tools, resources, and prompts that can be easily modified or extended. It follows the MCP specification for protocol version 2024-11-05.
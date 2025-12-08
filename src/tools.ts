import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTools(server: McpServer) {
	server.tool(
		"echo",
		{ message: z.string().describe("The message to echo back") },
		async ({ message }) => {
			return {
				content: [
					{
						type: "text",
						text: message
					}
				]
			};
		}
	);

	server.tool(
		"add",
		{
			a: z.number().describe("First number"),
			b: z.number().describe("Second number")
		},
		async ({ a, b }) => {
			const sum = a + b;
			return {
				content: [
					{
						type: "text",
						text: `The sum of ${a} and ${b} is ${sum}`
					}
				]
			};
		}
	);

	server.tool(
		"get_time",
		{},
		async () => {
			return {
				content: [
					{
						type: "text",
						text: new Date().toISOString()
					}
				]
			};
		}
	);
}

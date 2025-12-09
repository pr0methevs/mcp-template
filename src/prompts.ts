import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export const PROMPTS = [
	{
		name: "summarize",
		description: "Summarize the given content",
		arguments: [
			{
				name: "content",
				description: "The content to summarize",
				required: true
			},
			{
				name: "length",
				description: "How brief the summary should be (short, medium, long)",
				required: false
			}
		]
	},
	{
		name: "analyze_sentiment",
		description: "Analyze the sentiment of the provided text",
		arguments: [
			{
				name: "text",
				description: "The text to analyze",
				required: true
			}
		]
	},
	{
		name: "generate_ideas",
		description: "Generate creative ideas for a given topic",
		arguments: [
			{
				name: "topic",
				description: "The topic to generate ideas for",
				required: true
			},
			{
				name: "count",
				description: "Number of ideas to generate",
				required: false
			}
		]
	}
];

export function registerPrompts(server: McpServer) {
	server.prompt(
		"summarize",
		{
			content: z.string().describe("The content to summarize"),
			length: z.enum(["short", "medium", "long"]).optional().describe("How brief the summary should be")
		},
		async ({ content, length }) => {
			const len = length || 'medium';
			return {
				messages: [
					{
						role: "user",
						content: {
							type: "text",
							text: `Please summarize the following content${len ? ` in a ${len} format` : ''}:\n\n${content}`
						}
					}
				]
			};
		}
	);

	server.prompt(
		"analyze_sentiment",
		{
			text: z.string().describe("The text to analyze")
		},
		async ({ text }) => {
			return {
				messages: [
					{
						role: "user",
						content: {
							type: "text",
							text: `Please analyze the sentiment of the following text and provide a detailed analysis:\n\n${text}`
						}
					}
				]
			};
		}
	);

	server.prompt(
		"generate_ideas",
		{
			topic: z.string().describe("The topic to generate ideas for"),
			count: z.number().optional().describe("Number of ideas to generate")
		},
		async ({ topic, count }) => {
			const num = count || 5;
			return {
				messages: [
					{
						role: "user",
						content: {
							type: "text",
							text: `Generate ${num} creative ideas for the following topic: ${topic}`
						}
					}
				]
			};
		}
	);
}
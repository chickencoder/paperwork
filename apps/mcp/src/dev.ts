import { serve } from "@hono/node-server";
import { app } from "./app.js";

const port = Number(process.env.PORT) || 3001;

console.log(`🚀 MCP server running at http://localhost:${port}`);
console.log(`   Health check: http://localhost:${port}/`);
console.log(`   MCP endpoint: http://localhost:${port}/mcp`);

serve({
  fetch: app.fetch,
  port,
});

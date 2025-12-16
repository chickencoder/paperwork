import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// Session management
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// Create MCP Server factory (each session gets its own server)
function createMcpServer() {
  const server = new McpServer({
    name: "paperwork-pdf",
    version: "1.0.0",
  });

  // Widget resource URI
  const WIDGET_URI = "ui://paperwork/editor.html";

  // Load widget HTML (will be built from apps/widget)
  function loadWidgetHTML(): string {
    const widgetPath = join(__dirname, "../../widget/dist/index.html");
    if (existsSync(widgetPath)) {
      return readFileSync(widgetPath, "utf8");
    }
    // Fallback placeholder widget
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Paperwork PDF Editor</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #fafafa;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: #333;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Paperwork PDF Editor</h1>
    <p>Widget not built. Run: pnpm --filter @paperwork/widget build</p>
  </div>
</body>
</html>
    `.trim();
  }

  // Register the PDF editor widget as a resource
  // This is required for ChatGPT Apps SDK to fetch the widget HTML
  server.registerResource(
    "pdf-editor-widget",
    WIDGET_URI,
    {
      description: "Interactive PDF editor widget for editing, annotating, and signing PDFs",
      mimeType: "text/html+skybridge",
    },
    async () => ({
      contents: [
        {
          uri: WIDGET_URI,
          mimeType: "text/html+skybridge",
          text: loadWidgetHTML(),
        },
      ],
    })
  );

  // Single tool: upload_document
  // This opens the PDF editor widget where users can upload and edit their PDF
  server.registerTool(
    "upload_document",
    {
      description: `Opens the Paperwork PDF editor. Call this tool FIRST when the user wants to edit, annotate, sign, highlight, redact, or view a PDF document. The widget provides a complete PDF editing interface where users can:
- Upload a PDF document
- Add text, shapes, and drawings
- Highlight, underline, or strikethrough text
- Add signatures (draw, type, or upload)
- Redact sensitive information
- Download the edited PDF

This is a persistent window - once opened, the user interacts directly with the editor UI.`,
      annotations: {
        // ChatGPT Apps SDK specific annotations
        "openai/outputTemplate": WIDGET_URI,
        "openai/toolInvocation/invoking": "Opening PDF editor...",
        "openai/toolInvocation/invoked": "PDF editor ready",
      },
    },
    async () => {
      return {
        content: [
          {
            type: "text" as const,
            text: "Opening Paperwork PDF editor. Please upload your document to get started.",
          },
        ],
        // Structured content for the model to understand what happened
        structuredContent: {
          action: "open_editor",
          status: "ready",
        },
      };
    }
  );

  return server;
}

// Set CORS headers
function setCorsHeaders(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, mcp-session-id, Last-Event-ID"
  );
  res.setHeader("Access-Control-Expose-Headers", "mcp-session-id");
}

// Create HTTP server
const httpServer = createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    setCorsHeaders(res);

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    // Health check
    if (req.method === "GET" && req.url === "/") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ok",
          name: "paperwork-pdf",
          version: "1.0.0",
        })
      );
      return;
    }

    // MCP endpoint
    if (req.url === "/mcp") {
      const sessionId = req.headers["mcp-session-id"] as string | undefined;

      // Handle based on method
      if (req.method === "POST") {
        // Check for existing session
        if (sessionId && transports[sessionId]) {
          await transports[sessionId].handleRequest(req, res);
          return;
        }

        // New session - create transport and connect server
        const newSessionId = randomUUID();
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => newSessionId,
          onsessioninitialized: (id) => {
            transports[id] = transport;
          },
        });

        const server = createMcpServer();
        await server.connect(transport);
        await transport.handleRequest(req, res);
        return;
      }

      if (req.method === "GET") {
        // SSE stream for responses
        if (!sessionId || !transports[sessionId]) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid session" }));
          return;
        }
        await transports[sessionId].handleRequest(req, res);
        return;
      }

      if (req.method === "DELETE") {
        // Close session
        if (sessionId && transports[sessionId]) {
          await transports[sessionId].close();
          delete transports[sessionId];
          res.writeHead(204);
          res.end();
          return;
        }
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid session" }));
        return;
      }
    }

    // 404
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Paperwork MCP server running on http://localhost:${PORT}`);
  console.log(`📡 MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`\nTest with MCP Inspector:`);
  console.log(
    `npx @modelcontextprotocol/inspector@latest http://localhost:${PORT}/mcp`
  );
});

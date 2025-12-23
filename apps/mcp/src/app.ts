import { Hono } from "hono";
import { cors } from "hono/cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPTransport } from "@hono/mcp";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

// Temporary PDF storage (in-memory with expiry)
interface StoredPDF {
  data: Buffer;
  filename: string;
  expiresAt: number;
}

const pdfStore = new Map<string, StoredPDF>();
const PDF_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// Clean up expired PDFs periodically
setInterval(() => {
  const now = Date.now();
  for (const [id, pdf] of pdfStore.entries()) {
    if (pdf.expiresAt < now) {
      pdfStore.delete(id);
    }
  }
}, 60 * 1000); // Check every minute

// Widget HTML - bundled at build time or fetched from URL
const WIDGET_URI = "ui://paperwork/editor.html";

// Try to load widget HTML from built file or environment variable
function getWidgetHTML(): string {
  // First check environment variable (for Vercel production)
  if (process.env.WIDGET_HTML) {
    return process.env.WIDGET_HTML;
  }

  // In development, read from the @paperwork/widget package
  try {
    // Resolve the widget package path using import.meta.resolve
    const widgetHtmlUrl = import.meta
      .resolve("@paperwork/widget/dist/index.html");
    const widgetPath = fileURLToPath(widgetHtmlUrl);
    if (existsSync(widgetPath)) {
      return readFileSync(widgetPath, "utf-8");
    }
  } catch {
    // Ignore errors, fall through to fallback
  }

  // Fallback
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
    .container { text-align: center; padding: 2rem; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Paperwork PDF Editor</h1>
    <p>Widget not configured. Build the widget first: pnpm --filter @paperwork/widget build</p>
  </div>
</body>
</html>
`.trim();
}

// Create the MCP server with tools and resources
const mcp = new McpServer({
  name: "paperwork-pdf",
  version: "1.0.0",
});

// Register the PDF editor widget as a resource
mcp.registerResource(
  "pdf-editor-widget",
  WIDGET_URI,
  {
    description:
      "Interactive PDF editor widget for editing, annotating, and signing PDFs",
    mimeType: "text/html+skybridge",
  },
  async () => ({
    contents: [
      {
        uri: WIDGET_URI,
        mimeType: "text/html+skybridge",
        text: getWidgetHTML(),
        _meta: {
          "openai/widgetPrefersBorder": true,
          "openai/widgetDescription":
            "PDF editor for annotating, signing, and editing documents.",
        },
      },
    ],
  })
);

// Tool: open_pdf_editor
// Opens the PDF editor widget - user uploads their PDF directly in the widget
mcp.registerTool(
  "open_pdf_editor",
  {
    title: "Open PDF Editor",
    description:
      "Opens the Paperwork PDF editor. Use this when the user wants to edit, annotate, sign, highlight, redact, or view a PDF. The user will upload their PDF directly in the editor.",
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    _meta: {
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
          text: "Opening PDF editor. Please upload your PDF to begin editing.",
        },
      ],
    };
  }
);

// Create transport for HTTP streaming
const transport = new StreamableHTTPTransport();

// Create Hono app
export const app = new Hono();

// CORS middleware
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "mcp-session-id",
      "Last-Event-ID",
    ],
    exposeHeaders: ["mcp-session-id"],
  })
);

// Health check
app.get("/", (c) => {
  return c.json({
    status: "ok",
    name: "paperwork-pdf",
    version: "1.0.0",
  });
});

// PDF Upload endpoint - receives base64 PDF data, returns download URL
app.post("/pdf", async (c) => {
  try {
    const body = await c.req.json();
    const { data, filename } = body as { data: string; filename: string };

    if (!data || !filename) {
      return c.json({ error: "Missing data or filename" }, 400);
    }

    // Decode base64 data
    const pdfBuffer = Buffer.from(data, "base64");

    // Generate unique ID and store
    const id = randomUUID();
    pdfStore.set(id, {
      data: pdfBuffer,
      filename,
      expiresAt: Date.now() + PDF_EXPIRY_MS,
    });

    // Build download URL based on request origin
    const host = c.req.header("host") || "localhost:3001";
    const protocol = c.req.header("x-forwarded-proto") || "http";
    const downloadUrl = `${protocol}://${host}/pdf/${id}`;

    return c.json({ downloadUrl, id, expiresIn: PDF_EXPIRY_MS / 1000 });
  } catch (error) {
    console.error("PDF upload error:", error);
    return c.json({ error: "Failed to process PDF" }, 500);
  }
});

// PDF Download endpoint - serves the stored PDF
app.get("/pdf/:id", (c) => {
  const id = c.req.param("id");
  const stored = pdfStore.get(id);

  if (!stored) {
    return c.json({ error: "PDF not found or expired" }, 404);
  }

  // Check if expired
  if (stored.expiresAt < Date.now()) {
    pdfStore.delete(id);
    return c.json({ error: "PDF expired" }, 410);
  }

  // Delete after download (one-time use)
  pdfStore.delete(id);

  // Return PDF as download
  return new Response(stored.data, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${stored.filename}"`,
      "Content-Length": stored.data.length.toString(),
    },
  });
});

// MCP endpoint - handles all MCP protocol requests
app.all("/mcp", async (c) => {
  // Connect MCP server to transport if not already connected
  if (!mcp.isConnected()) {
    await mcp.connect(transport);
  }
  return transport.handleRequest(c);
});

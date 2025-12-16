// ChatGPT Apps SDK window.openai type definitions
declare global {
  interface Window {
    openai?: OpenAIWidget;
  }
}

export interface OpenAIWidget {
  // Tool data from MCP server
  toolInput?: Record<string, unknown>;
  toolOutput?: ToolOutput;
  toolResponseMetadata?: Record<string, unknown>;

  // Persisted widget state
  widgetState?: Record<string, unknown>;

  // Environment
  theme?: "light" | "dark";
  locale?: string;
  displayMode?: "inline" | "pip" | "fullscreen";
  maxHeight?: number;

  // Methods
  callTool: (name: string, input: Record<string, unknown>) => Promise<unknown>;
  setWidgetState: (state: Record<string, unknown>) => void;
  sendFollowUpMessage: (options: { prompt: string }) => void;
  requestDisplayMode: (options: { mode: "inline" | "pip" | "fullscreen" }) => Promise<void>;
  requestClose: () => void;
  uploadFile: (file: File) => Promise<{ file_id: string; download_url: string }>;
  getFileDownloadUrl: (options: { fileId: string }) => Promise<string>;
  notifyIntrinsicHeight: (height: number) => void;
}

export interface ToolOutput {
  mode?: "upload" | "edit" | "sign" | "annotate";
  file_url?: string;
  file_id?: string;
  capabilities?: string[];
  supportedFormats?: string[];
  maxFileSize?: string;
}

export {};

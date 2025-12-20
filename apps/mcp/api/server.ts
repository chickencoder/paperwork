import { handle } from "hono/vercel";
import { app } from "../src/app.js";

// Export for Vercel
export const GET = handle(app);
export const POST = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);

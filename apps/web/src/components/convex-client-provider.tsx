"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

// Lazy initialization to avoid build-time errors when env var is missing
let convexClient: ConvexReactClient | null = null;

function getConvexClient(): ConvexReactClient | null {
  if (convexClient) return convexClient;

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    // Return null if URL is not configured - Convex features will be disabled
    return null;
  }

  convexClient = new ConvexReactClient(convexUrl);
  return convexClient;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => getConvexClient(), []);

  // If Convex is not configured, render children without the provider
  if (!client) {
    return <>{children}</>;
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}

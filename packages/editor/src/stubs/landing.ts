/**
 * Stub module for landing page components.
 * These are web-app specific features not available in widget mode.
 */

export interface TransitionState {
  fromHomepage: boolean;
  dialogRect: {
    width: number;
    height: number;
    centerX: number;
    centerY: number;
  } | null;
  timestamp: number;
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15);
}

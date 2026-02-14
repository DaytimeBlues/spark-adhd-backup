import { createNavigationContainerRef } from '@react-navigation/native';
import { ROUTES } from './routes';

export type OverlayIntentPayload = {
  route?: string;
  autoRecord?: boolean;
};

const ALLOWED_OVERLAY_ROUTES = new Set<string>([
  ROUTES.CBT_GUIDE,
  ROUTES.FOG_CUTTER,
  ROUTES.TASKS,
  ROUTES.ANCHOR,
  ROUTES.CHECK_IN,
]);

export const navigationRef = createNavigationContainerRef();

export function handleOverlayIntent(payload: OverlayIntentPayload): boolean {
  if (!navigationRef.isReady() || !payload.route) {
    return false;
  }

  if (!ALLOWED_OVERLAY_ROUTES.has(payload.route)) {
    return false;
  }

  if (payload.route === ROUTES.TASKS) {
    navigationRef.navigate(ROUTES.TASKS, {
      autoRecord: payload.autoRecord === true,
    });
    return true;
  }

  navigationRef.navigate(payload.route as never);
  return true;
}

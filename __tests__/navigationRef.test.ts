const mockNavigate = jest.fn();
const mockIsReady = jest.fn();

import { ROUTES } from '../src/navigation/routes';

const loadNavigationRefModule = () => {
  jest.resetModules();
  jest.doMock('@react-navigation/native', () => ({
    createNavigationContainerRef: () => ({
      isReady: mockIsReady,
      navigate: mockNavigate,
    }),
  }));

  return require('../src/navigation/navigationRef') as typeof import('../src/navigation/navigationRef');
};

describe('handleOverlayIntent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsReady.mockReturnValue(true);
  });

  it('returns false when navigation is not ready', () => {
    const { handleOverlayIntent } = loadNavigationRefModule();
    mockIsReady.mockReturnValue(false);

    const result = handleOverlayIntent({ route: ROUTES.ANCHOR });

    expect(result).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('returns false when route is missing or disallowed', () => {
    const { handleOverlayIntent } = loadNavigationRefModule();
    const missingRouteResult = handleOverlayIntent({});
    const disallowedRouteResult = handleOverlayIntent({
      route: ROUTES.CALENDAR,
    });

    expect(missingRouteResult).toBe(false);
    expect(disallowedRouteResult).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates to Tasks with autoRecord params and returns true', () => {
    const { handleOverlayIntent } = loadNavigationRefModule();
    const result = handleOverlayIntent({
      route: ROUTES.TASKS,
      autoRecord: true,
    });

    expect(result).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.TASKS, {
      autoRecord: true,
    });
  });

  it('navigates to allowed non-Tasks route and returns true', () => {
    const { handleOverlayIntent } = loadNavigationRefModule();
    const result = handleOverlayIntent({ route: ROUTES.CBT_GUIDE });

    expect(result).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CBT_GUIDE);
  });
});

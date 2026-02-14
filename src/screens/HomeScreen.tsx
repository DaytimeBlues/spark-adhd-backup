import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
  Platform,
  Animated,
  Easing,
  useWindowDimensions,
  AppState,
  AppStateStatus,
  AccessibilityInfo,
  TouchableOpacity,
  NativeModules,
  Share,
} from 'react-native';
import OverlayService from '../services/OverlayService';
import StorageService from '../services/StorageService';
import { Tokens } from '../theme/tokens';
import ModeCard, { ModeCardMode } from '../components/home/ModeCard';
import { ROUTES } from '../navigation/routes';

const ANIMATION_DURATION = 300; // Faster
const ANIMATION_STAGGER = 50; // Faster
const ENTRANCE_OFFSET_Y = 15; // Subtle slide

type NavigatorState = {
  routeNames?: string[];
};

type Mode = { id: string } & ModeCardMode;

type NavigationNode = {
  navigate: (routeName: string) => void;
  getState?: () => NavigatorState | undefined;
  getParent?: () => NavigationNode | undefined;
};

type OverlayEvent = {
  id: string;
  timestamp: number;
  label: string;
};

const HomeScreen = ({ navigation }: { navigation: NavigationNode }) => {
  const [streak, setStreak] = useState(0);
  const [isOverlayEnabled, setIsOverlayEnabled] = useState(false);
  const [isOverlayPermissionRequesting, setIsOverlayPermissionRequesting] =
    useState(false);
  const [overlayEvents, setOverlayEvents] = useState<OverlayEvent[]>([]);
  const { width } = useWindowDimensions();

  const handleCopyDiagnostics = useCallback(async () => {
    if (!__DEV__) {
      return;
    }

    const diagnostics = [
      `overlay_enabled=${isOverlayEnabled ? 'yes' : 'no'}`,
      `permission_requesting=${isOverlayPermissionRequesting ? 'yes' : 'no'}`,
      ...overlayEvents.map((event) => {
        return `${new Date(event.timestamp).toISOString()} ${event.label}`;
      }),
    ].join('\n');

    try {
      const clipboardModule = NativeModules.Clipboard as
        | { setString?: (value: string) => void }
        | undefined;

      if (clipboardModule?.setString) {
        clipboardModule.setString(diagnostics);
        addOverlayEvent('Diagnostics copied');
        AccessibilityInfo.announceForAccessibility(
          'Overlay diagnostics copied to clipboard',
        );
        return;
      }

      await Share.share({
        title: 'Overlay diagnostics',
        message: diagnostics,
      });
      addOverlayEvent('Diagnostics shared');
      AccessibilityInfo.announceForAccessibility('Overlay diagnostics shared');
    } catch (error) {
      console.warn('Failed to export diagnostics:', error);
      addOverlayEvent('Diagnostics export failed');
      AccessibilityInfo.announceForAccessibility(
        'Overlay diagnostics export failed',
      );
    }
  }, [
    addOverlayEvent,
    isOverlayEnabled,
    isOverlayPermissionRequesting,
    overlayEvents,
  ]);

  const addOverlayEvent = useCallback((label: string) => {
    if (!__DEV__) {
      return;
    }
    setOverlayEvents((prev) => {
      const newEvent = {
        id: Date.now().toString() + Math.random(),
        timestamp: Date.now(),
        label,
      };
      return [newEvent, ...prev].slice(0, 5);
    });
  }, []);

  const isWeb = Platform.OS === 'web';
  const cardWidth = isWeb && width > 768 ? '31%' : '47%';

  const modes = useMemo<Mode[]>(
    () => [
      {
        id: 'ignite',
        name: 'Ignite',
        icon: 'fire',
        desc: '5-MIN FOCUS TIMER',
        accent: Tokens.colors.brand[500],
      },
      {
        id: 'fogcutter',
        name: 'Fog Cutter',
        icon: 'weather-windy',
        desc: 'BREAK TASKS DOWN',
        accent: Tokens.colors.brand[500], // Unified accent
      },
      {
        id: 'pomodoro',
        name: 'Pomodoro',
        icon: 'timer-sand',
        desc: 'CLASSIC TIMER',
        accent: Tokens.colors.brand[500],
      },
      {
        id: 'anchor',
        name: 'Anchor',
        icon: 'anchor',
        desc: 'BREATHING EXERCISES',
        accent: Tokens.colors.brand[500],
      },
      {
        id: 'checkin',
        name: 'Check In',
        icon: 'chart-bar',
        desc: 'MOOD & ENERGY',
        accent: Tokens.colors.brand[500],
      },
      {
        id: 'cbtguide',
        name: 'CBT Guide',
        icon: 'brain',
        desc: 'EVIDENCE-BASED STRATEGIES',
        accent: Tokens.colors.brand[500],
      },
    ],
    [],
  );

  const fadeAnims = useRef(modes.map(() => new Animated.Value(0))).current;
  const slideAnims = useRef(
    modes.map(() => new Animated.Value(ENTRANCE_OFFSET_Y)),
  ).current;

  const checkOverlayPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      const hasPermission = await OverlayService.canDrawOverlays();
      setIsOverlayEnabled(hasPermission);
    }
  }, []);

  const startOverlayWithLatestCount = useCallback(async () => {
    const taskItems =
      (await StorageService.getJSON<Array<{ id: string }>>(
        StorageService.STORAGE_KEYS.brainDump,
      )) || [];
    OverlayService.updateCount(taskItems.length);
    OverlayService.startOverlay();
    setIsOverlayEnabled(true);
  }, []);

  const loadStreak = useCallback(async () => {
    try {
      const streakCount = await StorageService.get(
        StorageService.STORAGE_KEYS.streakCount,
      );
      const parsed = streakCount ? parseInt(streakCount, 10) : 0;
      setStreak(Number.isNaN(parsed) ? 0 : parsed);
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  }, []);

  useEffect(() => {
    loadStreak();
    checkOverlayPermission();

    const animations = modes.map((_, i) => {
      return Animated.parallel([
        Animated.timing(fadeAnims[i], {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
          easing: Easing.linear, // Linear for industrial feel
        }),
        Animated.timing(slideAnims[i], {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]);
    });

    Animated.stagger(ANIMATION_STAGGER, animations).start();
  }, [checkOverlayPermission, fadeAnims, loadStreak, modes, slideAnims]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const appStateSubscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          checkOverlayPermission();
        }
      },
    );

    return () => {
      appStateSubscription.remove();
    };
  }, [checkOverlayPermission]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const unsubscribePermissionRequested = OverlayService.addEventListener(
      'overlay_permission_requested',
      () => {
        setIsOverlayPermissionRequesting(true);
        addOverlayEvent('Permission requested');
        AccessibilityInfo.announceForAccessibility(
          'Overlay permission request started',
        );
      },
    );

    const unsubscribePermissionResult = OverlayService.addEventListener(
      'overlay_permission_result',
      ({ granted }) => {
        setIsOverlayPermissionRequesting(false);
        addOverlayEvent(`Permission result: ${granted ? 'GRANTED' : 'DENIED'}`);
        AccessibilityInfo.announceForAccessibility(
          granted ? 'Overlay permission granted' : 'Overlay permission denied',
        );
      },
    );

    const unsubscribePermissionTimeout = OverlayService.addEventListener(
      'overlay_permission_timeout',
      () => {
        setIsOverlayPermissionRequesting(false);
        addOverlayEvent('Permission timeout');
        AccessibilityInfo.announceForAccessibility(
          'Overlay permission request timed out',
        );
      },
    );

    const unsubscribePermissionError = OverlayService.addEventListener(
      'overlay_permission_error',
      () => {
        setIsOverlayPermissionRequesting(false);
        addOverlayEvent('Permission error');
        AccessibilityInfo.announceForAccessibility(
          'Overlay permission request failed',
        );
      },
    );

    return () => {
      unsubscribePermissionRequested?.();
      unsubscribePermissionResult?.();
      unsubscribePermissionTimeout?.();
      unsubscribePermissionError?.();
    };
  }, [addOverlayEvent]);

  const toggleOverlay = useCallback(
    async (value: boolean) => {
      if (Platform.OS !== 'android') {
        return;
      }

      try {
        if (value) {
          setIsOverlayPermissionRequesting(true);
          const hasPermission = await OverlayService.canDrawOverlays();
          if (hasPermission) {
            setIsOverlayPermissionRequesting(false);
            await startOverlayWithLatestCount();
            return;
          }

          const granted = await OverlayService.requestOverlayPermission();
          const hasPermissionAfterRequest =
            granted || (await OverlayService.canDrawOverlays());

          if (hasPermissionAfterRequest) {
            setIsOverlayPermissionRequesting(false);
            await startOverlayWithLatestCount();
            return;
          }

          setIsOverlayPermissionRequesting(false);
          setIsOverlayEnabled(false);
          return;
        }

        OverlayService.stopOverlay();
        setIsOverlayEnabled(false);
      } catch (error) {
        console.error('Failed to toggle overlay:', error);
        setIsOverlayPermissionRequesting(false);
        setIsOverlayEnabled(false);
      }
    },
    [startOverlayWithLatestCount],
  );

  const navigateByRouteName = useCallback(
    (routeName: string) => {
      let currentNavigator: NavigationNode | undefined = navigation;

      while (currentNavigator) {
        const routeNames = currentNavigator.getState?.()?.routeNames;
        if (Array.isArray(routeNames) && routeNames.includes(routeName)) {
          currentNavigator.navigate(routeName);
          return;
        }
        currentNavigator = currentNavigator.getParent?.();
      }

      navigation.navigate(routeName);
    },
    [navigation],
  );

  const handlePress = useCallback(
    (modeId: string) => {
      if (modeId === 'checkin') {
        navigateByRouteName(ROUTES.CHECK_IN);
      } else if (modeId === 'cbtguide') {
        navigateByRouteName(ROUTES.CBT_GUIDE);
      } else if (modeId === 'fogcutter') {
        navigateByRouteName(ROUTES.FOG_CUTTER);
      } else if (modeId === 'pomodoro') {
        navigateByRouteName(ROUTES.POMODORO);
      } else if (modeId === 'anchor') {
        navigateByRouteName(ROUTES.ANCHOR);
      } else {
        navigateByRouteName(ROUTES.FOCUS);
      } // ignite -> Focus
    },
    [navigateByRouteName],
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.maxWidthWrapper}>
          <View style={styles.header}>
            <View>
              <Text
                style={styles.title}
                testID="home-title"
                accessibilityLabel="home-title"
              >
                SPARK
              </Text>
              <Text style={styles.subtitle}>READY TO FOCUS?</Text>
            </View>
            <View
              style={styles.streakBadge}
              testID="home-streak-badge"
              accessibilityRole="text"
              accessibilityLabel={`Streak: ${streak} ${streak !== 1 ? 'days' : 'day'}`}
            >
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text
                style={styles.streakText}
                testID="home-streak"
                accessibilityLabel="home-streak"
              >
                {streak} {streak !== 1 ? 'DAYS' : 'DAY'}
              </Text>
            </View>
          </View>

          {Platform.OS === 'android' && (
            <View
              style={[
                styles.overlayCard,
                isOverlayEnabled && styles.overlayCardActive,
              ]}
            >
              <View>
                <Text style={styles.overlayTitle}>FOCUS OVERLAY</Text>
                <Text style={styles.overlayDesc}>
                  SHOW TASK COUNT WHILE YOU FOCUS
                </Text>
                <Text
                  style={[
                    styles.overlayStatus,
                    isOverlayEnabled && styles.overlayStatusActive,
                  ]}
                  accessibilityLiveRegion="polite"
                >
                  {isOverlayPermissionRequesting
                    ? 'REQUESTING PERMISSION...'
                    : isOverlayEnabled
                      ? 'ACTIVE • FLOATING OVER APPS'
                      : 'REQUIRES PERMISSION'}
                </Text>
              </View>
              <View style={styles.overlaySwitchHitTarget}>
                <Switch
                  testID="home-overlay-toggle"
                  accessibilityRole="switch"
                  accessibilityLabel="home-overlay-toggle"
                  accessibilityState={{
                    checked: isOverlayEnabled,
                    busy: isOverlayPermissionRequesting,
                    disabled: isOverlayPermissionRequesting,
                  }}
                  trackColor={{
                    false: Tokens.colors.neutral[600],
                    true: Tokens.colors.brand[500],
                  }}
                  thumbColor={Tokens.colors.neutral[0]}
                  ios_backgroundColor={Tokens.colors.neutral[700]}
                  onValueChange={toggleOverlay}
                  disabled={isOverlayPermissionRequesting}
                  value={isOverlayEnabled}
                />
              </View>
            </View>
          )}

          {Platform.OS === 'android' && __DEV__ && (
            <View style={styles.debugPanel}>
              <Text style={styles.debugTitle}>OVERLAY EVENT LOG (DEV)</Text>
              {overlayEvents.length === 0 ? (
                <Text style={styles.debugText}>No events yet</Text>
              ) : (
                overlayEvents.map((event) => (
                  <Text key={event.id} style={styles.debugText}>
                    <Text style={styles.debugTime}>
                      [
                      {new Date(event.timestamp).toLocaleTimeString([], {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                      ]
                    </Text>{' '}
                    {event.label}
                  </Text>
                ))
              )}
              <TouchableOpacity
                onPress={handleCopyDiagnostics}
                style={styles.debugButton}
                accessibilityRole="button"
                accessibilityLabel="Copy Diagnostics"
                accessibilityHint="Exports overlay event logs and diagnostic data"
              >
                <Text style={styles.debugButtonText}>COPY DIAGNOSTICS</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.modesGrid}>
            {modes.map((mode, index) => (
              <Animated.View
                key={mode.id}
                style={{
                  width: cardWidth,
                  opacity: fadeAnims[index],
                  transform: [{ translateY: slideAnims[index] }],
                }}
              >
                <ModeCard
                  mode={mode}
                  onPress={() => handlePress(mode.id)}
                  testID={`mode-${mode.id}`}
                />
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral.darkest,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Tokens.spacing[6],
    alignItems: 'center',
  },
  maxWidthWrapper: {
    width: '100%',
    maxWidth: 960,
  },
  header: {
    marginBottom: Tokens.spacing[8],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Tokens.spacing[4],
  },
  title: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.h1,
    fontWeight: '700',
    color: Tokens.colors.text.primary,
    letterSpacing: 2, // Wide industrial
  },
  subtitle: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.base,
    color: Tokens.colors.text.secondary,
    marginTop: Tokens.spacing[1],
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: Tokens.spacing[3],
    paddingVertical: Tokens.spacing[2],
    borderRadius: Tokens.radii.none, // Sharp
    borderWidth: 1,
    borderStyle: 'dashed', // Dashed for industrial feel
    borderColor: Tokens.colors.neutral.border,
  },
  streakEmoji: {
    fontSize: Tokens.type.lg,
    marginRight: Tokens.spacing[2],
  },
  streakText: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.sm,
    fontWeight: '700',
    color: Tokens.colors.text.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  overlayCard: {
    minHeight: Tokens.layout.minTapTargetComfortable,
    marginBottom: Tokens.spacing[8],
    padding: Tokens.spacing[4],
    backgroundColor: Tokens.colors.neutral.darker,
    borderRadius: Tokens.radii.none, // Sharp
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4, // Industrial accent on left
    borderLeftColor: Tokens.colors.neutral.border,
  },
  overlayCardActive: {
    borderColor: Tokens.colors.brand[500],
    borderLeftColor: Tokens.colors.brand[500],
    backgroundColor: Tokens.colors.neutral.dark, // Slightly lighter when active
  },
  overlayTitle: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.base,
    fontWeight: '700',
    color: Tokens.colors.text.primary,
    marginBottom: Tokens.spacing[1],
    letterSpacing: 1,
  },
  overlayDesc: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.xs,
    color: Tokens.colors.text.secondary,
    letterSpacing: 0.5,
  },
  overlayStatus: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.xs,
    fontWeight: '700',
    color: Tokens.colors.text.secondary,
    letterSpacing: 0.5,
    marginTop: Tokens.spacing[2],
  },
  overlayStatusActive: {
    color: Tokens.colors.success.main,
  },
  overlaySwitchHitTarget: {
    minWidth: Tokens.layout.minTapTargetComfortable,
    minHeight: Tokens.layout.minTapTargetComfortable,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Tokens.spacing[4],
  },
  debugPanel: {
    marginBottom: Tokens.spacing[8],
    padding: Tokens.spacing[3],
    backgroundColor: Tokens.colors.neutral.darker,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.border,
    borderStyle: 'dashed',
  },
  debugTitle: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    color: Tokens.colors.text.tertiary,
    marginBottom: Tokens.spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  debugText: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    color: Tokens.colors.text.secondary,
    marginBottom: 2,
  },
  debugTime: {
    color: Tokens.colors.text.tertiary,
  },
  debugButton: {
    marginTop: Tokens.spacing[4],
    paddingVertical: Tokens.spacing[2],
    paddingHorizontal: Tokens.spacing[3],
    backgroundColor: Tokens.colors.neutral.dark,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.border,
    borderRadius: Tokens.radii.none,
    alignItems: 'center',
    justifyContent: 'center',
  },
  debugButtonText: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    fontWeight: '700',
    color: Tokens.colors.text.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default HomeScreen;

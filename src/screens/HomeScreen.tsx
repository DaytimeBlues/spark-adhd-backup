import React, { useEffect, useMemo, useState, useRef } from 'react';
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

const HomeScreen = ({ navigation }: { navigation: NavigationNode }) => {
  const [streak, setStreak] = useState(0);
  const [isOverlayEnabled, setIsOverlayEnabled] = useState(false);
  const { width } = useWindowDimensions();

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
  }, [fadeAnims, modes, slideAnims]);

  const checkOverlayPermission = async () => {
    if (Platform.OS === 'android') {
      const hasPermission = await OverlayService.canDrawOverlays();
      setIsOverlayEnabled(hasPermission);
    }
  };

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
  }, []);

  const toggleOverlay = async (value: boolean) => {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      if (value) {
        const hasPermission = await OverlayService.canDrawOverlays();
        if (hasPermission) {
          const taskItems =
            (await StorageService.getJSON<Array<{ id: string }>>(
              StorageService.STORAGE_KEYS.brainDump,
            )) || [];
          OverlayService.updateCount(taskItems.length);
          OverlayService.startOverlay();
          setIsOverlayEnabled(true);
          return;
        }

        const granted = await OverlayService.requestOverlayPermission();
        const hasPermissionAfterRequest =
          granted || (await OverlayService.canDrawOverlays());

        if (hasPermissionAfterRequest) {
          const taskItems =
            (await StorageService.getJSON<Array<{ id: string }>>(
              StorageService.STORAGE_KEYS.brainDump,
            )) || [];
          OverlayService.updateCount(taskItems.length);
          OverlayService.startOverlay();
          setIsOverlayEnabled(true);
          return;
        }

        setIsOverlayEnabled(false);
        return;
      }

      OverlayService.stopOverlay();
      setIsOverlayEnabled(false);
    } catch (error) {
      console.error('Failed to toggle overlay:', error);
      setIsOverlayEnabled(false);
    }
  };

  const loadStreak = async () => {
    try {
      const streakCount = await StorageService.get(
        StorageService.STORAGE_KEYS.streakCount,
      );
      const parsed = streakCount ? parseInt(streakCount, 10) : 0;
      setStreak(Number.isNaN(parsed) ? 0 : parsed);
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  const navigateByRouteName = (routeName: string) => {
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
  };

  const handlePress = (modeId: string) => {
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
  };

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
                >
                  {isOverlayEnabled
                    ? 'ACTIVE • FLOATING OVER APPS'
                    : 'REQUIRES PERMISSION'}
                </Text>
              </View>
              <View style={styles.overlaySwitchHitTarget}>
                <Switch
                  testID="home-overlay-toggle"
                  accessibilityRole="switch"
                  accessibilityLabel="home-overlay-toggle"
                  accessibilityState={{ checked: isOverlayEnabled }}
                  trackColor={{
                    false: Tokens.colors.neutral[600],
                    true: Tokens.colors.brand[500],
                  }}
                  thumbColor={Tokens.colors.neutral[0]}
                  ios_backgroundColor={Tokens.colors.neutral[700]}
                  onValueChange={toggleOverlay}
                  value={isOverlayEnabled}
                />
              </View>
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
    fontSize: 16,
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
});

export default HomeScreen;

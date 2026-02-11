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

const ANIMATION_DURATION = 500;
const ANIMATION_STAGGER = 80;
const ENTRANCE_OFFSET_Y = 30;

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
        desc: '5-min focus timer',
        accent: Tokens.colors.indigo.primary,
      },
      {
        id: 'fogcutter',
        name: 'Fog Cutter',
        icon: 'weather-windy',
        desc: 'Break tasks down',
        accent: Tokens.colors.info.main,
      },
      {
        id: 'pomodoro',
        name: 'Pomodoro',
        icon: 'timer-sand',
        desc: 'Classic timer',
        accent: Tokens.colors.error.main,
      },
      {
        id: 'anchor',
        name: 'Anchor',
        icon: 'anchor',
        desc: 'Breathing exercises',
        accent: Tokens.colors.success.main,
      },
      {
        id: 'checkin',
        name: 'Check In',
        icon: 'chart-bar',
        desc: 'Mood & energy',
        accent: Tokens.colors.warning.main,
      },
      {
        id: 'cbtguide',
        name: 'CBT Guide',
        icon: 'brain',
        desc: 'Evidence-based strategies',
        accent: Tokens.colors.info.main,
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
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(slideAnims[i], {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.2)),
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

    if (value) {
      const hasPermission = await OverlayService.canDrawOverlays();
      if (hasPermission) {
        OverlayService.startOverlay();
        setIsOverlayEnabled(true);
      } else {
        const granted = await OverlayService.requestOverlayPermission();
        const hasPermissionAfterRequest =
          granted || (await OverlayService.canDrawOverlays());

        if (hasPermissionAfterRequest) {
          OverlayService.startOverlay();
          setIsOverlayEnabled(true);
        } else {
          setIsOverlayEnabled(false);
        }
      }
    } else {
      OverlayService.stopOverlay();
      setIsOverlayEnabled(false);
    }
  };

  const loadStreak = async () => {
    try {
      const streakCount = await StorageService.get(StorageService.STORAGE_KEYS.streakCount);
      const parsed = streakCount ? parseInt(streakCount, 10) : 0;
      setStreak(Number.isNaN(parsed) ? 0 : parsed);
    } catch (e) {
      console.log('Error loading streak:', e);
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
                Spark
              </Text>
              <Text style={styles.subtitle}>Ready to focus?</Text>
            </View>
            <View
              style={styles.streakBadge}
              testID="home-streak-badge"
              accessibilityLabel="home-streak-badge"
            >
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text
                style={styles.streakText}
                testID="home-streak"
                accessibilityLabel="home-streak"
              >
                {streak} day{streak !== 1 ? 's' : ''} streak
              </Text>
            </View>
          </View>

          {Platform.OS === 'android' && (
            <View style={[styles.overlayCard, isOverlayEnabled && styles.overlayCardActive]}>
              <View>
                <Text style={styles.overlayTitle}>Focus Overlay</Text>
                <Text style={styles.overlayDesc}>Show task count while you focus</Text>
              </View>
              <View style={styles.overlaySwitchHitTarget}>
                <Switch
                  testID="home-overlay-toggle"
                  accessibilityRole="switch"
                  accessibilityLabel="home-overlay-toggle"
                  accessibilityState={{ checked: isOverlayEnabled }}
                  trackColor={{ false: Tokens.colors.neutral[600], true: Tokens.colors.brand[500] }}
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
    fontFamily: 'Inter',
    fontSize: Tokens.type.h1,
    fontWeight: '700',
    color: Tokens.colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.base,
    color: Tokens.colors.text.secondary,
    marginTop: Tokens.spacing[1],
    letterSpacing: 0.2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Tokens.colors.neutral.dark,
    paddingHorizontal: Tokens.spacing[3],
    paddingVertical: Tokens.spacing[2],
    borderRadius: Tokens.radii.full,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.border,
  },
  streakEmoji: {
    fontSize: 18,
    marginRight: Tokens.spacing[2],
  },
  streakText: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.sm,
    fontWeight: '600',
    color: Tokens.colors.text.primary,
  },
  overlayCard: {
    minHeight: Tokens.layout.minTapTargetComfortable,
    marginBottom: Tokens.spacing[8],
    padding: Tokens.spacing[4],
    backgroundColor: Tokens.colors.neutral.darker,
    borderRadius: Tokens.radii.lg,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overlayCardActive: {
    borderColor: Tokens.colors.brand[500],
  },
  overlayTitle: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.base,
    fontWeight: '600',
    color: Tokens.colors.text.primary,
    marginBottom: Tokens.spacing[1],
  },
  overlayDesc: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.xs,
    color: Tokens.colors.text.secondary,
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

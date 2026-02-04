import React, { useEffect, useMemo, useState } from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OverlayService from '../services/OverlayService';
import { Tokens } from '../theme/tokens';
import ModeCard, { type ModeCardMode } from '../components/home/ModeCard';

// -- Constants --
const ANIMATION_DURATION = 500;
const ANIMATION_STAGGER = 60;
const ENTRANCE_OFFSET_Y = Tokens.spacing[48];

// -- Types --
type Mode = { id: string } & ModeCardMode;

const HomeScreen = ({ navigation }: any) => {
  const [streak, setStreak] = useState(0);
  const [isOverlayEnabled, setIsOverlayEnabled] = useState(false);
  const { width } = useWindowDimensions();

  // Responsive layout logic
  const isWeb = Platform.OS === 'web';
  const numColumns = isWeb && width > 768 ? 3 : 2;
  const cardWidth = isWeb && width > 768 ? '31%' : '47%'; // spacing handled by flex/justify

  const modes = useMemo(
    () => [
      { id: 'ignite', name: 'Ignite', icon: '🔥', desc: '5-min focus timer', accent: Tokens.colors.indigo.primary },
      { id: 'fogcutter', name: 'Fog Cutter', icon: '💨', desc: 'Break tasks down', accent: Tokens.colors.info.main },
      { id: 'pomodoro', name: 'Pomodoro', icon: '🍅', desc: 'Classic timer', accent: Tokens.colors.error.main },
      { id: 'anchor', name: 'Anchor', icon: '⚓', desc: 'Breathing exercises', accent: Tokens.colors.success.main },
      { id: 'checkin', name: 'Check In', icon: '📊', desc: 'Mood & energy', accent: Tokens.colors.warning.main },
      { id: 'crisis', name: 'Crisis Mode', icon: '🆘', desc: 'Safety resources', accent: Tokens.colors.error.main },
    ],
    [],
  );

  const fadeAnims = React.useRef(modes.map(() => new Animated.Value(0))).current;
  const slideAnims = React.useRef(modes.map(() => new Animated.Value(ENTRANCE_OFFSET_Y))).current;

  useEffect(() => {
    loadStreak();
    checkOverlayPermission();

    // Trigger entrance animation
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
          easing: Easing.out(Easing.back(1.5)), // Slightly bouncier
        }),
      ]);
    });

    Animated.stagger(ANIMATION_STAGGER, animations).start();
  }, []);

  const checkOverlayPermission = async () => {
    if (Platform.OS === 'android') {
      const hasPermission = await OverlayService.canDrawOverlays();
      setIsOverlayEnabled(hasPermission);
    }
  };

  const toggleOverlay = async (value: boolean) => {
    if (Platform.OS !== 'android') return;

    if (value) {
      const hasPermission = await OverlayService.canDrawOverlays();
      if (hasPermission) {
        OverlayService.startOverlay();
        setIsOverlayEnabled(true);
      } else {
        const granted = await OverlayService.requestOverlayPermission();
        if (granted) {
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
      const streakCount = await AsyncStorage.getItem('streakCount');
      setStreak(streakCount ? parseInt(streakCount, 10) : 0);
    } catch (e) {
      console.log('Error loading streak:', e);
    }
  };

  const handlePress = (modeId: string) => {
    if (modeId === 'checkin') navigation.navigate('CheckIn');
    else if (modeId === 'crisis') navigation.navigate('Crisis');
    else if (modeId === 'fogcutter') navigation.navigate('FogCutter');
    else if (modeId === 'pomodoro') navigation.navigate('Pomodoro');
    else if (modeId === 'anchor') navigation.navigate('Anchor');
    else navigation.navigate('Focus'); // ignite -> Focus
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.maxWidthWrapper}>

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Spark</Text>
              <Text style={styles.subtitle}>Ready to focus?</Text>
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakText}>
                {streak} day{streak !== 1 ? 's' : ''} streak
              </Text>
            </View>
          </View>

          {Platform.OS === 'android' && (
            <View style={styles.overlayCard}>
              <View style={styles.overlayTextContainer}>
                <Text style={styles.overlayTitle}>Floating Bubble</Text>
                <Text style={styles.overlayDesc}>Keep tasks visible over other apps</Text>
              </View>
              <Switch
                trackColor={{ false: Tokens.colors.neutral[600], true: Tokens.colors.brand[500] }}
                thumbColor={Tokens.colors.neutral[0]}
                ios_backgroundColor={Tokens.colors.neutral[700]}
                onValueChange={toggleOverlay}
                value={isOverlayEnabled}
              />
            </View>
          )}

          <View style={styles.modesGrid}>
            {modes.map((mode, index) => (
              <ModeCard
                key={mode.id}
                mode={mode}
                onPress={() => handlePress(mode.id)}
                style={{ width: cardWidth }}
                animatedStyle={{
                  opacity: fadeAnims[index],
                  transform: [{ translateY: slideAnims[index] }]
                }}
              />
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
    fontSize: 32,
    fontWeight: '700',
    color: Tokens.colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.base,
    color: Tokens.colors.text.secondary,
    marginTop: Tokens.spacing[1],
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Tokens.spacing[8],
    padding: Tokens.spacing[4],
    backgroundColor: Tokens.colors.neutral.darker,
    borderRadius: Tokens.radii.lg,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
  },
  overlayTextContainer: {
    flex: 1,
    marginRight: Tokens.spacing[4],
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
  modesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Tokens.spacing[4],
  },
});

export default HomeScreen;

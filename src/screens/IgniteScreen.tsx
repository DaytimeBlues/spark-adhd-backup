import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Platform,
} from 'react-native';
import SoundService from '../services/SoundService';
import StorageService from '../services/StorageService';
import useTimer from '../hooks/useTimer';
import { Tokens } from '../theme/tokens';
import { LinearButton } from '../components/ui/LinearButton';

const HERO_TIMER_SIZE = 120;
const GLOW_TEXT_SHADOW = '0 0 40px rgba(255,255,255,0.1)';
const HOVER_SHADOW = '0 4px 12px rgba(0,0,0,0.2)';
const IGNITE_DURATION_SECONDS = 5 * 60;
const PERSIST_INTERVAL_MS = 5000;

const IgniteScreen = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    timeLeft,
    isRunning,
    formattedTime,
    start,
    pause,
    reset,
    setTime,
  } = useTimer({
    initialTime: IGNITE_DURATION_SECONDS,
    onComplete: () => {
      SoundService.playCompletionSound();
    },
  });

  useEffect(() => {
    SoundService.initBrownNoise();

    const loadState = async () => {
      const storedState = await StorageService.getJSON<{
        timeLeft: number;
        isPlaying: boolean;
      }>(StorageService.STORAGE_KEYS.igniteState);
      if (!storedState) {
        return;
      }

      if (typeof storedState.timeLeft === 'number') {
        setTime(storedState.timeLeft);
      }

      if (storedState.isPlaying) {
        setIsPlaying(true);
        SoundService.playBrownNoise();
      }
    };

    loadState();

    return () => {
      SoundService.stopBrownNoise();
      SoundService.releaseBrownNoise();
    };
  }, [setTime]);

  useEffect(() => {
    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current);
    }

    persistTimerRef.current = setTimeout(() => {
      StorageService.setJSON(StorageService.STORAGE_KEYS.igniteState, {
        timeLeft,
        isPlaying,
      });
    }, PERSIST_INTERVAL_MS);

    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
      }
    };
  }, [timeLeft, isPlaying]);

  const startTimer = () => {
    start();
  };

  const pauseTimer = () => {
    pause();
  };

  const resetTimer = () => {
    reset();
    setIsPlaying(false);
    SoundService.pauseBrownNoise();
  };

  const toggleSound = () => {
    setIsPlaying((prev) => {
      if (prev) {
        SoundService.pauseBrownNoise();
      } else {
        SoundService.playBrownNoise();
      }

      return !prev;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerWrapper}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>IGNITE</Text>
            <Text style={styles.subtitle}>5-MINUTE FOCUS TIMER</Text>
          </View>

          <View style={styles.timerCard}>
            <Text style={styles.timer}>{formattedTime}</Text>
            <Text style={styles.status}>
              {isRunning ? '🔥 FOCUS MODE' : 'READY TO IGNITE?'}
            </Text>
          </View>

          <View style={styles.controls}>
            {!isRunning ? (
              <LinearButton
                title="Start Focus"
                onPress={startTimer}
                size="lg"
                style={styles.mainButton}
              />
            ) : (
              <LinearButton
                title="Pause"
                variant="secondary"
                onPress={pauseTimer}
                size="lg"
                style={styles.mainButton}
              />
            )}

            <LinearButton
              title="Reset"
              variant="ghost"
              onPress={resetTimer}
              size="md"
            />
          </View>

          <Pressable
            style={({
              pressed,
              hovered,
            }: {
              pressed: boolean;
              hovered?: boolean;
            }) => [
                styles.soundToggle,
                isPlaying ? styles.soundToggleActive : styles.soundToggleInactive,
                hovered && styles.soundToggleHovered,
                pressed && styles.soundTogglePressed,
              ]}
            onPress={toggleSound}
          >
            <Text style={styles.soundIcon}>{isPlaying ? '🔊' : '🔇'}</Text>
            <View>
              <Text
                style={[
                  styles.soundTitle,
                  isPlaying ? styles.soundTextActive : styles.soundTextInactive,
                ]}
              >
                BROWN NOISE
              </Text>
              <Text
                style={[
                  styles.soundStatus,
                  isPlaying ? styles.soundTextActive : styles.soundTextInactive,
                ]}
              >
                {isPlaying ? 'ON' : 'OFF'}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral.darkest,
  },
  centerWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: Tokens.layout.maxWidth.prose,
    padding: Tokens.spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: Tokens.spacing[8],
    alignItems: 'center',
  },
  title: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type['4xl'],
    fontWeight: '800',
    color: Tokens.colors.text.primary,
    marginBottom: Tokens.spacing[2],
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.base,
    color: Tokens.colors.text.secondary,
    textAlign: 'center',
    maxWidth: 400,
    lineHeight: 24,
    letterSpacing: 1,
  },
  timerCard: {
    alignItems: 'center',
    marginBottom: Tokens.spacing[12],
    paddingVertical: Tokens.spacing[8],
    width: '100%',
  },
  timer: {
    fontFamily: Tokens.type.fontFamily.mono, // Mono for timer
    fontSize: HERO_TIMER_SIZE,
    fontWeight: '900',
    color: Tokens.colors.text.primary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -6,
    lineHeight: HERO_TIMER_SIZE,
    marginBottom: Tokens.spacing[4],
    ...Platform.select({
      web: {
        textShadow: GLOW_TEXT_SHADOW,
      },
    }),
  },
  status: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.xl,
    color: Tokens.colors.brand[400],
    fontWeight: '600',
    letterSpacing: 1,
  },
  controls: {
    width: '100%',
    maxWidth: 320,
    gap: Tokens.spacing[4],
    marginBottom: Tokens.spacing[12],
  },
  mainButton: {
    width: '100%',
  },
  soundToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Tokens.spacing[3],
    paddingHorizontal: Tokens.spacing[5],
    borderRadius: Tokens.radii.none, // Sharp
    borderWidth: 1,
    minWidth: 180,
    justifyContent: 'center',
    gap: Tokens.spacing[3],
    backgroundColor: Tokens.colors.neutral.darker,
    borderColor: Tokens.colors.neutral.borderSubtle,
    marginTop: Tokens.spacing[8],
    ...Platform.select({
      web: {
        transition: Tokens.motion.transitions.base,
        cursor: 'pointer',
      },
    }),
  },
  soundToggleActive: {
    backgroundColor: Tokens.colors.brand[900],
    borderColor: Tokens.colors.brand[500],
    ...Platform.select({
      web: {
        boxShadow: `0 0 20px ${Tokens.colors.brand[900]}`,
      },
    }),
  },
  soundToggleInactive: {
    // defaults handled in base style
  },
  soundToggleHovered: {
    transform: [{ translateY: -2 }],
    ...Platform.select({
      web: {
        boxShadow: HOVER_SHADOW,
      },
    }),
  },
  soundTogglePressed: {
    opacity: 0.8,
    transform: [{ scale: Tokens.motion.scales.press }],
  },
  soundIcon: {
    fontSize: Tokens.type['2xl'],
  },
  soundTitle: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.sm,
    fontWeight: '700',
    letterSpacing: 1,
  },
  soundStatus: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.xs,
    letterSpacing: 1,
  },
  soundTextActive: {
    color: Tokens.colors.brand[100],
  },
  soundTextInactive: {
    color: Tokens.colors.text.tertiary,
  },
});

export default IgniteScreen;

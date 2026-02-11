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
import { formatTime } from '../utils/helpers';
import { Tokens } from '../theme/tokens';
import { LinearButton } from '../components/ui/LinearButton';

const HERO_TIMER_SIZE = 120;
const GLOW_TEXT_SHADOW = '0 0 40px rgba(255,255,255,0.1)';
const HOVER_SHADOW = '0 4px 12px rgba(0,0,0,0.2)';

const IgniteScreen = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
        setTimeLeft(storedState.timeLeft);
      }

      if (storedState.isPlaying) {
        setIsPlaying(true);
        SoundService.playBrownNoise();
      }
    };

    loadState();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      SoundService.stopBrownNoise();
      SoundService.releaseBrownNoise();
    };
  }, []);

  useEffect(() => {
    StorageService.setJSON(StorageService.STORAGE_KEYS.igniteState, {
      timeLeft,
      isPlaying,
    });
  }, [timeLeft, isPlaying]);

  const startTimer = () => {
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          SoundService.playCompletionSound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(300);
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
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
            <Text style={styles.title}>Ignite</Text>
            <Text style={styles.subtitle}>5-Minute Focus Timer</Text>
          </View>

          <View style={styles.timerCard}>
            <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
            <Text style={styles.status}>
              {isRunning ? '🔥 Focus Mode' : 'Ready to Ignite?'}
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
                Brown Noise
              </Text>
              <Text
                style={[
                  styles.soundStatus,
                  isPlaying ? styles.soundTextActive : styles.soundTextInactive,
                ]}
              >
                {isPlaying ? 'On' : 'Off'}
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
    fontFamily: 'Inter',
    fontSize: Tokens.type['4xl'],
    fontWeight: '800',
    color: Tokens.colors.text.primary,
    marginBottom: Tokens.spacing[2],
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.base,
    color: Tokens.colors.text.secondary,
    textAlign: 'center',
    maxWidth: 400,
    lineHeight: 24,
  },
  timerCard: {
    alignItems: 'center',
    marginBottom: Tokens.spacing[12],
    paddingVertical: Tokens.spacing[8],
    width: '100%',
  },
  timer: {
    fontFamily: 'Inter',
    fontSize: HERO_TIMER_SIZE, // Hero size
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
    fontFamily: 'Inter',
    fontSize: Tokens.type.xl,
    color: Tokens.colors.brand[400],
    fontWeight: '600',
    letterSpacing: -0.5,
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
    borderRadius: Tokens.radii.full,
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
    fontFamily: 'Inter',
    fontSize: Tokens.type.sm,
    fontWeight: '600',
  },
  soundStatus: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.xs,
  },
  soundTextActive: {
    color: Tokens.colors.brand[100],
  },
  soundTextInactive: {
    color: Tokens.colors.text.tertiary,
  },
});

export default IgniteScreen;

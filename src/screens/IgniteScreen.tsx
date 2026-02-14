import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import SoundService from '../services/SoundService';
import StorageService from '../services/StorageService';
import UXMetricsService from '../services/UXMetricsService';
import useTimer from '../hooks/useTimer';
import { Tokens } from '../theme/tokens';
import { LinearButton } from '../components/ui/LinearButton';

const HERO_TIMER_SIZE = 120;
const IGNITE_DURATION_SECONDS = 5 * 60;
const PERSIST_INTERVAL_MS = 5000;

const IgniteScreen = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { timeLeft, isRunning, formattedTime, start, pause, reset, setTime } =
    useTimer({
      initialTime: IGNITE_DURATION_SECONDS,
      onComplete: () => {
        SoundService.playCompletionSound();
        UXMetricsService.track('ignite_timer_completed');
      },
    });

  useEffect(() => {
    SoundService.initBrownNoise();

    const loadState = async () => {
      try {
        const storedState = await StorageService.getJSON<{
          timeLeft: number;
          isPlaying: boolean;
        }>(StorageService.STORAGE_KEYS.igniteState);

        if (storedState) {
          UXMetricsService.track('ignite_session_restored');
          if (typeof storedState.timeLeft === 'number') {
            setTime(storedState.timeLeft);
          }

          if (storedState.isPlaying) {
            setIsPlaying(true);
            SoundService.playBrownNoise();
          }
        }
      } catch (error) {
        console.error('Failed to load ignite state', error);
      } finally {
        setIsRestoring(false);
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
    UXMetricsService.track('ignite_timer_started');
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

          {isRestoring ? (
            <View style={styles.timerCard}>
              <ActivityIndicator
                size="small"
                color={Tokens.colors.brand[500]}
              />
              <Text style={styles.restoringText}>RESTORING SESSION...</Text>
            </View>
          ) : (
            <>
              <View style={styles.timerCard}>
                <Text style={styles.timer}>{formattedTime}</Text>
                <Text style={styles.status}>
                  {isRunning ? '🔥 FOCUS MODE' : 'READY TO IGNITE?'}
                </Text>
              </View>

              <View style={styles.controls}>
                {!isRunning ? (
                  <LinearButton
                    title="START FOCUS"
                    onPress={startTimer}
                    size="lg"
                    style={styles.mainButton}
                  />
                ) : (
                  <LinearButton
                    title="PAUSE"
                    variant="secondary"
                    onPress={pauseTimer}
                    size="lg"
                    style={styles.mainButton}
                  />
                )}

                <LinearButton
                  title="RESET"
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
                  isPlaying
                    ? styles.soundToggleActive
                    : styles.soundToggleInactive,
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
                      isPlaying
                        ? styles.soundTextActive
                        : styles.soundTextInactive,
                    ]}
                  >
                    BROWN NOISE
                  </Text>
                  <Text
                    style={[
                      styles.soundStatus,
                      isPlaying
                        ? styles.soundTextActive
                        : styles.soundTextInactive,
                    ]}
                  >
                    {isPlaying ? 'ON' : 'OFF'}
                  </Text>
                </View>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  restoringText: {
    marginTop: Tokens.spacing[4],
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.sm,
    color: '#666666',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  header: {
    marginBottom: Tokens.spacing[8],
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#333333',
    paddingBottom: Tokens.spacing[4],
    width: '100%',
  },
  title: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type['5xl'],
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: Tokens.spacing[2],
    letterSpacing: -2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.sm,
    color: '#666666',
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  timerCard: {
    alignItems: 'center',
    marginBottom: Tokens.spacing[12],
    paddingVertical: Tokens.spacing[8],
    width: '100%',
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: '#050505',
  },
  timer: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: HERO_TIMER_SIZE,
    fontWeight: '400',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
    letterSpacing: -4,
    lineHeight: HERO_TIMER_SIZE,
    marginBottom: Tokens.spacing[4],
  },
  status: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.lg,
    color: '#FF0000', // THE RED ACCENT
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  controls: {
    width: '100%',
    maxWidth: 320,
    gap: Tokens.spacing[4],
    marginBottom: Tokens.spacing[12],
  },
  mainButton: {
    width: '100%',
    borderRadius: 0,
  },
  soundToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Tokens.spacing[4],
    paddingHorizontal: Tokens.spacing[6],
    borderRadius: 0, // Sharp
    borderWidth: 1,
    minWidth: 200,
    justifyContent: 'center',
    gap: Tokens.spacing[4],
    backgroundColor: '#000000',
    borderColor: '#333333',
    marginTop: Tokens.spacing[8],
    ...Platform.select({
      web: {
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      },
    }),
  },
  soundToggleActive: {
    backgroundColor: '#111111',
    borderColor: '#FFFFFF',
  },
  soundToggleInactive: {
    // defaults
  },
  soundToggleHovered: {
    borderColor: '#666666',
    transform: [{ translateY: -1 }],
  },
  soundTogglePressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  soundIcon: {
    fontSize: Tokens.type.xl,
    color: '#FFFFFF',
  },
  soundTitle: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  soundStatus: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    letterSpacing: 1,
    marginTop: 2,
  },
  soundTextActive: {
    color: '#FFFFFF',
  },
  soundTextInactive: {
    color: '#666666',
  },
});

export default IgniteScreen;

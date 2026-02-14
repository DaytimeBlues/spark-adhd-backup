import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';
import SoundService from '../services/SoundService';
import StorageService from '../services/StorageService';
import useTimer from '../hooks/useTimer';
import { LinearButton } from '../components/ui/LinearButton';
import { Tokens } from '../theme/tokens';

type PomodoroState = {
  isWorking: boolean;
  timeLeft: number;
  sessions: number;
};

const SESSION_BADGE_SIZE = 28;
const TIMER_CARD_SIZE = 280;
const TIMER_TEXT_SHADOW = '0 0 0 rgba(0,0,0,0)'; // Removed shadow
const FOCUS_DURATION_SECONDS = 25 * 60;
const BREAK_DURATION_SECONDS = 5 * 60;
const PERSIST_INTERVAL_MS = 5000;

const PHASE_STYLES = {
  focus: {
    bg: 'rgba(239, 68, 68, 0.05)',
    glow: '0 0 0 transparent',
  },
  break: {
    bg: 'rgba(34, 197, 94, 0.05)',
    glow: '0 0 0 transparent',
  },
};

const PomodoroScreen = () => {
  const [isWorking, setIsWorking] = useState(true);
  const [sessions, setSessions] = useState(0);
  const isWorkingRef = useRef(isWorking);
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
    initialTime: FOCUS_DURATION_SECONDS,
    onComplete: () => {
      if (isWorkingRef.current) {
        setSessions((s) => s + 1);
        setIsWorking(false);
        isWorkingRef.current = false;
        SoundService.playCompletionSound();
        setTime(BREAK_DURATION_SECONDS);
      } else {
        setIsWorking(true);
        isWorkingRef.current = true;
        SoundService.playNotificationSound();
        setTime(FOCUS_DURATION_SECONDS);
      }
      // Re-start for the next phase
      setTimeout(() => start(), 0);
    },
  });

  useEffect(() => {
    isWorkingRef.current = isWorking;
  }, [isWorking]);

  useEffect(() => {
    const loadState = async () => {
      const storedState = await StorageService.getJSON<PomodoroState>(
        StorageService.STORAGE_KEYS.pomodoroState,
      );

      if (!storedState) {
        return;
      }

      if (typeof storedState.isWorking === 'boolean') {
        setIsWorking(storedState.isWorking);
      }

      if (typeof storedState.timeLeft === 'number') {
        setTimeLeft(storedState.timeLeft);
      }

      if (typeof storedState.sessions === 'number') {
        setSessions(storedState.sessions);
      }
    };

    loadState();
  }, [setTime]);

  useEffect(() => {
    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current);
    }

    persistTimerRef.current = setTimeout(() => {
      StorageService.setJSON(StorageService.STORAGE_KEYS.pomodoroState, {
        isWorking,
        timeLeft,
        sessions,
      });
    }, PERSIST_INTERVAL_MS);

    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
      }
    };
  }, [isWorking, timeLeft, sessions]);

  const startTimer = () => {
    start();
  };

  const pauseTimer = () => {
    pause();
  };

  const resetTimer = () => {
    reset();
    setIsWorking(true);
    isWorkingRef.current = true;
    setTime(FOCUS_DURATION_SECONDS);
  };

  const phaseIndicatorStyle = isWorking
    ? styles.phaseIndicatorFocus
    : styles.phaseIndicatorBreak;

  const phaseTextStyle = isWorking
    ? styles.phaseTextFocus
    : styles.phaseTextBreak;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>POMODORO</Text>
          <Text style={styles.subtitle}>
            {isWorking ? 'FOCUS BLOCK' : 'RECOVERY BREAK'}
          </Text>
        </View>

        <View style={styles.timerCard}>
          <View style={[styles.phaseIndicator, phaseIndicatorStyle]} />
          <Text style={styles.timer}>{formattedTime}</Text>
          <Text style={[styles.phaseText, phaseTextStyle]}>
            {isWorking ? '🔥 FOCUS' : '🌿 REST'}
          </Text>
        </View>

        <View style={styles.sessionCounter}>
          <View style={styles.sessionBadge}>
            <Text style={styles.sessionCount}>{sessions}</Text>
          </View>
          <Text style={styles.sessionLabel}>COMPLETED SESSIONS</Text>
        </View>

        <View style={styles.controls}>
          {!isRunning ? (
            <LinearButton
              title="Start Timer"
              onPress={startTimer}
              variant={isWorking ? 'primary' : 'secondary'}
              size="lg"
              style={styles.controlBtn}
            />
          ) : (
            <LinearButton
              title="Pause"
              onPress={pauseTimer}
              variant="secondary"
              size="lg"
              style={styles.controlBtn}
            />
          )}
          <LinearButton
            title="Reset"
            onPress={resetTimer}
            variant="ghost"
            size="md"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral.darkest,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: Tokens.spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: Tokens.layout.maxWidth.prose,
  },
  header: {
    alignItems: 'center',
    marginBottom: Tokens.spacing[10],
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
    color: Tokens.colors.text.tertiary,
    textAlign: 'center',
    letterSpacing: 1,
    ...Platform.select({
      web: { transition: Tokens.motion.transitions.base },
    }),
  },
  sessionCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Tokens.spacing[8],
    backgroundColor: Tokens.colors.neutral.darker,
    paddingHorizontal: Tokens.spacing[4],
    paddingVertical: Tokens.spacing[2],
    borderRadius: Tokens.radii.none, // Sharp
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    gap: Tokens.spacing[3],
  },
  sessionBadge: {
    backgroundColor: Tokens.colors.brand[900],
    width: SESSION_BADGE_SIZE,
    height: SESSION_BADGE_SIZE,
    borderRadius: 0, // Square
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Tokens.colors.brand[700],
  },
  sessionCount: {
    fontFamily: Tokens.type.fontFamily.mono,
    color: Tokens.colors.brand[100],
    fontSize: Tokens.type.sm,
    fontWeight: '700',
  },
  sessionLabel: {
    fontFamily: Tokens.type.fontFamily.sans,
    color: Tokens.colors.text.tertiary,
    fontSize: Tokens.type.sm,
    letterSpacing: 0.5,
  },
  timerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Tokens.spacing[12],
    width: TIMER_CARD_SIZE,
    height: TIMER_CARD_SIZE,
    position: 'relative',
    borderRadius: Tokens.radii.full, // Keep circle for timer
    backgroundColor: Tokens.colors.neutral.darker,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
  },
  phaseIndicator: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: Tokens.radii.full,
    borderWidth: 2,
    opacity: 1,
    ...Platform.select({
      web: { transition: Tokens.motion.transitions.slow },
    }),
  },
  phaseIndicatorFocus: {
    borderColor: Tokens.colors.error.main,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: { boxShadow: PHASE_STYLES.focus.glow },
    }),
  },
  phaseIndicatorBreak: {
    borderColor: Tokens.colors.success.main,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: { boxShadow: PHASE_STYLES.break.glow },
    }),
  },
  timer: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.giga,
    fontWeight: '700',
    color: Tokens.colors.text.primary,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    letterSpacing: -2,
    ...Platform.select({
      web: { textShadow: TIMER_TEXT_SHADOW },
    }),
  },
  phaseText: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.xl,
    fontWeight: '600',
    marginTop: Tokens.spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 2,
    ...Platform.select({
      web: { transition: Tokens.motion.transitions.base },
    }),
  },
  phaseTextFocus: {
    color: Tokens.colors.error.main,
  },
  phaseTextBreak: {
    color: Tokens.colors.success.main,
  },
  controls: {
    width: '100%',
    maxWidth: 320,
    gap: Tokens.spacing[4],
    marginTop: Tokens.spacing[8],
  },
  controlBtn: {
    width: '100%',
  },
});

export default PomodoroScreen;

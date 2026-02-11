import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';
import SoundService from '../services/SoundService';
import StorageService from '../services/StorageService';
import { formatTime } from '../utils/helpers';
import { LinearButton } from '../components/ui/LinearButton';
import { Tokens } from '../theme/tokens';

type PomodoroState = {
  isWorking: boolean;
  timeLeft: number;
  sessions: number;
};

const TITLE_SIZE = 40;
const SESSION_BADGE_SIZE = 28;
const TIMER_CARD_SIZE = 280;
const TIMER_TEXT_SHADOW = '0 4px 20px rgba(0,0,0,0.5)';

const PHASE_STYLES = {
  focus: {
    bg: 'rgba(239, 68, 68, 0.05)',
    glow: `0 0 40px ${Tokens.colors.error.subtle}`,
  },
  break: {
    bg: 'rgba(34, 197, 94, 0.05)',
    glow: `0 0 40px ${Tokens.colors.success.subtle}`,
  },
};

const PomodoroScreen = () => {
  const [isWorking, setIsWorking] = useState(true);
  const [timeLeft, setTimeLeft] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isWorkingRef = useRef(isWorking);

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

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    StorageService.setJSON(StorageService.STORAGE_KEYS.pomodoroState, {
      isWorking,
      timeLeft,
      sessions,
    });
  }, [isWorking, timeLeft, sessions]);

  const startTimer = () => {
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (isWorkingRef.current) {
            setSessions((s) => s + 1);
            setIsWorking(false);
            SoundService.playCompletionSound();
            return 300;
          } else {
            setIsWorking(true);
            SoundService.playNotificationSound();
            return 1500;
          }
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
    setIsWorking(true);
    setTimeLeft(1500);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
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
          <Text style={styles.title}>Pomodoro</Text>
          <Text style={styles.subtitle}>
            {isWorking ? 'Focus Block' : 'Recovery Break'}
          </Text>
        </View>

        <View style={styles.timerCard}>
          <View style={[styles.phaseIndicator, phaseIndicatorStyle]} />
          <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
          <Text style={[styles.phaseText, phaseTextStyle]}>
            {isWorking ? '🔥 Focus' : '🌿 Rest'}
          </Text>
        </View>

        <View style={styles.sessionCounter}>
          <View style={styles.sessionBadge}>
            <Text style={styles.sessionCount}>{sessions}</Text>
          </View>
          <Text style={styles.sessionLabel}>Completed Sessions</Text>
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
    color: Tokens.colors.text.tertiary,
    textAlign: 'center',
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
    borderRadius: Tokens.radii.full,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    gap: Tokens.spacing[3],
  },
  sessionBadge: {
    backgroundColor: Tokens.colors.brand[900],
    width: SESSION_BADGE_SIZE,
    height: SESSION_BADGE_SIZE,
    borderRadius: Tokens.radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Tokens.colors.brand[700],
  },
  sessionCount: {
    fontFamily: 'Inter',
    color: Tokens.colors.brand[100],
    fontSize: Tokens.type.sm,
    fontWeight: '700',
  },
  sessionLabel: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.tertiary,
    fontSize: Tokens.type.sm,
  },
  timerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Tokens.spacing[12],
    width: TIMER_CARD_SIZE,
    height: TIMER_CARD_SIZE,
    position: 'relative',
    borderRadius: Tokens.radii.full,
    backgroundColor: Tokens.colors.neutral.darker,
  },
  phaseIndicator: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: Tokens.radii.full,
    borderWidth: 1,
    opacity: 0.6,
    ...Platform.select({
      web: { transition: Tokens.motion.transitions.slow },
    }),
  },
  phaseIndicatorFocus: {
    borderColor: Tokens.colors.error.main,
    backgroundColor: PHASE_STYLES.focus.bg,
    ...Platform.select({
      web: { boxShadow: PHASE_STYLES.focus.glow },
    }),
  },
  phaseIndicatorBreak: {
    borderColor: Tokens.colors.success.main,
    backgroundColor: PHASE_STYLES.break.bg,
    ...Platform.select({
      web: { boxShadow: PHASE_STYLES.break.glow },
    }),
  },
  timer: {
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
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

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { LinearButton } from '../components/ui/LinearButton';
import useTimer from '../hooks/useTimer';
import { Tokens } from '../theme/tokens';

type BreathingPattern = '478' | 'box' | 'energize';

const PATTERNS: Record<
  BreathingPattern,
  { name: string; inhale: number; hold: number; exhale: number; wait: number }
> = {
  '478': { name: '4-7-8 RELAX', inhale: 4, hold: 7, exhale: 8, wait: 0 },
  box: { name: 'BOX BREATHING', inhale: 4, hold: 4, exhale: 4, wait: 4 },
  energize: { name: 'ENERGIZE', inhale: 6, hold: 0, exhale: 2, wait: 0 },
};

const HOVER_SHADOW = '0 0 0 rgba(0,0,0,0)';
const CIRCLE_TRANSITION = 'transform 1s ease-in-out';
const BREATHING_CIRCLE_SIZE = 240;
const INNER_CIRCLE_SIZE = 140;

const AnchorScreen = () => {
  const [pattern, setPattern] = useState<BreathingPattern | null>(null);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'wait'>(
    'inhale',
  );
  const phaseRef = useRef<'inhale' | 'hold' | 'exhale' | 'wait'>('inhale');
  const patternRef = useRef<BreathingPattern | null>(null);

  const {
    timeLeft: count,
    isRunning: isActive,
    start,
    pause,
    reset,
    setTime,
  } = useTimer({
    initialTime: 4,
    onComplete: () => {
      if (!patternRef.current) return;
      const p = PATTERNS[patternRef.current];
      const phases: Record<
        'inhale' | 'hold' | 'exhale' | 'wait',
        'inhale' | 'hold' | 'exhale' | 'wait'
      > = {
        inhale: p.hold > 0 ? 'hold' : 'exhale',
        hold: 'exhale',
        exhale: p.wait > 0 ? 'wait' : 'inhale',
        wait: 'inhale',
      };
      const currentPhase = phaseRef.current;
      const nextPhase = phases[currentPhase];

      // Animate transition on native
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setPhase(nextPhase);
      phaseRef.current = nextPhase;
      setTime(p[nextPhase] || p.inhale);
      // Re-start for the next phase
      setTimeout(() => start(), 0);
    },
  });

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    patternRef.current = pattern;
  }, [pattern]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
  }, []);

  const startPattern = (selectedPattern: BreathingPattern) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPattern(selectedPattern);
    patternRef.current = selectedPattern;
    setPhase('inhale');
    phaseRef.current = 'inhale';
    setTime(PATTERNS[selectedPattern].inhale);
    start();
  };

  const stopPattern = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    reset();
    setPattern(null);
    patternRef.current = null;
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'BREATHE IN';
      case 'hold':
        return 'HOLD';
      case 'exhale':
        return 'BREATHE OUT';
      case 'wait':
        return 'REST';
      default:
        return '';
    }
  };

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale':
        return 1.5;
      case 'hold':
        return 1.5;
      case 'exhale':
        return 1;
      case 'wait':
        return 1;
      default:
        return 1;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>ANCHOR</Text>
            <Text style={styles.subtitle}>
              BREATHING EXERCISES FOR CALM AND FOCUS.
            </Text>
          </View>

          {pattern && (
            <View style={styles.activeContainer}>
              <View style={styles.activeHeader}>
                <Text style={styles.patternName}>{PATTERNS[pattern].name}</Text>
              </View>

              <View style={styles.breathingCircle}>
                <View
                  style={[
                    styles.circle,
                    { transform: [{ scale: getCircleScale() }] },
                  ]}
                />
                <Text style={styles.phaseText}>{getPhaseText()}</Text>
                <Text style={styles.countText}>{count}</Text>
              </View>

              <LinearButton
                title="Stop Session"
                onPress={stopPattern}
                variant="error"
                size="lg"
                style={styles.stopButton}
              />
            </View>
          )}

          {!pattern && (
            <View style={styles.patternsContainer}>
              {(Object.keys(PATTERNS) as BreathingPattern[]).map((p) => (
                <Pressable
                  key={p}
                  style={({
                    pressed,
                    hovered,
                  }: {
                    pressed: boolean;
                    hovered?: boolean;
                  }) => [
                      styles.patternButton,
                      hovered && styles.patternButtonHovered,
                      pressed && styles.patternButtonPressed,
                    ]}
                  onPress={() => startPattern(p)}
                >
                  <View style={styles.patternIcon}>
                    <Text style={styles.patternEmoji}>
                      {p === '478' ? '🌙' : p === 'box' ? '📦' : '⚡'}
                    </Text>
                  </View>
                  <View style={styles.patternInfo}>
                    <Text style={styles.patternButtonText}>
                      {PATTERNS[p].name}
                    </Text>
                    <Text style={styles.patternDetails}>
                      {[
                        { label: 'In', val: PATTERNS[p].inhale },
                        { label: 'Hold', val: PATTERNS[p].hold },
                        { label: 'Out', val: PATTERNS[p].exhale },
                        { label: 'Wait', val: PATTERNS[p].wait },
                      ]
                        .filter((s) => s.val > 0)
                        .map((s) => `${s.label} ${s.val}`)
                        .join(' • ')}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
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
  scrollContent: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: Tokens.layout.maxWidth.prose,
    paddingHorizontal: Tokens.spacing[6],
    paddingTop: Tokens.spacing[12],
    paddingBottom: Tokens.spacing[8],
    alignItems: 'center',
  },
  header: {
    width: '100%',
    marginBottom: Tokens.spacing[10],
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
  activeContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    flex: 1,
    paddingVertical: Tokens.spacing[8],
  },
  activeHeader: {
    alignItems: 'center',
    width: '100%',
  },
  patternName: {
    fontFamily: Tokens.type.fontFamily.sans,
    color: Tokens.colors.brand[400],
    fontSize: Tokens.type['2xl'],
    fontWeight: '600',
    letterSpacing: 1,
  },
  breathingCircle: {
    width: BREATHING_CIRCLE_SIZE,
    height: BREATHING_CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: Tokens.spacing[8],
  },
  circle: {
    width: INNER_CIRCLE_SIZE,
    height: INNER_CIRCLE_SIZE,
    borderRadius: Tokens.radii.full,
    backgroundColor: Tokens.colors.brand[600],
    position: 'absolute',
    opacity: 0.3,
    ...Platform.select({
      web: {
        transition: CIRCLE_TRANSITION,
      },
    }),
  },
  phaseText: {
    fontFamily: Tokens.type.fontFamily.sans,
    color: Tokens.colors.text.primary,
    fontSize: Tokens.type['2xl'],
    fontWeight: '700',
    zIndex: 1,
    marginBottom: Tokens.spacing[2],
    letterSpacing: 1,
  },
  countText: {
    fontFamily: Tokens.type.fontFamily.mono,
    color: Tokens.colors.text.tertiary,
    fontSize: Tokens.type['5xl'],
    fontWeight: '800',
    zIndex: 1,
  },
  stopButton: {
    minWidth: 200,
  },
  patternsContainer: {
    width: '100%',
    gap: Tokens.spacing[4],
    maxWidth: 500,
  },
  patternButton: {
    backgroundColor: Tokens.colors.neutral.darker,
    borderRadius: Tokens.radii.none, // Sharp
    padding: Tokens.spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    ...Platform.select({
      web: {
        transition: Tokens.motion.transitions.base,
        cursor: 'pointer',
      },
    }),
  },
  patternButtonHovered: {
    borderColor: Tokens.colors.brand[500],
    transform: [{ translateY: -2 }],
    ...Platform.select({
      web: {
        boxShadow: HOVER_SHADOW,
      },
    }),
  },
  patternButtonPressed: {
    transform: [{ scale: Tokens.motion.scales.press }],
    backgroundColor: Tokens.colors.neutral.dark,
  },
  patternIcon: {
    width: Tokens.spacing[12],
    height: Tokens.spacing[12],
    borderRadius: 0, // Sharp
    backgroundColor: Tokens.colors.neutral.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Tokens.spacing[4],
  },
  patternEmoji: {
    fontSize: Tokens.type['2xl'],
  },
  patternInfo: {
    flex: 1,
  },
  patternButtonText: {
    fontFamily: Tokens.type.fontFamily.sans,
    color: Tokens.colors.text.primary,
    fontSize: Tokens.type.lg,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 1,
  },
  patternDetails: {
    fontFamily: Tokens.type.fontFamily.sans,
    color: Tokens.colors.text.tertiary,
    fontSize: Tokens.type.sm,
  },
});

export default AnchorScreen;

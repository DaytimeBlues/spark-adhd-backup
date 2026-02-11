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
import { Tokens } from '../theme/tokens';

type BreathingPattern = '478' | 'box' | 'energize';

const PATTERNS: Record<
  BreathingPattern,
  { name: string; inhale: number; hold: number; exhale: number; wait: number }
> = {
  '478': { name: '4-7-8 Relax', inhale: 4, hold: 7, exhale: 8, wait: 0 },
  box: { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4, wait: 4 },
  energize: { name: 'Energize', inhale: 6, hold: 0, exhale: 2, wait: 0 },
};

const HOVER_SHADOW = '0 4px 12px rgba(0,0,0,0.2)';
const CIRCLE_TRANSITION = 'transform 1s ease-in-out';
const BREATHING_CIRCLE_SIZE = 240;
const INNER_CIRCLE_SIZE = 140;

const AnchorScreen = () => {
  const [pattern, setPattern] = useState<BreathingPattern | null>(null);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'wait'>(
    'inhale',
  );
  const [count, setCount] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isActive && pattern) {
      const p = PATTERNS[pattern];
      intervalRef.current = setInterval(() => {
        setCount((prev) => {
          if (prev <= 1) {
            const phases: Record<
              typeof phase,
              'inhale' | 'hold' | 'exhale' | 'wait'
            > = {
              inhale: p.hold > 0 ? 'hold' : 'exhale',
              hold: 'exhale',
              exhale: p.wait > 0 ? 'wait' : 'inhale',
              wait: 'inhale',
            };
            const nextPhase = phases[phase];

            // Animate transition on native
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
            setPhase(nextPhase);
            return p[nextPhase] || p.inhale;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, pattern, phase]);

  const startPattern = (selectedPattern: BreathingPattern) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPattern(selectedPattern);
    setPhase('inhale');
    setCount(PATTERNS[selectedPattern].inhale);
    setIsActive(true);
  };

  const stopPattern = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsActive(false);
    setPattern(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      case 'wait':
        return 'Rest';
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
            <Text style={styles.title}>Anchor</Text>
            <Text style={styles.subtitle}>
              Breathing exercises for calm and focus.
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
    fontFamily: 'Inter',
    color: Tokens.colors.brand[400],
    fontSize: Tokens.type['2xl'],
    fontWeight: '600',
    letterSpacing: -0.5,
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
    fontFamily: 'Inter',
    color: Tokens.colors.text.primary,
    fontSize: Tokens.type['2xl'],
    fontWeight: '700',
    zIndex: 1,
    marginBottom: Tokens.spacing[2],
  },
  countText: {
    fontFamily: 'Inter',
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
    borderRadius: Tokens.radii.xl,
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
    borderRadius: Tokens.radii.full,
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
    fontFamily: 'Inter',
    color: Tokens.colors.text.primary,
    fontSize: Tokens.type.lg,
    fontWeight: '600',
    marginBottom: 4,
  },
  patternDetails: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.tertiary,
    fontSize: Tokens.type.sm,
  },
});

export default AnchorScreen;

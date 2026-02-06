import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { LinearButton } from '../components/ui/LinearButton';
import { Tokens } from '../theme/tokens';

type BreathingPattern = '478' | 'box' | 'energize';

const AnchorScreen = () => {
  const [pattern, setPattern] = useState<BreathingPattern | null>(null);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'wait'>('inhale');
  const [count, setCount] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const patterns: Record<BreathingPattern, { name: string; inhale: number; hold: number; exhale: number; wait: number }> = {
    '478': { name: '4-7-8 Relax', inhale: 4, hold: 7, exhale: 8, wait: 0 },
    'box': { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4, wait: 4 },
    'energize': { name: 'Energize', inhale: 6, hold: 0, exhale: 2, wait: 0 },
  };

  useEffect(() => {
    if (isActive && pattern) {
      const p = patterns[pattern];
      intervalRef.current = setInterval(() => {
        setCount(prev => {
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
            setPhase(nextPhase);
            return p[nextPhase] || p.inhale;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, pattern, phase]);

  const startPattern = (selectedPattern: BreathingPattern) => {
    setPattern(selectedPattern);
    setPhase('inhale');
    setCount(patterns[selectedPattern].inhale);
    setIsActive(true);
  };

  const stopPattern = () => {
    setIsActive(false);
    setPattern(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'wait': return 'Rest';
      default: return '';
    }
  };

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale': return 1.5;
      case 'hold': return 1.5;
      case 'exhale': return 1;
      case 'wait': return 1;
      default: return 1;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Anchor</Text>
            <Text style={styles.subtitle}>Breathing exercises</Text>
          </View>

          {pattern && (
            <View style={styles.activeContainer}>
              <Text style={styles.patternName}>{patterns[pattern].name}</Text>
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
                title="Stop"
                onPress={stopPattern}
                variant="error"
                size="lg"
                style={styles.stopButton}
              />
            </View>
          )}

          {!pattern && (
            <View style={styles.patternsContainer}>
              {(Object.keys(patterns) as BreathingPattern[]).map(p => (
                <TouchableOpacity
                  key={p}
                  style={styles.patternButton}
                  onPress={() => startPattern(p)}>
                  <Text style={styles.patternButtonText}>
                    {patterns[p].name}
                  </Text>
                  <Text style={styles.patternDetails}>
                    {patterns[p].inhale}-{patterns[p].hold > 0 ? patterns[p].hold + '-' : ''}{patterns[p].exhale}
                    {patterns[p].wait > 0 ? '-' + patterns[p].wait : ''}
                  </Text>
                </TouchableOpacity>
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
    backgroundColor: Tokens.colors.neutral[900],
  },
  scrollContent: {
    flex: 1,
    alignItems: 'center', // Centers content for web
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: Tokens.layout.maxWidth.prose,
    padding: Tokens.spacing[16],
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: Tokens.spacing[24],
    left: Tokens.spacing[16],
    width: '100%',
  },
  title: {
    fontSize: Tokens.type['3xl'],
    fontWeight: 'bold',
    color: Tokens.colors.neutral[0],
    marginBottom: Tokens.spacing[4],
  },
  subtitle: {
    fontSize: Tokens.type.base,
    color: Tokens.colors.neutral[300],
  },
  activeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  patternName: {
    color: Tokens.colors.brand[600],
    fontSize: Tokens.type.xl,
    fontWeight: '600',
    marginBottom: Tokens.spacing[48],
  },
  breathingCircle: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Tokens.spacing[48],
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60, // Keep circular
    backgroundColor: Tokens.colors.brand[600],
    position: 'absolute',
  },
  phaseText: {
    color: Tokens.colors.neutral[0],
    fontSize: Tokens.type['2xl'],
    fontWeight: '600',
    zIndex: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  countText: {
    color: Tokens.colors.neutral[0],
    fontSize: Tokens.type['5xl'],
    fontWeight: 'bold',
    zIndex: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  stopButton: {
    backgroundColor: Tokens.colors.danger[500],
    paddingHorizontal: Tokens.spacing[48],
    paddingVertical: Tokens.spacing[16],
    borderRadius: Tokens.radii.pill,
    minHeight: Tokens.layout.minTapTargetComfortable,
    justifyContent: 'center',
    ...Tokens.elevation.sm,
  },
  stopButtonText: {
    color: Tokens.colors.neutral[0],
    fontSize: Tokens.type.lg,
    fontWeight: '600',
  },
  patternsContainer: {
    width: '100%',
    maxWidth: 400, // Limit width of buttons for better look on wide screens
  },
  patternButton: {
    backgroundColor: Tokens.colors.neutral[800],
    borderRadius: Tokens.radii.lg,
    padding: Tokens.spacing[24], // 20 -> 24 for better touch area
    marginBottom: Tokens.spacing[12],
    alignItems: 'center',
    minHeight: 80, // Ensure substantial target
    justifyContent: 'center',
    ...Tokens.elevation.sm,
  },
  patternButtonText: {
    color: Tokens.colors.neutral[0],
    fontSize: Tokens.type.lg,
    fontWeight: '600',
    marginBottom: Tokens.spacing[4],
  },
  patternDetails: {
    color: Tokens.colors.neutral[300],
    fontSize: Tokens.type.sm,
  },
});

export default AnchorScreen;

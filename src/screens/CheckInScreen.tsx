import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Platform,
} from 'react-native';
import { LinearCard } from '../components/ui/LinearCard';
import { Tokens } from '../theme/tokens';

const CheckInScreen = () => {
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);

  const moods = [
    { emoji: '😢', label: 'Low', value: 1 },
    { emoji: '😕', label: 'Down', value: 2 },
    { emoji: '😐', label: 'Neutral', value: 3 },
    { emoji: '🙂', label: 'Good', value: 4 },
    { emoji: '😊', label: 'Great', value: 5 },
  ];

  const energyLevels = [
    { emoji: '🪫', label: 'Drained', value: 1 },
    { emoji: '🔋', label: 'Low', value: 2 },
    { emoji: '⚡', label: 'Medium', value: 3 },
    { emoji: '🚀', label: 'High', value: 4 },
    { emoji: '🔥', label: 'Full', value: 5 },
  ];

  const HOVER_SHADOW = '0 4px 12px rgba(0,0,0,0.2)';

  const getRecommendation = () => {
    if (mood === null || energy === null) {
      return null;
    }
    if (mood <= 2 && energy <= 2) {
      return {
        title: '🌱 Gentle Start',
        desc: 'Try the Anchor breathing exercise to ground yourself.',
      };
    }
    if (mood >= 4 && energy >= 4) {
      return {
        title: '🚀 Ride the Wave',
        desc: 'Perfect time for a Ignite focus session!',
      };
    }
    if (energy <= 2) {
      return {
        title: '💪 Micro Task',
        desc: 'Try Fog Cutter with just one micro-step.',
      };
    }
    return { title: '📝 Brain Dump', desc: 'Clear your mind before starting.' };
  };

  const recommendation = getRecommendation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.webContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Check In</Text>
          <Text style={styles.subtitle}>How are you feeling right now?</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mood</Text>
            <View style={styles.options}>
              {moods.map((m) => (
                <Pressable
                  key={m.value}
                  style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                    styles.option,
                    mood === m.value && styles.selected,
                    hovered && !mood && styles.optionHovered,
                    pressed && styles.optionPressed,
                  ]}
                  onPress={() => setMood(m.value)}
                >
                  <Text style={styles.emoji}>{m.emoji}</Text>
                  <Text
                    style={[
                      styles.label,
                      mood === m.value && styles.selectedLabel,
                    ]}
                  >
                    {m.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Energy</Text>
            <View style={styles.options}>
              {energyLevels.map((e) => (
                <Pressable
                  key={e.value}
                  style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                    styles.option,
                    energy === e.value && styles.selected,
                    hovered && !energy && styles.optionHovered,
                    pressed && styles.optionPressed,
                  ]}
                  onPress={() => setEnergy(e.value)}
                >
                  <Text style={styles.emoji}>{e.emoji}</Text>
                  <Text
                    style={[
                      styles.label,
                      energy === e.value && styles.selectedLabel,
                    ]}
                  >
                    {e.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {recommendation && (
            <LinearCard
              title={recommendation.title}
              subtitle="Recommended for you"
              style={styles.recommendation}
            >
              <Text style={styles.recommendationText}>
                {recommendation.desc}
              </Text>
            </LinearCard>
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
  webContainer: {
    flex: 1,
    width: '100%',
    maxWidth: Tokens.layout.maxWidth.prose,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    padding: Tokens.spacing[6],
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
    marginBottom: Tokens.spacing[10],
    textAlign: 'center',
  },
  section: {
    marginBottom: Tokens.spacing[8],
  },
  sectionTitle: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.primary,
    fontSize: Tokens.type.sm,
    fontWeight: '600',
    marginBottom: Tokens.spacing[4],
    letterSpacing: 0.5,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Tokens.spacing[3],
  },
  option: {
    flexGrow: 1,
    flexBasis: 100,
    alignItems: 'center',
    padding: Tokens.spacing[2],
    borderRadius: Tokens.radii.xl,
    backgroundColor: Tokens.colors.neutral.darker,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    justifyContent: 'center',
    ...Platform.select({
      web: {
        transition: Tokens.motion.transitions.base,
        cursor: 'pointer',
      },
    }),
  },
  optionHovered: {
    borderColor: Tokens.colors.text.tertiary,
    transform: [{ translateY: -2 }],
    ...Platform.select({
      web: {
        boxShadow: HOVER_SHADOW,
      },
    }),
  },
  optionPressed: {
    transform: [{ scale: Tokens.motion.scales.press }],
    backgroundColor: Tokens.colors.neutral.dark,
  },
  selected: {
    borderColor: Tokens.colors.brand[500],
    backgroundColor: Tokens.colors.brand[900],
    transform: [{ translateY: -4 }],
    ...Tokens.elevation.md,
    ...Platform.select({
      web: {
        boxShadow: `0 8px 24px -4px ${Tokens.colors.brand[900]}`,
      },
    }),
  },
  emoji: {
    fontSize: 28,
    marginBottom: Tokens.spacing[2],
  },
  label: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.tertiary,
    fontSize: Tokens.type.xs,
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedLabel: {
    color: Tokens.colors.text.primary,
    fontWeight: '700',
  },
  recommendation: {
    marginTop: Tokens.spacing[4],
  },
  recommendationText: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.primary,
    fontSize: Tokens.type.base,
    lineHeight: 24,
  },
});

export default CheckInScreen;

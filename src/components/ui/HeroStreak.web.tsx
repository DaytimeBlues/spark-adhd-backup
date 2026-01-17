/**
 * HeroStreak.web.tsx
 * Web-specific implementation: NO Reanimated import.
 * Renders static pulse circles instead of animated ones.
 * This file is automatically resolved by webpack when Platform.OS === 'web'
 * due to resolve.extensions order: ['.web.tsx', '.tsx']
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { colors, spacing } from "../../theme";
import AppText from "./AppText";
import GlassCard from "./GlassCard";

interface HeroStreakProps {
    streak: number;
}

// Static pulse circle for web (no animation)
const PulseCircle = ({ index }: { index: number }) => {
    // Stagger opacity and scale slightly for visual depth
    const scales = [1.0, 1.2, 1.4];
    const opacities = [0.3, 0.2, 0.1];

    return (
        <View
            testID="pulse-circle"
            style={[
                styles.pulse,
                {
                    opacity: opacities[index] || 0.2,
                    transform: [{ scale: scales[index] || 1.2 }],
                },
            ]}
        />
    );
};

const HeroStreak = ({ streak }: HeroStreakProps) => {
    const pulses = [0, 1, 2];

    return (
        <View style={styles.container}>
            <GlassCard style={styles.card} variant="highlight">
                <View style={styles.content}>
                    <AppText variant="sectionTitle" style={styles.label}>
                        Current Streak
                    </AppText>

                    <View style={styles.flameContainer}>
                        {/* Static pulse circles behind the flame */}
                        {pulses.map((i) => (
                            <PulseCircle key={i} index={i} />
                        ))}

                        <Icon
                            name="fire"
                            size={64}
                            color={colors.palette.ignite}
                            style={styles.icon}
                        />
                    </View>

                    <View style={styles.statsRow}>
                        <AppText variant="screenTitle" style={styles.count}>
                            {streak}
                        </AppText>
                        <AppText variant="body" style={styles.days}>
                            days
                        </AppText>
                    </View>

                    <AppText variant="smallMuted" style={styles.motivation}>
                        You're on fire! Keep the momentum going.
                    </AppText>
                </View>
            </GlassCard>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing[24],
    },
    card: {
        alignItems: "center",
        paddingVertical: spacing[32],
    },
    content: {
        alignItems: "center",
    },
    label: {
        color: colors.glass.textMuted,
        marginBottom: spacing[16],
        textTransform: "uppercase",
        letterSpacing: 2,
        fontSize: 12,
    },
    flameContainer: {
        width: 100,
        height: 100,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing[16],
    },
    icon: {
        zIndex: 2,
    },
    pulse: {
        position: "absolute",
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(255, 107, 107, 0.2)",
        zIndex: 1,
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "baseline",
        marginBottom: spacing[8],
    },
    count: {
        fontSize: 48,
        color: colors.text,
        fontWeight: "bold",
        marginRight: spacing[4],
    },
    days: {
        fontSize: 20,
        color: colors.glass.textMuted,
    },
    motivation: {
        color: colors.glass.textMuted,
    },
});

export default HeroStreak;

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    Linking,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Tokens } from '../theme/tokens';

type CBTCategory = {
    id: string;
    title: string;
    emoji: string;
    pillar: string;
    description: string;
    features: { name: string; route: string; icon: string }[];
};

const CBTGuideScreen = ({ navigation }: any) => {
    const categories: CBTCategory[] = [
        {
            id: 'activation',
            title: 'Behavioral Activation',
            emoji: '🎯',
            pillar: 'CADDI Pillar',
            description: "Can't start tasks? Feeling stuck or procrastinating? These tools help overcome initiation paralysis.",
            features: [
                { name: 'Ignite', route: 'Focus', icon: 'fire' },
                { name: 'Pomodoro', route: 'Pomodoro', icon: 'timer-sand' },
            ],
        },
        {
            id: 'organization',
            title: 'Organization',
            emoji: '📋',
            pillar: 'CADDI Pillar',
            description: 'Overwhelmed by too many tasks? Break them down and externalize your working memory.',
            features: [
                { name: 'Fog Cutter', route: 'FogCutter', icon: 'weather-windy' },
                { name: 'Brain Dump', route: 'Tasks', icon: 'text-box-outline' },
            ],
        },
        {
            id: 'mindfulness',
            title: 'Mindfulness',
            emoji: '🧘',
            pillar: 'CADDI Pillar',
            description: 'Racing thoughts? Impulsive reactions? Build awareness and emotional regulation.',
            features: [
                { name: 'Anchor', route: 'Anchor', icon: 'anchor' },
            ],
        },
        {
            id: 'tracking',
            title: 'Self-Tracking',
            emoji: '📊',
            pillar: 'CBT Strategy',
            description: 'Recognize patterns in your mood, energy, and productivity over time.',
            features: [
                { name: 'Check In', route: 'CheckIn', icon: 'chart-bar' },
                { name: 'Calendar', route: 'Calendar', icon: 'calendar' },
            ],
        },
    ];

    const handleFeaturePress = (route: string) => {
        navigation.navigate(route);
    };

    const openSource = (url: string) => {
        Linking.openURL(url);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.maxWidthWrapper}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Icon name="arrow-left" size={24} color={Tokens.colors.text.primary} />
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.headerTitle}>CBT for ADHD</Text>
                            <Text style={styles.headerSubtitle}>Evidence-based strategies</Text>
                        </View>
                    </View>

                    <View style={styles.introCard}>
                        <Text style={styles.introTitle}>📚 About CADDI</Text>
                        <Text style={styles.introText}>
                            CADDI (CBT for ADHD-Inattentive) is a research-backed protocol from Karolinska Institute
                            focusing on three pillars: Behavioral Activation, Organization, and Mindfulness.
                        </Text>
                        <TouchableOpacity
                            style={styles.sourceLink}
                            onPress={() => openSource('https://pubmed.ncbi.nlm.nih.gov/')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.sourceLinkText}>View Research Sources →</Text>
                        </TouchableOpacity>
                    </View>

                    {categories.map((category, index) => (
                        <View
                            key={category.id}
                            style={styles.categoryCard}
                        >
                            <View style={styles.categoryHeader}>
                                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                                <View style={styles.categoryTitleContainer}>
                                    <Text style={styles.categoryTitle}>{category.title}</Text>
                                    <Text style={styles.categoryPillar}>{category.pillar}</Text>
                                </View>
                            </View>
                            <Text style={styles.categoryDescription}>{category.description}</Text>
                            <View style={styles.featuresRow}>
                                {category.features.map((feature) => (
                                    <TouchableOpacity
                                        key={feature.route}
                                        style={styles.featureButton}
                                        onPress={() => handleFeaturePress(feature.route)}
                                        activeOpacity={0.6}
                                    >
                                        <View style={styles.featureIconContainer}>
                                            <Icon name={feature.icon} size={18} color={Tokens.colors.indigo.primary} />
                                        </View>
                                        <Text style={styles.featureButtonText}>{feature.name}</Text>
                                        <Icon name="chevron-right" size={14} color={Tokens.colors.text.tertiary} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Tokens.colors.neutral.darkest,
    },
    scrollContent: {
        flexGrow: 1,
        padding: Tokens.spacing[6],
        alignItems: 'center',
    },
    maxWidthWrapper: {
        width: '100%',
        maxWidth: 680,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Tokens.spacing[6],
        paddingTop: Tokens.spacing[4],
    },
    backButton: {
        marginRight: Tokens.spacing[4],
        padding: Tokens.spacing[2],
    },
    headerTitle: {
        fontFamily: 'Inter',
        fontSize: Tokens.type.xl || 24,
        fontWeight: '700',
        color: Tokens.colors.text.primary,
        letterSpacing: -0.6,
    },
    headerSubtitle: {
        fontFamily: 'Inter',
        fontSize: Tokens.type.base,
        color: Tokens.colors.text.secondary,
        marginTop: 4,
        letterSpacing: 0.1,
    },
    introCard: {
        backgroundColor: Tokens.colors.neutral.darker,
        borderRadius: Tokens.radii.lg,
        padding: Tokens.spacing[5],
        marginBottom: Tokens.spacing[6],
        borderWidth: 1,
        borderColor: Tokens.colors.neutral.borderSubtle,
    },
    introTitle: {
        fontFamily: 'Inter',
        fontSize: Tokens.type.base,
        fontWeight: '600',
        color: Tokens.colors.text.primary,
        marginBottom: Tokens.spacing[2],
    },
    introText: {
        fontFamily: 'Inter',
        fontSize: Tokens.type.sm,
        color: Tokens.colors.text.secondary,
        lineHeight: 20,
    },
    sourceLink: {
        marginTop: Tokens.spacing[3],
    },
    sourceLinkText: {
        fontFamily: 'Inter',
        fontSize: Tokens.type.sm,
        color: Tokens.colors.indigo.primary,
        fontWeight: '500',
    },
    categoryCard: {
        backgroundColor: Tokens.colors.neutral.darker,
        borderRadius: Tokens.radii.lg,
        padding: Tokens.spacing[5],
        marginBottom: Tokens.spacing[4],
        borderWidth: 1,
        borderColor: Tokens.colors.neutral.borderSubtle,
        ...Platform.select({
            web: {
                transition: 'transform 0.2s ease, border-color 0.2s ease',
            },
        }),
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Tokens.spacing[3],
    },
    categoryEmoji: {
        fontSize: 28,
        marginRight: Tokens.spacing[3],
    },
    categoryTitleContainer: {
        flex: 1,
    },
    categoryTitle: {
        fontFamily: 'Inter',
        fontSize: Tokens.type.base,
        fontWeight: '600',
        color: Tokens.colors.text.primary,
        letterSpacing: -0.4,
    },
    categoryPillar: {
        fontFamily: 'Inter',
        fontSize: Tokens.type.xs,
        color: Tokens.colors.indigo.primary,
        marginTop: 2,
        fontWeight: '500',
    },
    categoryDescription: {
        fontFamily: 'Inter',
        fontSize: Tokens.type.sm,
        color: Tokens.colors.text.secondary,
        lineHeight: 20,
        marginBottom: Tokens.spacing[4],
    },
    featuresRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Tokens.spacing[2],
    },
    featureButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Tokens.colors.neutral.dark,
        paddingVertical: Tokens.spacing[2],
        paddingHorizontal: Tokens.spacing[3],
        borderRadius: Tokens.radii.md,
        gap: Tokens.spacing[2],
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        ...Platform.select({
            web: {
                cursor: 'pointer',
                transition: 'all 0.2s ease',
            },
        }),
    },
    featureIconContainer: {
        width: 32,
        height: 32,
        borderRadius: Tokens.radii.sm,
        backgroundColor: `${Tokens.colors.indigo.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureButtonText: {
        fontFamily: 'Inter',
        fontSize: Tokens.type.sm,
        color: Tokens.colors.text.primary,
        fontWeight: '500',
    },
});

export default CBTGuideScreen;

import React, { useCallback, useState, memo } from 'react';
import {
  Animated,
  AnimatedStyleProp,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Tokens } from '../../theme/tokens';
import HapticsService from '../../services/HapticsService';

export type ModeCardMode = {
  name: string;
  icon: string;
  desc: string;
  accent: string;
};

export type ModeCardProps = {
  mode: ModeCardMode;
  onPress: () => void;
  style?: ViewStyle;
  animatedStyle?: AnimatedStyleProp<ViewStyle>;
  testID?: string;
};

type WebInteractiveStyle = {
  outlineColor?: string;
  outlineStyle?: 'solid' | 'dotted' | 'dashed';
  outlineWidth?: number;
  outlineOffset?: number;
  cursor?: 'pointer';
  transition?: string;
};

const CARD_MIN_HEIGHT = 140;
const DOT_SIZE = 4; // Smaller, sharper dots
const ICON_SIZE = 28;

function ModeCardComponent({
  mode,
  onPress,
  style,
  animatedStyle,
  testID,
}: ModeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hoverStyle: WebInteractiveStyle | undefined =
    Platform.OS === 'web' && (isHovered || isFocused)
      ? {
          borderColor: Tokens.colors.brand[500], // Red accent
          backgroundColor: Tokens.colors.neutral.dark,
          transform: [{ translateY: -2 }], // Subtle lift
        }
      : undefined;

  const focusStyle: WebInteractiveStyle | undefined =
    Platform.OS === 'web' && isFocused
      ? {
          outlineColor: Tokens.colors.brand[500],
          outlineStyle: 'solid',
          outlineWidth: 2,
          outlineOffset: 2,
        }
      : undefined;

  const handlePress = useCallback(() => {
    HapticsService.tap({ key: 'modeCard' });
    onPress();
  }, [onPress]);

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        testID={testID}
        accessibilityLabel={`${mode.name} mode`}
        accessibilityHint={`Open ${mode.name}. ${mode.desc}`}
        accessibilityRole="button"
        onPress={handlePress}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={({ pressed }) => [
          styles.card,
          Platform.OS === 'web' && {
            cursor: 'pointer',
            transition: Tokens.motion.transitions.fast, // Fast linear
          },
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }, // Subtle press
          hoverStyle,
          focusStyle,
        ]}
      >
        <View style={styles.cardHeader}>
          {/* Dot Matrix Icon Container Style */}
          <View
            style={[
              styles.iconContainer,
              styles.iconContainerTransparent,
              {
                borderColor: isHovered
                  ? Tokens.colors.brand[500]
                  : Tokens.colors.neutral.border,
              },
            ]}
          >
            <Icon
              name={mode.icon}
              size={ICON_SIZE}
              color={
                isHovered
                  ? Tokens.colors.brand[500]
                  : Tokens.colors.text.primary
              }
            />
          </View>

          {/* Status Dot */}
          <View
            style={[
              styles.accentDot,
              {
                backgroundColor: isHovered
                  ? Tokens.colors.brand[500]
                  : Tokens.colors.neutral.borderSubtle,
              },
            ]}
          />
        </View>

        <View style={styles.cardContent}>
          <Text
            style={[
              styles.cardTitle,
              isHovered && { color: Tokens.colors.brand[500] },
            ]}
          >
            {mode.name.toUpperCase()}
          </Text>
          <Text style={styles.cardDesc} numberOfLines={2}>
            {mode.desc}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Tokens.spacing[4],
    borderRadius: Tokens.radii.none, // Sharp
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    backgroundColor: Tokens.colors.neutral.darker,
    minHeight: CARD_MIN_HEIGHT,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Tokens.radii.none, // Sharp
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dotted', // Dot matrix feel
  },
  iconContainerTransparent: {
    backgroundColor: 'transparent',
  },
  accentDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: 0, // Square dot
  },
  cardContent: {
    marginTop: Tokens.spacing[3],
  },
  cardTitle: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.sm,
    fontWeight: '700',
    color: Tokens.colors.text.primary,
    marginBottom: Tokens.spacing[1],
    letterSpacing: 1.5, // Consistent industrial tracking
  },
  cardDesc: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.xs,
    color: Tokens.colors.text.secondary,
    lineHeight: 18,
    letterSpacing: 0.5,
  },
});

// Memoize for performance - prevents unnecessary re-renders
export default memo(ModeCardComponent);

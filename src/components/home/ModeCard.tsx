import { Platform, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Tokens } from '../../theme/tokens';

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
  animatedStyle?: any;
  testID?: string;
};

const CARD_MIN_HEIGHT = 140;
const DOT_SIZE = 8;
const ICON_SIZE = 28;

export default function ModeCard({ mode, onPress, style, animatedStyle, testID }: ModeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hoverStyle =
    Platform.OS === 'web' && (isHovered || isFocused)
      ? ({
        borderColor: mode.accent,
        backgroundColor: `${Tokens.colors.neutral.dark}E6`, // 90% opacity for glass effect
        boxShadow: `0 0 25px ${mode.accent}25`, // Subtle colored glow
        transform: [{ scale: 1.02 }],
      } as any)
      : {};

  const focusStyle =
    Platform.OS === 'web' && isFocused
      ? {
        outlineColor: mode.accent,
        outlineStyle: 'solid',
        outlineWidth: 2,
        outlineOffset: 4,
      }
      : {};

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        testID={testID}
        accessibilityLabel={testID}
        accessibilityRole="button"
        onPress={onPress}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={({ pressed }) => [
          styles.card,
          Platform.OS === 'web' && {
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          pressed && { transform: [{ scale: 0.98 }] },
          hoverStyle,
          focusStyle as any,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${mode.accent}20` }]}>
            <Icon name={mode.icon} size={ICON_SIZE} color={mode.accent} />
          </View>
          <View style={[styles.accentDot, { backgroundColor: mode.accent, boxShadow: `0 0 10px ${mode.accent}` } as any]} />
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{mode.name}</Text>
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
    borderRadius: Tokens.radii.lg,
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
    borderRadius: Tokens.radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  accentDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: Tokens.radii.full,
  },
  cardContent: {
    marginTop: Tokens.spacing[3],
  },
  cardTitle: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.base,
    fontWeight: '600',
    color: Tokens.colors.text.primary,
    marginBottom: Tokens.spacing[1],
    letterSpacing: -0.5,
  },
  cardDesc: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.xs,
    color: Tokens.colors.text.secondary,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
});

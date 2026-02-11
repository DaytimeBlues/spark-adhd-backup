import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Colors, Spacing, TypeScale, Radii, Tokens } from '../../theme/tokens';

interface LinearButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'error';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const LinearButton: React.FC<LinearButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'ghost':
        return styles.ghost;
      case 'error':
        return styles.error;
      default:
        return styles.primary;
    }
  };

  const getVariantTextStyles = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'ghost':
        return styles.ghostText;
      case 'error':
        return styles.errorText;
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return styles.sm;
      case 'lg':
        return styles.lg;
      default:
        return styles.md;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({
        pressed,
        hovered,
      }: {
        pressed: boolean;
        hovered?: boolean;
      }) => [
        styles.base,
        getSizeStyles(),
        getVariantStyles(),
        hovered && !disabled && !pressed && styles.hovered,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'primary' ? Colors.text.primary : Colors.indigo.primary
          }
        />
      ) : (
        <Text
          style={[
            styles.text,
            getVariantTextStyles(),
            size === 'sm' && styles.smText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  sm: {
    paddingVertical: Spacing[1],
    paddingHorizontal: Spacing[2],
  },
  md: {
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
    minHeight: 36,
  },
  lg: {
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[6],
    minHeight: 44,
  },
  primary: {
    backgroundColor: Colors.indigo.primary,
    borderWidth: 1,
    borderColor: Colors.indigo.primary,
  },
  secondary: {
    backgroundColor: Colors.neutral.dark,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  error: {
    backgroundColor: Colors.error.subtle,
    borderWidth: 1,
    borderColor: Colors.error.main,
  },
  hovered: {
    transform: [{ translateY: -1 }],
    ...Platform.select({
      web: {
        filter: 'brightness(1.1)',
      },
    }),
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: Tokens.motion.scales.press }],
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: TypeScale.base,
    letterSpacing: -0.1,
  },
  smText: {
    fontSize: TypeScale.sm,
  },
  primaryText: {
    color: Colors.text.primary,
  },
  secondaryText: {
    color: Colors.text.primary,
  },
  ghostText: {
    color: Colors.text.secondary,
  },
  errorText: {
    color: Colors.error.main,
  },
});

import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Tokens } from '../../theme/tokens';
import HapticsService from '../../services/HapticsService';

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

  const handlePress = () => {
    HapticsService.tap({ key: 'primaryAction' });
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
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
            variant === 'primary'
              ? Tokens.colors.text.primary
              : Tokens.colors.brand[500]
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
          {title.toUpperCase()}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Tokens.radii.none, // Sharp corners
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: Tokens.motion.transitions.fast,
      },
    }),
  },
  sm: {
    paddingVertical: Tokens.spacing[1],
    paddingHorizontal: Tokens.spacing[2],
  },
  md: {
    paddingVertical: Tokens.spacing[2],
    paddingHorizontal: Tokens.spacing[4],
    minHeight: 36,
  },
  lg: {
    paddingVertical: Tokens.spacing[3],
    paddingHorizontal: Tokens.spacing[6],
    minHeight: Tokens.layout.minTapTarget, // 44px
  },
  primary: {
    backgroundColor: Tokens.colors.brand[500],
    borderWidth: 1,
    borderColor: Tokens.colors.brand[500],
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.border,
    borderStyle: 'solid', // Changed from dashed to solid for cleaner look
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  error: {
    backgroundColor: Tokens.colors.error.subtle,
    borderWidth: 1,
    borderColor: Tokens.colors.error.main,
  },
  hovered: {
    transform: [{ translateY: -1 }],
    ...Platform.select({
      web: {
        // Industrial hover: sharp contrast shift, no blur
        opacity: 0.9,
      },
    }),
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }], // Tighter press scale
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: Tokens.colors.neutral.dark,
    borderColor: Tokens.colors.neutral.borderSubtle,
  },
  text: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontWeight: '700',
    fontSize: Tokens.type.sm, // Slightly smaller for uppercase
    letterSpacing: 1.5, // Wider spacing for uppercase
  },
  smText: {
    fontSize: Tokens.type.xs,
  },
  primaryText: {
    color: Tokens.colors.text.primary,
  },
  secondaryText: {
    color: Tokens.colors.text.primary,
  },
  ghostText: {
    color: Tokens.colors.text.secondary,
  },
  errorText: {
    color: Tokens.colors.error.main,
  },
});

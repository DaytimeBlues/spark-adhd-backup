import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { MetroPalette, MetroSpacing, MetroTypography } from '../../theme/metroTheme';

interface MetroButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'filled' | 'outline' | 'link';
  accentColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const MetroButton: React.FC<MetroButtonProps> = ({
  title,
  onPress,
  variant = 'filled',
  accentColor = MetroPalette.blue,
  disabled = false,
  style,
  textStyle,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        disabled && styles.disabled,
        variant === 'filled' && { backgroundColor: disabled ? MetroPalette.darkGray : accentColor },
        variant === 'outline' && { 
          borderColor: disabled ? MetroPalette.gray : accentColor, 
          borderWidth: 2,
          backgroundColor: 'transparent'
        },
        variant === 'link' && { backgroundColor: 'transparent' },
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {({ pressed }) => (
        <Text
          style={[
            styles.text,
            variant === 'filled' && { color: MetroPalette.white },
            variant === 'outline' && { color: disabled ? MetroPalette.gray : accentColor },
            variant === 'link' && { 
              color: disabled ? MetroPalette.gray : accentColor,
              textDecorationLine: 'underline'
            },
            pressed && variant === 'link' && { opacity: 0.7 },
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
    paddingVertical: MetroSpacing.m,
    paddingHorizontal: MetroSpacing.l,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0, // Explicitly sharp
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }], // Subtle press effect
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontFamily: MetroTypography.fontFamily,
    fontWeight: MetroTypography.weights.bold,
    fontSize: MetroTypography.sizes.body,
    letterSpacing: MetroTypography.letterSpacing.uppercase,
  },
});

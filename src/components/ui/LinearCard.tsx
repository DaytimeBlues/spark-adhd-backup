import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Tokens } from '../../theme/tokens';

interface LinearCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  style?: ViewStyle;
  headerStyle?: ViewStyle;
  footer?: React.ReactNode;
}

export const LinearCard: React.FC<LinearCardProps> = ({
  children,
  title,
  subtitle,
  style,
  headerStyle,
  footer,
}) => {
  return (
    <View style={[styles.container, style]}>
      {(title || subtitle) && (
        <View style={[styles.header, headerStyle]}>
          {title && <Text style={styles.title}>{title.toUpperCase()}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      <View style={styles.content}>{children}</View>
      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Tokens.colors.neutral.darker,
    borderRadius: Tokens.radii.none, // Sharp
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.border,
    overflow: 'hidden',
  },
  header: {
    paddingVertical: Tokens.spacing[3],
    paddingHorizontal: Tokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Tokens.colors.neutral.borderSubtle,
    backgroundColor: Tokens.colors.neutral.dark, // Slightly lighter than container
  },
  title: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontWeight: '700',
    fontSize: Tokens.type.sm,
    color: Tokens.colors.text.primary,
    marginBottom: Tokens.spacing[1],
    letterSpacing: 1.5, // Industrial wide tracking
  },
  subtitle: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontWeight: '400',
    fontSize: Tokens.type.xs,
    color: Tokens.colors.text.secondary,
    letterSpacing: 0.5,
  },
  content: {
    padding: Tokens.spacing[4],
  },
  footer: {
    padding: Tokens.spacing[3],
    backgroundColor: Tokens.colors.neutral.dark,
    borderTopWidth: 1,
    borderTopColor: Tokens.colors.neutral.borderSubtle,
  },
});

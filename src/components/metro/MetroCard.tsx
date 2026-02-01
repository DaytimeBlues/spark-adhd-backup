import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { MetroPalette, MetroSpacing, MetroTypography } from '../../theme/metroTheme';

interface MetroCardProps {
  children: React.ReactNode;
  title?: string;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export const MetroCard: React.FC<MetroCardProps> = ({
  children,
  title,
  style,
  contentStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      {title && (
        <Text style={styles.header}>
          {title.toUpperCase()}
        </Text>
      )}
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: MetroPalette.darkGray, // Subtle contrast against pure black bg
    padding: MetroSpacing.m,
    marginBottom: MetroSpacing.m,
    width: '100%',
    borderWidth: 0,
    borderRadius: 0,
  },
  header: {
    fontFamily: MetroTypography.fontFamily,
    fontSize: MetroTypography.sizes.caption,
    fontWeight: MetroTypography.weights.bold,
    color: MetroPalette.gray,
    marginBottom: MetroSpacing.s,
    letterSpacing: MetroTypography.letterSpacing.uppercase,
  },
  content: {
    // Default flow
  },
});

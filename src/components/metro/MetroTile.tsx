import React, { useState } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, View } from 'react-native';
import { MetroPalette, MetroSpacing, MetroTypography } from '../../theme/metroTheme';

type TileSize = 'small' | 'medium' | 'wide';

interface MetroTileProps {
  title: string;
  count?: string | number;
  icon?: React.ReactNode;
  size?: TileSize;
  accentColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

const MAX_SHORT_LABEL_LENGTH = 12;

const normalizeDisplayLabel = (value: string): string => {
  const trimmed = value.trim();
  const isLongLabel = trimmed.length > MAX_SHORT_LABEL_LENGTH;
  const isAllCaps = trimmed === trimmed.toUpperCase();

  if (isLongLabel && isAllCaps) {
    const lower = trimmed.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  return trimmed;
};

const resolveForegroundColor = (backgroundColor: string): string => {
  const match = backgroundColor.match(/^#([\da-f]{6})$/i);
  if (!match) {
    return MetroPalette.white;
  }

  const value = match[1];
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.62 ? MetroPalette.black : MetroPalette.white;
};

export const MetroTile: React.FC<MetroTileProps> = ({
  title,
  count,
  icon,
  size = 'medium',
  accentColor = MetroPalette.blue,
  onPress,
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const foregroundColor = resolveForegroundColor(accentColor);
  const accessibleTitle = normalizeDisplayLabel(title);

  const getSizeStyles = (size: TileSize): ViewStyle => {
    // Assuming a base unit width for the grid column
    // This is approximate; in a real grid this would be controlled by parent
    switch (size) {
      case 'small': return { width: 100, height: 100 };
      case 'medium': return { width: 150, height: 150 };
      case 'wide': return { width: 310, height: 150 }; // 2x medium + gutter
      default: return { width: 150, height: 150 };
    }
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${accessibleTitle}`}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={({ pressed }) => [
        styles.base,
        getSizeStyles(size),
        { backgroundColor: accentColor },
        pressed && styles.pressed,
        isFocused && styles.focused,
        isFocused && { borderColor: foregroundColor },
        style,
      ]}
    >
      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          {count !== undefined && (
            <Text style={[styles.count, { color: foregroundColor }]}>{count}</Text>
          )}
        </View>
        
        <Text style={[styles.title, { color: foregroundColor }]} numberOfLines={2}>
          {accessibleTitle}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    padding: MetroSpacing.m,
    justifyContent: 'flex-end', // Text at bottom
    marginBottom: MetroSpacing.gutter,
    marginRight: MetroSpacing.gutter,
    borderRadius: 0,
    minWidth: 48,
    minHeight: 48,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.92,
  },
  focused: {
    borderWidth: 2,
    borderColor: MetroPalette.white,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: MetroSpacing.s,
  },
  iconContainer: {
    // Placeholder for icon alignment
  },
  count: {
    fontFamily: MetroTypography.fontFamily,
    fontSize: MetroTypography.sizes.h3,
    fontWeight: MetroTypography.weights.regular,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  title: {
    fontFamily: MetroTypography.fontFamily,
    fontSize: MetroTypography.sizes.body,
    fontWeight: MetroTypography.weights.regular,
    marginTop: 'auto', // Pushes to bottom if no flex
  },
});

import React from 'react';
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

export const MetroTile: React.FC<MetroTileProps> = ({
  title,
  count,
  icon,
  size = 'medium',
  accentColor = MetroPalette.blue,
  onPress,
  style,
}) => {
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
      style={({ pressed }) => [
        styles.base,
        getSizeStyles(size),
        { backgroundColor: accentColor },
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          {count !== undefined && (
            <Text style={styles.count}>{count}</Text>
          )}
        </View>
        
        <Text style={styles.title} numberOfLines={2}>
          {title}
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
  },
  pressed: {
    transform: [{ scale: 0.97 }],
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
    color: MetroPalette.white,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  title: {
    fontFamily: MetroTypography.fontFamily,
    fontSize: MetroTypography.sizes.body,
    fontWeight: MetroTypography.weights.regular,
    color: MetroPalette.white,
    marginTop: 'auto', // Pushes to bottom if no flex
  },
});

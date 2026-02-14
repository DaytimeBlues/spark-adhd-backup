import React from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tokens } from '../theme/tokens';
import HapticsService from '../services/HapticsService';

export const WebNavBar = ({ state, navigation }: BottomTabBarProps) => {
  const { width } = useWindowDimensions();
  // Mobile breakpoint for "Android Chrome" feel vs desktop
  // We want to keep it usable on small screens.
  const isSmallScreen = width < 450;

  return (
    <View
      style={{
        flexDirection: 'row',
        height: 64,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: isSmallScreen
          ? Tokens.spacing[3]
          : Tokens.spacing[6],
        backgroundColor: Tokens.colors.neutral.darkest,
        borderBottomWidth: 1,
        borderBottomColor: Tokens.colors.neutral.borderSubtle,
        position: Platform.OS === 'web' ? 'absolute' : 'relative',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000, // Ensure it stays on top
      }}
    >
      {/* Logo Area */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text
          style={{
            color: Tokens.colors.text.primary,
            fontFamily: Tokens.type.fontFamily.sans,
            fontSize: Tokens.type.h3,
            fontWeight: '700',
            letterSpacing: 1,
          }}
        >
          SPARK
        </Text>
      </View>

      {/* Navigation Links */}
      <View
        style={{
          flexDirection: 'row',
          gap: isSmallScreen ? Tokens.spacing[1] : Tokens.spacing[4], // Wider gap for desktop
        }}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            HapticsService.tap({ key: 'navTab', minIntervalMs: 140 });
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: Tokens.spacing[3],
                paddingHorizontal: Tokens.spacing[2],
                backgroundColor: 'transparent', // No background pill
                borderBottomWidth: 2,
                borderBottomColor: isFocused
                  ? Tokens.colors.indigo.primary
                  : 'transparent',
                opacity: pressed ? 0.7 : 1,
                ...Platform.select({
                  web: {
                    cursor: 'pointer',
                    transition: Tokens.motion.transitions.fast,
                  },
                }),
              })}
            >
              <Text
                style={{
                  color: isFocused
                    ? Tokens.colors.text.primary
                    : Tokens.colors.text.secondary,
                  fontFamily: Tokens.type.fontFamily.sans,
                  fontSize: Tokens.type.sm,
                  fontWeight: isFocused ? '700' : '500',
                  letterSpacing: 1, // Uppercase
                }}
              >
                {route.name.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

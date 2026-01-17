/**
 * ScaleButton.web.tsx
 * Web-specific implementation: NO Reanimated import.
 * Uses simple TouchableOpacity with opacity feedback instead of scale animation.
 * This file is automatically resolved by webpack when Platform.OS === 'web'
 * due to resolve.extensions order: ['.web.tsx', '.tsx']
 */
import React from "react";
import { TouchableOpacity, StyleProp, ViewStyle, View } from "react-native";

interface ScaleButtonProps {
    onPress: () => void;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    scaleAmount?: number; // Ignored on web, kept for API compatibility
    testID?: string;
}

const ScaleButton = ({
    onPress,
    children,
    style,
    testID,
}: ScaleButtonProps) => {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            testID={testID}
        >
            <View style={style}>{children}</View>
        </TouchableOpacity>
    );
};

export default ScaleButton;

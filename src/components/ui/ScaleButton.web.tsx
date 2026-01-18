import React from "react";
import { Pressable, StyleProp, ViewStyle, StyleSheet } from "react-native";

interface ScaleButtonProps {
    onPress: () => void;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    scaleAmount?: number;
    testID?: string;
}

const ScaleButton = ({
    onPress,
    children,
    style,
    testID,
}: ScaleButtonProps) => {
    return (
        <Pressable
            onPress={onPress}
            testID={testID}
            style={({ pressed }) => [
                style,
                pressed && styles.pressed,
            ]}
        >
            {children}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    pressed: {
        opacity: 0.7,
    },
});

export default ScaleButton;

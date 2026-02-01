import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OverlayService from '../services/OverlayService';
import { MetroTile } from '../components/metro/MetroTile';
import { MetroPalette, MetroSpacing, MetroTypography } from '../theme/metroTheme';

const HomeScreen = ({navigation}: any) => {
  const [streak, setStreak] = useState(0);
  const [isOverlayEnabled, setIsOverlayEnabled] = useState(false);

  const modes = useMemo(
    () => [
      {id: 'ignite', name: 'Ignite', icon: '🔥', desc: '5-min focus timer'},
      {id: 'fogcutter', name: 'Fog Cutter', icon: '💨', desc: 'Break tasks down'},
      {id: 'pomodoro', name: 'Pomodoro', icon: '🍅', desc: 'Classic timer'},
      {id: 'anchor', name: 'Anchor', icon: '⚓', desc: 'Breathing exercises'},
      {id: 'checkin', name: 'Check In', icon: '📊', desc: 'Mood & energy'},
      {id: 'crisis', name: 'Crisis Mode', icon: '🆘', desc: 'Safety resources'},
    ],
    [],
  );

  const fadeAnims = React.useRef(modes.map(() => new Animated.Value(0))).current;
  const slideAnims = React.useRef(modes.map(() => new Animated.Value(50))).current;

  useEffect(() => {
    loadStreak();
    checkOverlayPermission();
    
    // Trigger entrance animation
    const animations = modes.map((_, i) => {
      return Animated.parallel([
        Animated.timing(fadeAnims[i], {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(slideAnims[i], {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
      ]);
    });
    
    Animated.stagger(50, animations).start();
  }, []);

  const checkOverlayPermission = async () => {
    if (Platform.OS === 'android') {
      const hasPermission = await OverlayService.canDrawOverlays();
      setIsOverlayEnabled(hasPermission);
    }
  };

  const toggleOverlay = async (value: boolean) => {
    if (Platform.OS !== 'android') return;

    if (value) {
      const hasPermission = await OverlayService.canDrawOverlays();
      if (hasPermission) {
        OverlayService.startOverlay();
        setIsOverlayEnabled(true);
      } else {
        const granted = await OverlayService.requestOverlayPermission();
        if (granted) {
          OverlayService.startOverlay();
          setIsOverlayEnabled(true);
        } else {
          setIsOverlayEnabled(false);
        }
      }
    } else {
      OverlayService.stopOverlay();
      setIsOverlayEnabled(false);
    }
  };

  const loadStreak = async () => {
    try {
      const streakCount = await AsyncStorage.getItem('streakCount');
      setStreak(streakCount ? parseInt(streakCount, 10) : 0);
    } catch (e) {
      console.log('Error loading streak:', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Spark</Text>
          <View style={styles.streakContainer}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>
              {streak} day{streak !== 1 ? 's' : ''} streak
            </Text>
          </View>
        </View>

        {Platform.OS === 'android' && (
          <View style={styles.overlayContainer}>
            <View style={styles.overlayTextContainer}>
              <Text style={styles.overlayTitle}>Floating Bubble</Text>
              <Text style={styles.overlayDesc}>Show task count over other apps</Text>
            </View>
            <Switch
              trackColor={{false: MetroPalette.darkGray, true: MetroPalette.blue}}
              thumbColor={isOverlayEnabled ? MetroPalette.white : MetroPalette.gray}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleOverlay}
              value={isOverlayEnabled}
            />
          </View>
        )}

        <View style={styles.modesGrid}>
          {modes.map((mode, index) => {
            let accent = MetroPalette.blue;
            if (mode.id === 'ignite') accent = MetroPalette.cobalt;
            if (mode.id === 'fogcutter') accent = MetroPalette.teal;
            if (mode.id === 'pomodoro') accent = MetroPalette.red;
            if (mode.id === 'anchor') accent = MetroPalette.green;
            if (mode.id === 'checkin') accent = MetroPalette.orange;
            if (mode.id === 'crisis') accent = MetroPalette.magenta;

            return (
              <Animated.View
                key={mode.id}
                style={{
                  width: '47%', 
                  marginBottom: MetroSpacing.m,
                  opacity: fadeAnims[index],
                  transform: [{ translateY: slideAnims[index] }, { scale: 1 }]
                }}
              >
                <MetroTile
                  title={mode.name}
                  icon={<Text style={{fontSize: 32}}>{mode.icon}</Text>}
                  accentColor={accent}
                  style={{width: '100%'}}
                  onPress={() => {
                    if (mode.id === 'checkin') {
                    navigation.navigate('CheckIn');
                  } else if (mode.id === 'crisis') {
                    navigation.navigate('Crisis');
                  } else if (mode.id === 'fogcutter') {
                    navigation.navigate('FogCutter');
                  } else if (mode.id === 'pomodoro') {
                    navigation.navigate('Pomodoro');
                  } else if (mode.id === 'anchor') {
                    navigation.navigate('Anchor');
                  } else {
                    navigation.navigate('Focus');
                  }
                }}
              />
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MetroPalette.black,
  },
  content: {
    padding: MetroSpacing.l,
  },
  header: {
    marginBottom: MetroSpacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: MetroTypography.fontFamily,
    fontSize: MetroTypography.sizes.display,
    fontWeight: MetroTypography.weights.light,
    color: MetroPalette.white,
    letterSpacing: MetroTypography.letterSpacing.display,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: MetroTypography.sizes.h3,
    marginRight: MetroSpacing.s,
  },
  streakText: {
    fontFamily: MetroTypography.fontFamily,
    fontSize: MetroTypography.sizes.body,
    color: MetroPalette.gray,
  },
  overlayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MetroSpacing.xl,
    padding: MetroSpacing.m,
    borderWidth: 1,
    borderColor: MetroPalette.darkGray,
  },
  overlayTextContainer: {
    flex: 1,
    marginRight: MetroSpacing.m,
  },
  overlayTitle: {
    fontFamily: MetroTypography.fontFamily,
    fontSize: MetroTypography.sizes.h3,
    color: MetroPalette.white,
    marginBottom: MetroSpacing.unit,
  },
  overlayDesc: {
    fontFamily: MetroTypography.fontFamily,
    fontSize: MetroTypography.sizes.caption,
    color: MetroPalette.gray,
  },
  modesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default HomeScreen;

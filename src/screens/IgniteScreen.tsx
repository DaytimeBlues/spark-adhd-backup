import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import SoundService from '../services/SoundService';
import StorageService from '../services/StorageService';
import { MetroButton } from '../components/metro/MetroButton';
import { MetroPalette, MetroSpacing, MetroTypography } from '../theme/metroTheme';

const IgniteScreen = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    SoundService.initBrownNoise();

    const loadState = async () => {
      const storedState = await StorageService.getJSON<{
        timeLeft: number;
        isPlaying: boolean;
      }>(StorageService.STORAGE_KEYS.igniteState);
      if (!storedState) {
        return;
      }

      if (typeof storedState.timeLeft === 'number') {
        setTimeLeft(storedState.timeLeft);
      }

      if (storedState.isPlaying) {
        setIsPlaying(true);
        SoundService.playBrownNoise();
      }
    };

    loadState();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      SoundService.stopBrownNoise();
      SoundService.releaseBrownNoise();
    };
  }, []);

  useEffect(() => {
    StorageService.setJSON(StorageService.STORAGE_KEYS.igniteState, {
      timeLeft,
      isPlaying,
    });
  }, [timeLeft, isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          SoundService.playCompletionSound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(300);
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    SoundService.pauseBrownNoise();
  };

  const toggleSound = () => {
    setIsPlaying(prev => {
      if (prev) {
        SoundService.pauseBrownNoise();
      } else {
        SoundService.playBrownNoise();
      }

      return !prev;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Ignite</Text>
        <Text style={styles.subtitle}>5-Minute Focus Timer</Text>

        <View style={styles.timerContainer}>
          <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
          <Text style={styles.status}>
            {isRunning ? 'Focusing...' : 'Ready to start'}
          </Text>
        </View>

        <View style={styles.controls}>
          {!isRunning ? (
            <MetroButton
              title="Start"
              onPress={startTimer}
              accentColor={MetroPalette.blue}
              style={styles.controlBtn}
            />
          ) : (
            <MetroButton
              title="Pause"
              onPress={pauseTimer}
              accentColor={MetroPalette.red}
              style={styles.controlBtn}
            />
          )}

          <MetroButton
            title="Reset"
            onPress={resetTimer}
            variant="outline"
            style={styles.controlBtn}
          />
        </View>

        <MetroButton
          title={isPlaying ? '🔊 Brown Noise On' : '🔇 Brown Noise Off'}
          onPress={toggleSound}
          variant={isPlaying ? 'filled' : 'outline'}
          accentColor={MetroPalette.purple}
          style={styles.soundButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MetroPalette.black,
  },
  content: {
    flex: 1,
    padding: MetroSpacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: MetroTypography.fontFamily,
    fontSize: MetroTypography.sizes.display,
    fontWeight: MetroTypography.weights.light,
    color: MetroPalette.white,
    marginBottom: MetroSpacing.unit,
    letterSpacing: MetroTypography.letterSpacing.display,
  },
  subtitle: {
    fontFamily: MetroTypography.fontFamily,
    fontSize: MetroTypography.sizes.h3,
    color: MetroPalette.gray,
    marginBottom: MetroSpacing.xxl,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: MetroSpacing.xxl,
  },
  timer: {
    fontFamily: MetroTypography.fontFamily,
    fontSize: 96,
    fontWeight: MetroTypography.weights.light,
    color: MetroPalette.white,
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
  },
  status: {
    fontFamily: MetroTypography.fontFamily,
    fontSize: MetroTypography.sizes.h3,
    color: MetroPalette.blue,
    marginTop: MetroSpacing.m,
  },
  controls: {
    flexDirection: 'row',
    marginBottom: MetroSpacing.xl,
    justifyContent: 'center',
  },
  controlBtn: {
    marginHorizontal: MetroSpacing.s,
    minWidth: 120,
  },
  soundButton: {
    minWidth: 200,
  },
});

export default IgniteScreen;

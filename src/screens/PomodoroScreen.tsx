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

const PomodoroScreen = () => {
  const [isWorking, setIsWorking] = useState(true);
  const [timeLeft, setTimeLeft] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadState = async () => {
      const storedState = await StorageService.getJSON<{
        isWorking: boolean;
        timeLeft: number;
        sessions: number;
      }>(StorageService.STORAGE_KEYS.pomodoroState);

      if (!storedState) {
        return;
      }

      if (typeof storedState.isWorking === 'boolean') {
        setIsWorking(storedState.isWorking);
      }

      if (typeof storedState.timeLeft === 'number') {
        setTimeLeft(storedState.timeLeft);
      }

      if (typeof storedState.sessions === 'number') {
        setSessions(storedState.sessions);
      }
    };

    loadState();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    StorageService.setJSON(StorageService.STORAGE_KEYS.pomodoroState, {
      isWorking,
      timeLeft,
      sessions,
    });
  }, [isWorking, timeLeft, sessions]);

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
          if (isWorking) {
            setSessions(s => s + 1);
            setIsWorking(false);
            SoundService.playCompletionSound();
            return 300;
          } else {
            setIsWorking(true);
            SoundService.playNotificationSound();
            return 1500;
          }
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
    setIsWorking(true);
    setTimeLeft(1500);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Pomodoro</Text>
        <Text style={styles.subtitle}>
          {isWorking ? 'Focus Time' : 'Take a Break'}
        </Text>

        <View style={styles.sessionsContainer}>
          <Text style={styles.sessionsText}>
            Sessions completed: {sessions}
          </Text>
        </View>

        <View style={styles.timerContainer}>
          <View
            style={[
              styles.phaseIndicator,
              {backgroundColor: isWorking ? '#FF6B6B' : '#4CAF50'},
            ]}
          />
          <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
          <Text style={styles.phaseText}>
            {isWorking ? 'Focus' : 'Break'}
          </Text>
        </View>

        <View style={styles.controls}>
          {!isRunning ? (
            <TouchableOpacity style={styles.startButton} onPress={startTimer}>
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.pauseButton} onPress={pauseTimer}>
              <Text style={styles.pauseButtonText}>Pause</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  content: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 16,
  },
  sessionsContainer: {
    marginBottom: 32,
  },
  sessionsText: {
    color: '#6200EA',
    fontSize: 16,
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  phaseIndicator: {
    width: 200,
    height: 200,
    borderRadius: 100,
    position: 'absolute',
    opacity: 0.2,
  },
  timer: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  phaseText: {
    fontSize: 18,
    color: '#888',
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
  },
  startButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    marginRight: 16,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  pauseButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    marginRight: 16,
  },
  pauseButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#2D2D44',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PomodoroScreen;

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import StorageService from '../services/StorageService';
import {generateId} from '../utils/helpers';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  microSteps: string[];
}

const FogCutterScreen = () => {
  const [task, setTask] = useState('');
  const [microSteps, setMicroSteps] = useState<string[]>([]);
  const [newStep, setNewStep] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const loadTasks = async () => {
      const storedTasks = await StorageService.getJSON<Task[]>(
        StorageService.STORAGE_KEYS.tasks,
      );
      if (!storedTasks || !Array.isArray(storedTasks)) {
        return;
      }

      const normalized = storedTasks.filter(item => {
        return Boolean(item?.id && item?.text && Array.isArray(item?.microSteps));
      });
      setTasks(normalized);
    };

    loadTasks();
  }, []);

  useEffect(() => {
    StorageService.setJSON(StorageService.STORAGE_KEYS.tasks, tasks);
  }, [tasks]);

  const addMicroStep = () => {
    if (newStep.trim()) {
      setMicroSteps([...microSteps, newStep.trim()]);
      setNewStep('');
    }
  };

  const addTask = () => {
    if (task.trim() && microSteps.length > 0) {
      const newTask: Task = {
        id: generateId(),
        text: task,
        completed: false,
        microSteps: [...microSteps],
      };
      setTasks(prevTasks => [...prevTasks, newTask]);
      setTask('');
      setMicroSteps([]);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(t => (t.id === id ? {...t, completed: !t.completed} : t)),
    );
  };

  const renderMicroStep = ({item, index}: {item: string; index: number}) => (
    <View style={styles.microStep}>
      <Text style={styles.stepNumber}>{index + 1}</Text>
      <Text style={styles.stepText}>{item}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Fog Cutter</Text>
        <Text style={styles.subtitle}>Break big tasks into tiny steps</Text>

        <TextInput
          style={styles.input}
          placeholder="What feels overwhelming?"
          placeholderTextColor="#666"
          value={task}
          onChangeText={setTask}
        />

        <View style={styles.addStepRow}>
          <TextInput
            style={styles.stepInput}
            placeholder="Add a micro-step..."
            placeholderTextColor="#666"
            value={newStep}
            onChangeText={setNewStep}
            onSubmitEditing={addMicroStep}
          />
          <TouchableOpacity style={styles.addButton} onPress={addMicroStep}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {microSteps.length > 0 && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>
              Micro-steps for "{task}":
            </Text>
            <FlatList
              data={microSteps}
              renderItem={renderMicroStep}
              keyExtractor={(_, index) => index.toString()}
              scrollEnabled={false}
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveButton, microSteps.length === 0 && styles.disabled]}
          onPress={addTask}
          disabled={microSteps.length === 0}>
          <Text style={styles.saveButtonText}>Save Task</Text>
        </TouchableOpacity>

        <FlatList
          data={tasks}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                styles.taskCard,
                item.completed && styles.taskCardCompleted,
              ]}
              onPress={() => toggleTask(item.id)}>
              <Text style={[styles.taskText, item.completed && styles.completed]}>
                {item.text}
              </Text>
              <View style={styles.stepCount}>
                <Text style={styles.stepCountText}>
                  {item.microSteps.length} steps
                </Text>
              </View>
            </TouchableOpacity>
          )}
          style={styles.taskList}
        />
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
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#2D2D44',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
  },
  addStepRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepInput: {
    flex: 1,
    backgroundColor: '#2D2D44',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: 12,
  },
  addButton: {
    backgroundColor: '#6200EA',
    width: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  previewContainer: {
    backgroundColor: '#2D2D44',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  previewTitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 12,
  },
  microStep: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  stepNumber: {
    backgroundColor: '#6200EA',
    color: '#FFFFFF',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 12,
  },
  stepText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#6200EA',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  taskList: {
    flex: 1,
  },
  taskCard: {
    backgroundColor: '#2D2D44',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  taskCardCompleted: {
    opacity: 0.5,
  },
  taskText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  completed: {
    textDecorationLine: 'line-through',
  },
  stepCount: {
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  stepCountText: {
    color: '#888',
    fontSize: 12,
  },
});

export default FogCutterScreen;

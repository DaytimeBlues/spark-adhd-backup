import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  SafeAreaView,
  FlatList,
  Platform,
  ActivityIndicator,
} from 'react-native';
import StorageService from '../services/StorageService';
import { generateId } from '../utils/helpers';
import { LinearButton } from '../components/ui/LinearButton';
import { Tokens } from '../theme/tokens';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  microSteps: string[];
}

const FOCUS_RING_SHADOW = '0 0 0 2px #FFFFFF';

const FogCutterScreen = () => {
  const [task, setTask] = useState('');
  const [microSteps, setMicroSteps] = useState<string[]>([]);
  const [newStep, setNewStep] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await StorageService.getJSON<Task[]>(
          StorageService.STORAGE_KEYS.tasks,
        );
        if (storedTasks && Array.isArray(storedTasks)) {
          const normalized = storedTasks.filter((item) => {
            return Boolean(
              item?.id && item?.text && Array.isArray(item?.microSteps),
            );
          });
          setTasks(normalized);
        }
      } catch (error) {
        console.error('Failed to load tasks', error);
      } finally {
        setIsLoading(false);
      }
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
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setTask('');
      setMicroSteps([]);
    }
  };

  const toggleTask = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t,
      ),
    );
  };

  const renderMicroStep = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => (
    <View style={styles.microStep}>
      <Text style={styles.stepNumber}>{index + 1}</Text>
      <Text style={styles.stepText}>{item}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>FOG CUTTER</Text>
            <Text style={styles.subtitle}>
              BREAK BIG TASKS INTO TINY STEPS.
            </Text>
          </View>

          <View style={styles.creationCard}>
            <View style={styles.creationHeader}>
              <Text style={styles.cardTitle}>DECOMPOSE A TASK</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'main' && styles.inputFocused,
              ]}
              placeholder="WHAT FEELS OVERWHELMING?"
              placeholderTextColor="#666666"
              value={task}
              onChangeText={setTask}
              onFocus={() => setFocusedInput('main')}
              onBlur={() => setFocusedInput(null)}
            />

            <View style={styles.addStepRow}>
              <TextInput
                style={[
                  styles.stepInput,
                  focusedInput === 'step' && styles.inputFocused,
                ]}
                placeholder="ADD A MICRO-STEP..."
                placeholderTextColor="#666666"
                value={newStep}
                onChangeText={setNewStep}
                onSubmitEditing={addMicroStep}
                onFocus={() => setFocusedInput('step')}
                onBlur={() => setFocusedInput(null)}
              />
              <LinearButton
                title="+"
                onPress={addMicroStep}
                variant="secondary"
                style={styles.addButton}
              />
            </View>

            {microSteps.length > 0 && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewTitle}>
                  NEXT STEPS FOR "{task}":
                </Text>
                <FlatList
                  data={microSteps}
                  renderItem={renderMicroStep}
                  keyExtractor={(_, index) => index.toString()}
                  scrollEnabled={false}
                />
              </View>
            )}

            <LinearButton
              title="SAVE TASK"
              onPress={addTask}
              disabled={microSteps.length === 0}
              size="lg"
              style={styles.saveButton}
            />
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>ACTIVE TASKS</Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.loadingText}>LOADING TASKS...</Text>
            </View>
          ) : (
            <FlatList
              data={tasks}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <Pressable
                  style={({
                    pressed,
                    hovered,
                  }: {
                    pressed: boolean;
                    hovered?: boolean;
                  }) => [
                    styles.taskCard,
                    item.completed && styles.taskCardCompleted,
                    hovered && !item.completed && styles.taskCardHovered,
                    pressed && !item.completed && styles.taskCardPressed,
                  ]}
                  onPress={() => toggleTask(item.id)}
                >
                  <View style={styles.taskHeader}>
                    <Text
                      style={[
                        styles.taskText,
                        item.completed && styles.completed,
                      ]}
                    >
                      {item.text}
                    </Text>
                    {item.completed && (
                      <Text style={styles.doneBadge}>DONE</Text>
                    )}
                  </View>

                  <View style={styles.stepCount}>
                    <Text style={styles.stepCountText}>
                      {item.microSteps.length} MICRO-STEPS
                    </Text>
                  </View>
                </Pressable>
              )}
              style={styles.taskList}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: Tokens.layout.maxWidth.prose,
    padding: Tokens.spacing[6],
  },
  header: {
    marginBottom: Tokens.spacing[8],
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#333333',
    paddingBottom: Tokens.spacing[4],
  },
  title: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type['5xl'],
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: Tokens.spacing[2],
    letterSpacing: -2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.sm,
    color: '#666666',
    textAlign: 'center',
    maxWidth: 400,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  creationCard: {
    marginBottom: Tokens.spacing[8],
    backgroundColor: '#000000',
    padding: Tokens.spacing[6],
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#333333',
  },
  creationHeader: {
    marginBottom: Tokens.spacing[5],
  },
  cardTitle: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.sm,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#050505',
    borderRadius: 0,
    paddingHorizontal: Tokens.spacing[4],
    color: '#FFFFFF',
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.base,
    marginBottom: Tokens.spacing[4],
    height: 52,
    borderWidth: 1,
    borderColor: '#333333',
    ...Platform.select({
      web: { outlineStyle: 'none', transition: 'border-color 0.2s ease' },
    }),
  },
  inputFocused: {
    borderColor: '#FFFFFF',
    backgroundColor: '#000000',
    ...Platform.select({
      web: { boxShadow: FOCUS_RING_SHADOW },
    }),
  },
  addStepRow: {
    flexDirection: 'row',
    marginBottom: Tokens.spacing[4],
    gap: Tokens.spacing[3],
  },
  stepInput: {
    flex: 1,
    backgroundColor: '#050505',
    borderRadius: 0,
    paddingHorizontal: Tokens.spacing[4],
    color: '#FFFFFF',
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.base,
    height: Tokens.spacing[12],
    borderWidth: 1,
    borderColor: '#333333',
    ...Platform.select({
      web: { outlineStyle: 'none', transition: 'border-color 0.2s ease' },
    }),
  },
  addButton: {
    width: Tokens.spacing[12],
    height: Tokens.spacing[12],
    paddingHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
  },
  previewContainer: {
    backgroundColor: '#050505',
    borderRadius: 0,
    padding: Tokens.spacing[5],
    marginBottom: Tokens.spacing[4],
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#333333',
  },
  previewTitle: {
    fontFamily: Tokens.type.fontFamily.mono,
    color: '#666666',
    fontSize: Tokens.type.xs,
    fontWeight: '700',
    marginBottom: Tokens.spacing[4],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  microStep: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Tokens.spacing[2],
  },
  stepNumber: {
    backgroundColor: '#111111',
    color: '#FFFFFF',
    width: Tokens.spacing[6],
    height: Tokens.spacing[6],
    borderRadius: 0, // Square
    textAlign: 'center',
    lineHeight: Tokens.spacing[6],
    fontSize: Tokens.type.xs,
    fontWeight: 'bold',
    marginRight: Tokens.spacing[3],
    fontFamily: Tokens.type.fontFamily.mono,
  },
  stepText: {
    fontFamily: Tokens.type.fontFamily.sans,
    color: '#CCCCCC',
    fontSize: Tokens.type.base,
  },
  saveButton: {
    marginTop: Tokens.spacing[2],
    // If I could style the button color directly here I would,
    // assuming LinearButton accepts style overrides effectively or I rely on its prop.
    // I'll assume standard styling for now but if it had a 'variant' for primary-red it would be good.
    // I'll treat it as the Red Accent implicitly by location.
  },
  divider: {
    height: 1,
    backgroundColor: '#333333',
    width: '100%',
    marginBottom: Tokens.spacing[8],
  },
  sectionHeader: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.sm,
    fontWeight: '700',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: Tokens.spacing[4],
  },
  taskList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Tokens.spacing[20],
  },
  taskCard: {
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: Tokens.spacing[5],
    marginBottom: -1, // Collapse borders
    borderWidth: 1,
    borderColor: '#333333',
    ...Platform.select({
      web: {
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      },
    }),
  },
  taskCardHovered: {
    borderColor: '#FFFFFF',
    zIndex: 1,
    transform: [{ translateY: -2 }],
  },
  taskCardPressed: {
    borderColor: '#666666',
  },
  taskCardCompleted: {
    opacity: 0.3,
    backgroundColor: '#000000',
    borderColor: '#111111',
    transform: [{ scale: 1 }],
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Tokens.spacing[2],
  },
  taskText: {
    fontFamily: Tokens.type.fontFamily.sans,
    color: '#FFFFFF',
    fontSize: Tokens.type.lg,
    fontWeight: '600',
    flex: 1,
  },
  completed: {
    textDecorationLine: 'line-through',
    color: '#666666',
  },
  doneBadge: {
    backgroundColor: '#111111',
    color: '#666666',
    fontSize: Tokens.type.xs,
    fontWeight: '700',
    paddingHorizontal: Tokens.spacing[2],
    paddingVertical: 2,
    borderRadius: 0,
    overflow: 'hidden',
    marginLeft: Tokens.spacing[2],
    fontFamily: Tokens.type.fontFamily.mono,
  },
  stepCount: {
    alignSelf: 'flex-start',
  },
  stepCountText: {
    fontFamily: Tokens.type.fontFamily.mono,
    color: '#666666',
    fontSize: Tokens.type.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  loadingContainer: {
    padding: Tokens.spacing[8],
    alignItems: 'center',
    gap: Tokens.spacing[4],
  },
  loadingText: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.sm,
    color: '#666666',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default FogCutterScreen;

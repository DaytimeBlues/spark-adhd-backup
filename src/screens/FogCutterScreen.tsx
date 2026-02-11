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

const HOVER_SHADOW = '0 4px 12px rgba(0,0,0,0.2)';
const FOCUS_RING_SHADOW = `0 0 0 2px ${Tokens.colors.brand[900]}`;

const FogCutterScreen = () => {
  const [task, setTask] = useState('');
  const [microSteps, setMicroSteps] = useState<string[]>([]);
  const [newStep, setNewStep] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      const storedTasks = await StorageService.getJSON<Task[]>(
        StorageService.STORAGE_KEYS.tasks,
      );
      if (!storedTasks || !Array.isArray(storedTasks)) {
        return;
      }

      const normalized = storedTasks.filter((item) => {
        return Boolean(
          item?.id && item?.text && Array.isArray(item?.microSteps),
        );
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
            <Text style={styles.title}>Fog Cutter</Text>
            <Text style={styles.subtitle}>
              Break big tasks into tiny steps.
            </Text>
          </View>

          <View style={styles.creationCard}>
            <View style={styles.creationHeader}>
              <Text style={styles.cardTitle}>Decompose a Task</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'main' && styles.inputFocused,
              ]}
              placeholder="What feels overwhelming?"
              placeholderTextColor={Tokens.colors.text.tertiary}
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
                placeholder="Add a micro-step..."
                placeholderTextColor={Tokens.colors.text.tertiary}
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
                  Next steps for "{task}":
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
              title="Save Task"
              onPress={addTask}
              disabled={microSteps.length === 0}
              size="lg"
              style={styles.saveButton}
            />
          </View>

          <Text style={styles.sectionHeader}>Active Tasks</Text>

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
                  {item.completed && <Text style={styles.doneBadge}>Done</Text>}
                </View>

                <View style={styles.stepCount}>
                  <Text style={styles.stepCountText}>
                    {item.microSteps.length} micro-steps
                  </Text>
                </View>
              </Pressable>
            )}
            style={styles.taskList}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral.darkest,
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
  },
  title: {
    fontFamily: 'Inter',
    fontSize: Tokens.type['4xl'],
    fontWeight: '800',
    color: Tokens.colors.text.primary,
    marginBottom: Tokens.spacing[2],
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.base,
    color: Tokens.colors.text.secondary,
    textAlign: 'center',
    maxWidth: 400,
  },
  creationCard: {
    marginBottom: Tokens.spacing[8],
    backgroundColor: Tokens.colors.neutral.darker,
    padding: Tokens.spacing[6],
    borderRadius: Tokens.radii.xl,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      },
    }),
  },
  creationHeader: {
    marginBottom: Tokens.spacing[5],
  },
  cardTitle: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.sm,
    fontWeight: '600',
    color: Tokens.colors.text.secondary,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Tokens.colors.neutral.darkest,
    borderRadius: Tokens.radii.lg,
    paddingHorizontal: Tokens.spacing[4],
    color: Tokens.colors.text.primary,
    fontFamily: 'Inter',
    fontSize: Tokens.type.base,
    marginBottom: Tokens.spacing[4],
    height: 52,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    ...Platform.select({
      web: { outlineStyle: 'none', transition: Tokens.motion.transitions.base },
    }),
  },
  inputFocused: {
    borderColor: Tokens.colors.brand[500],
    backgroundColor: Tokens.colors.neutral.dark,
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
    backgroundColor: Tokens.colors.neutral.darkest,
    borderRadius: Tokens.radii.lg,
    paddingHorizontal: Tokens.spacing[4],
    color: Tokens.colors.text.primary,
    fontFamily: 'Inter',
    fontSize: Tokens.type.base,
    height: Tokens.spacing[12],
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    ...Platform.select({
      web: { outlineStyle: 'none', transition: Tokens.motion.transitions.base },
    }),
  },
  addButton: {
    width: Tokens.spacing[12],
    height: Tokens.spacing[12],
    paddingHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    backgroundColor: Tokens.colors.neutral.dark,
    borderRadius: Tokens.radii.lg,
    padding: Tokens.spacing[5],
    marginBottom: Tokens.spacing[4],
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
  },
  previewTitle: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.secondary,
    fontSize: Tokens.type.sm,
    fontWeight: '600',
    marginBottom: Tokens.spacing[4],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  microStep: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Tokens.spacing[2],
  },
  stepNumber: {
    backgroundColor: Tokens.colors.indigo.subtle,
    color: Tokens.colors.indigo.primary,
    width: Tokens.spacing[6],
    height: Tokens.spacing[6],
    borderRadius: Tokens.radii.full,
    textAlign: 'center',
    lineHeight: Tokens.spacing[6],
    fontSize: Tokens.type.xs,
    fontWeight: 'bold',
    marginRight: Tokens.spacing[3],
  },
  stepText: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.primary,
    fontSize: Tokens.type.base,
  },
  saveButton: {
    marginTop: Tokens.spacing[2],
  },
  sectionHeader: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.sm,
    fontWeight: '700',
    color: Tokens.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Tokens.spacing[4],
  },
  taskList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Tokens.spacing[20],
  },
  taskCard: {
    backgroundColor: Tokens.colors.neutral.darker,
    borderRadius: Tokens.radii.lg,
    padding: Tokens.spacing[5],
    marginBottom: Tokens.spacing[4],
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    ...Platform.select({
      web: {
        transition: Tokens.motion.transitions.base,
        cursor: 'pointer',
      },
    }),
  },
  taskCardHovered: {
    borderColor: Tokens.colors.brand[500],
    transform: [{ translateY: -2 }],
    ...Platform.select({
      web: {
        boxShadow: HOVER_SHADOW,
      },
    }),
  },
  taskCardPressed: {
    transform: [{ scale: Tokens.motion.scales.press }],
    borderColor: Tokens.colors.brand[600],
  },
  taskCardCompleted: {
    opacity: 0.5,
    backgroundColor: Tokens.colors.neutral.darkest,
    borderColor: 'transparent',
    transform: [{ scale: 1 }],
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Tokens.spacing[2],
  },
  taskText: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.primary,
    fontSize: Tokens.type.lg,
    fontWeight: '600',
    flex: 1,
  },
  completed: {
    textDecorationLine: 'line-through',
    color: Tokens.colors.text.tertiary,
  },
  doneBadge: {
    backgroundColor: Tokens.colors.success.subtle,
    color: Tokens.colors.success.main,
    fontSize: Tokens.type.xs,
    fontWeight: '700',
    paddingHorizontal: Tokens.spacing[2],
    paddingVertical: 2,
    borderRadius: Tokens.radii.sm,
    overflow: 'hidden',
    marginLeft: Tokens.spacing[2],
  },
  stepCount: {
    alignSelf: 'flex-start',
  },
  stepCountText: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.tertiary,
    fontSize: Tokens.type.sm,
  },
});

export default FogCutterScreen;

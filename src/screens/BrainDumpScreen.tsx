import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  SafeAreaView,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
  Alert,
  AccessibilityInfo,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import StorageService from '../services/StorageService';
import RecordingService from '../services/RecordingService';
import PlaudService from '../services/PlaudService';
import OverlayService from '../services/OverlayService';
import AISortService, { SortedItem } from '../services/AISortService';
import { generateId } from '../utils/helpers';
import { LinearButton } from '../components/ui/LinearButton';
import { Tokens } from '../theme/tokens';

const INPUT_HEIGHT = 56;
const HIT_SLOP = {
  top: Tokens.spacing[4],
  bottom: Tokens.spacing[4],
  left: Tokens.spacing[4],
  right: Tokens.spacing[4],
};

const PERSIST_DEBOUNCE_MS = 300;
const OVERLAY_COUNT_DEBOUNCE_MS = 250;

const CATEGORY_ORDER: Array<SortedItem['category']> = [
  'task',
  'event',
  'reminder',
  'worry',
  'thought',
  'idea',
];

interface DumpItem {
  id: string;
  text: string;
  createdAt: string;
  source: 'text' | 'audio'; // Track origin
  audioPath?: string; // Optional local file path
}

type RecordingState = 'idle' | 'recording' | 'processing';

type BrainDumpRouteParams = {
  autoRecord?: boolean;
};

type BrainDumpRoute = RouteProp<Record<'Tasks', BrainDumpRouteParams>, 'Tasks'>;

const BrainDumpScreen = () => {
  const route = useRoute<BrainDumpRoute>();
  const [input, setInput] = useState('');
  const [items, setItems] = useState<DumpItem[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [isSorting, setIsSorting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sortingError, setSortingError] = useState<string | null>(null);
  const [sortedItems, setSortedItems] = useState<SortedItem[]>([]);
  const hasAutoRecorded = useRef(false);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayCountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const lastOverlayCountRef = useRef<number>(0);

  const loadItems = async () => {
    try {
      const storedItems = await StorageService.getJSON<DumpItem[]>(
        StorageService.STORAGE_KEYS.brainDump,
      );
      if (storedItems && Array.isArray(storedItems)) {
        const normalized = storedItems.filter((item) => {
          return Boolean(item?.id && item?.text && item?.createdAt);
        });
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setItems(normalized);
      }
    } catch (error) {
      console.error('Failed to load items', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
    loadItems();
  }, []);

  useEffect(() => {
    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current);
    }
    persistTimerRef.current = setTimeout(() => {
      StorageService.setJSON(
        StorageService.STORAGE_KEYS.brainDump,
        items,
      ).catch((error) => {
        console.error('Failed to persist brain dump items:', error);
      });
    }, PERSIST_DEBOUNCE_MS);

    if (items.length !== lastOverlayCountRef.current) {
      if (overlayCountTimerRef.current) {
        clearTimeout(overlayCountTimerRef.current);
      }
      overlayCountTimerRef.current = setTimeout(() => {
        OverlayService.updateCount(items.length);
        lastOverlayCountRef.current = items.length;
      }, OVERLAY_COUNT_DEBOUNCE_MS);
    }

    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
      }
      if (overlayCountTimerRef.current) {
        clearTimeout(overlayCountTimerRef.current);
      }
    };
  }, [items]);

  useEffect(() => {
    if (!route.params?.autoRecord || hasAutoRecorded.current) {
      return;
    }

    hasAutoRecorded.current = true;
    handleRecordPress();
  }, [handleRecordPress, route.params?.autoRecord]);

  const addItem = () => {
    if (input.trim()) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const newItem: DumpItem = {
        id: generateId(),
        text: input.trim(),
        createdAt: new Date().toISOString(),
        source: 'text',
      };
      setItems((prevItems) => [newItem, ...prevItems]);
      setInput('');
      setSortedItems([]);
      setSortingError(null);
    }
  };

  // Handle recording toggle
  const handleRecordPress = useCallback(async () => {
    setRecordingError(null);

    if (recordingState === 'idle') {
      // Start recording
      const started = await RecordingService.startRecording();
      if (started) {
        setRecordingState('recording');
      } else {
        setRecordingError(
          'Could not start recording. Check microphone permissions.',
        );
      }
    } else if (recordingState === 'recording') {
      // Stop recording and process
      setRecordingState('processing');
      const result = await RecordingService.stopRecording();

      if (!result) {
        setRecordingError('Recording failed.');
        setRecordingState('idle');
        return;
      }

      // Send to Plaud for transcription
      const transcription = await PlaudService.transcribe(result.uri);

      if (transcription.success && transcription.transcription) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const newItem: DumpItem = {
          id: generateId(),
          text: transcription.transcription,
          createdAt: new Date().toISOString(),
          source: 'audio',
          audioPath: result.uri,
        };
        setItems((prevItems) => [newItem, ...prevItems]);
      } else {
        setRecordingError(transcription.error || 'Transcription failed.');
      }

      setRecordingState('idle');
    }
  }, [recordingState]);

  const deleteItem = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    setSortedItems([]);
    setSortingError(null);
  };

  const clearAll = () => {
    const clearItems = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setItems([]);
      setSortedItems([]);
      setSortingError(null);
      AccessibilityInfo.announceForAccessibility('All items cleared.');
    };

    Alert.alert(
      'Clear all items?',
      'This will remove all brain dump entries.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearItems },
      ],
      { cancelable: true },
    );
  };

  const handleAISort = async () => {
    setSortingError(null);
    setIsSorting(true);

    try {
      const sorted = await AISortService.sortItems(
        items.map((item) => item.text),
      );
      setSortedItems(sorted);
      AccessibilityInfo.announceForAccessibility('AI suggestions updated.');
    } catch (error) {
      setSortingError(
        error instanceof Error
          ? error.message
          : 'AI sort is currently unavailable.',
      );
      setSortedItems([]);
    } finally {
      setIsSorting(false);
    }
  };

  const groupedSortedItems = useMemo(() => {
    const grouped = new Map<string, SortedItem[]>();
    sortedItems.forEach((item) => {
      const existing = grouped.get(item.category) ?? [];
      existing.push(item);
      grouped.set(item.category, existing);
    });

    return CATEGORY_ORDER.map((category) => ({
      category,
      items: grouped.get(category) ?? [],
    })).filter((entry) => entry.items.length > 0);
  }, [sortedItems]);

  const getPriorityStyle = (priority: SortedItem['priority']) => {
    if (priority === 'high') {
      return styles.priorityHigh;
    }
    if (priority === 'medium') {
      return styles.priorityMedium;
    }
    return styles.priorityLow;
  };

  const renderItem = ({ item }: { item: DumpItem }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.text}</Text>
      <Pressable
        onPress={() => deleteItem(item.id)}
        accessibilityRole="button"
        accessibilityLabel="Delete brain dump item"
        accessibilityHint="Removes this item from the list"
        style={({
          pressed,
          hovered,
        }: {
          pressed: boolean;
          hovered?: boolean;
        }) => [
          styles.deleteButton,
          hovered && styles.deleteButtonHovered,
          pressed && styles.deleteButtonPressed,
        ]}
        hitSlop={HIT_SLOP}
      >
        <Text style={styles.deleteText}>×</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContainer}>
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <Text style={styles.title}>BRAIN DUMP</Text>
            <Text style={styles.subtitle}>
              UNLOAD YOUR THOUGHTS. WE'LL KEEP THEM SAFE.
            </Text>
          </View>

          <View style={styles.inputSection}>
            <View
              style={[
                styles.inputWrapper,
                isFocused && styles.inputWrapperFocused,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="WHAT'S ON YOUR MIND?"
                placeholderTextColor="#666666"
                accessibilityLabel="Add a brain dump item"
                accessibilityHint="Type a thought and press Add"
                value={input}
                onChangeText={setInput}
                onSubmitEditing={addItem}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                multiline={false}
                returnKeyType="done"
                blurOnSubmit
              />
            </View>
            <LinearButton
              title="ADD"
              onPress={addItem}
              size="lg"
              style={styles.addButton}
            />
          </View>

          {/* Recording Button */}
          <View style={styles.recordSection}>
            <Pressable
              onPress={handleRecordPress}
              disabled={recordingState === 'processing'}
              accessibilityRole="button"
              accessibilityLabel={
                recordingState === 'recording'
                  ? 'Stop recording'
                  : 'Start recording'
              }
              accessibilityHint="Records voice and converts it to a task item"
              style={({
                pressed,
                hovered,
              }: {
                pressed: boolean;
                hovered?: boolean;
              }) => [
                styles.recordButton,
                hovered && styles.recordButtonHovered,
                recordingState === 'recording' && styles.recordButtonActive,
                recordingState === 'processing' &&
                  styles.recordButtonProcessing,
                pressed && styles.recordButtonPressed,
              ]}
            >
              {recordingState === 'processing' ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.recordIcon}>
                  {recordingState === 'recording' ? '⏹️' : '🎙️'}
                </Text>
              )}
              <Text style={styles.recordText}>
                {recordingState === 'idle' && 'RECORD'}
                {recordingState === 'recording' && 'STOP'}
                {recordingState === 'processing' && 'PROCESSING...'}
              </Text>
            </Pressable>
            {recordingState === 'idle' && (
              <Text style={styles.recordHint}>AUTO-TRANSCRIBED SECURELY</Text>
            )}
            {recordingError && (
              <Text style={styles.errorText}>{recordingError}</Text>
            )}
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="small"
                color={Tokens.colors.brand[500]}
              />
              <Text style={styles.loadingText}>LOADING THOUGHTS...</Text>
            </View>
          ) : items.length > 0 ? (
            <View style={styles.actionsBar}>
              <Text style={styles.countText}>{items.length} ITEMS</Text>
              <View style={styles.actionsRight}>
                <Pressable
                  onPress={handleAISort}
                  disabled={isSorting}
                  accessibilityRole="button"
                  accessibilityLabel="AI sort"
                  accessibilityHint="Sorts and groups items using AI suggestions"
                  style={({
                    pressed,
                    hovered,
                  }: {
                    pressed: boolean;
                    hovered?: boolean;
                  }) => [
                    styles.actionButton,
                    hovered && styles.clearHovered,
                    pressed && styles.clearPressed,
                    isSorting && styles.actionButtonDisabled,
                  ]}
                >
                  <Text style={styles.aiSortText}>
                    {isSorting ? 'SORTING...' : 'AI SORT'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={clearAll}
                  accessibilityRole="button"
                  accessibilityLabel="Clear all items"
                  accessibilityHint="Opens a confirmation to remove all items"
                  style={({
                    pressed,
                    hovered,
                  }: {
                    pressed: boolean;
                    hovered?: boolean;
                  }) => [
                    styles.actionButton,
                    hovered && styles.clearHovered,
                    pressed && styles.clearPressed,
                  ]}
                >
                  <Text style={styles.clearText}>CLEAR ALL</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {sortingError && <Text style={styles.errorText}>{sortingError}</Text>}

          {!isLoading && groupedSortedItems.length > 0 && (
            <View style={styles.sortedSection}>
              <Text style={styles.sortedTitle}>AI SUGGESTIONS</Text>
              {groupedSortedItems.map(({ category, items: categoryItems }) => (
                <View key={category} style={styles.sortedGroup}>
                  <Text style={styles.sortedCategory}>
                    {category.toUpperCase()}
                  </Text>
                  {categoryItems.map((item, index) => (
                    <View
                      key={`${category}-${index}-${item.text}`}
                      style={styles.sortedItemRow}
                    >
                      <Text style={styles.sortedItemText}>{item.text}</Text>
                      <View
                        style={[
                          styles.priorityBadge,
                          getPriorityStyle(item.priority),
                        ]}
                      >
                        <Text style={styles.priorityText}>{item.priority}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}

          {!isLoading && (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              updateCellsBatchingPeriod={50}
              windowSize={11}
              removeClippedSubviews={Platform.OS === 'android'}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>☁️</Text>
                  <Text style={styles.emptyText}>
                    YOUR MIND IS CLEAR... FOR NOW.
                  </Text>
                </View>
              }
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: Tokens.layout.maxWidth.prose,
    padding: Tokens.spacing[6],
  },
  header: {
    marginBottom: Tokens.spacing[8],
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
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    color: '#666666',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  // Input
  inputSection: {
    flexDirection: 'row',
    marginBottom: Tokens.spacing[8],
    gap: Tokens.spacing[3],
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#050505',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#333333',
    minHeight: INPUT_HEIGHT,
    justifyContent: 'center',
    ...Platform.select({
      web: { transition: 'border-color 0.2s ease' },
    }),
  },
  inputWrapperFocused: {
    borderColor: '#FFFFFF',
  },
  input: {
    paddingHorizontal: Tokens.spacing[4],
    color: '#FFFFFF',
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.base,
    minHeight: INPUT_HEIGHT,
    textAlignVertical: 'center',
    paddingVertical: 0,
    ...Platform.select({
      web: { outlineStyle: 'none' },
    }),
  },
  addButton: {
    minHeight: INPUT_HEIGHT,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
  },
  // Actions
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Tokens.spacing[4],
    paddingHorizontal: Tokens.spacing[2],
    alignItems: 'center',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing[4],
  },
  actionButton: {
    paddingVertical: Tokens.spacing[2],
    paddingHorizontal: Tokens.spacing[3],
    borderRadius: 0,
    ...Platform.select({
      web: { transition: 'all 0.2s ease' },
    }),
  },
  actionButtonDisabled: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
  clearHovered: {
    backgroundColor: '#222222',
  },
  clearPressed: {
    opacity: 0.7,
  },
  countText: {
    fontFamily: Tokens.type.fontFamily.mono,
    color: '#666666',
    fontSize: Tokens.type.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  clearText: {
    fontFamily: Tokens.type.fontFamily.mono,
    color: '#CC0000',
    fontSize: Tokens.type.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  aiSortText: {
    fontFamily: Tokens.type.fontFamily.mono,
    color: '#FFFFFF',
    fontSize: Tokens.type.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Sorted Section
  sortedSection: {
    marginTop: Tokens.spacing[6],
    marginBottom: Tokens.spacing[6],
    padding: Tokens.spacing[5],
    backgroundColor: '#050505',
    borderRadius: 0,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#333333',
  },
  sortedTitle: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.sm,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Tokens.spacing[4],
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sortedGroup: {
    marginBottom: Tokens.spacing[5],
  },
  sortedCategory: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    fontWeight: '700',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Tokens.spacing[3],
    opacity: 0.9,
  },
  sortedItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Tokens.spacing[2],
    marginBottom: Tokens.spacing[1],
  },
  sortedItemText: {
    flex: 1,
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.sm,
    color: '#CCCCCC',
    lineHeight: Tokens.type.sm * 1.5,
    marginRight: Tokens.spacing[3],
  },
  priorityBadge: {
    paddingHorizontal: Tokens.spacing[2],
    paddingVertical: 2,
    borderRadius: 0,
    minWidth: 50,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  priorityText: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xxs,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#FFFFFF',
  },
  priorityHigh: {
    backgroundColor: '#CC0000',
    borderColor: '#CC0000',
  },
  priorityMedium: {
    backgroundColor: '#333333',
  },
  priorityLow: {
    backgroundColor: '#111111',
  },

  listContent: {
    paddingBottom: 120,
  },
  item: {
    backgroundColor: '#000000',
    borderRadius: 0,
    paddingHorizontal: Tokens.spacing[5],
    paddingVertical: Tokens.spacing[4],
    marginBottom: -1, // Collapse borders
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    ...Platform.select({
      web: {
        transition: 'all 0.2s ease',
      },
    }),
  },
  itemText: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.base,
    lineHeight: Tokens.type.base * 1.5,
    marginRight: Tokens.spacing[4],
  },
  deleteButton: {
    padding: Tokens.spacing[2],
    borderRadius: 0,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { transition: 'all 0.2s ease' },
    }),
  },
  deleteButtonHovered: {
    backgroundColor: '#222222',
  },
  deleteButtonPressed: {
    backgroundColor: '#333333',
  },
  deleteText: {
    color: '#666666',
    fontSize: Tokens.type.h3,
    fontWeight: '300',
    marginTop: -4,
  },
  // Empty
  emptyState: {
    alignItems: 'center',
    marginTop: Tokens.spacing[12],
    opacity: 0.3,
  },
  emptyIcon: {
    fontSize: Tokens.type['5xl'],
    marginBottom: Tokens.spacing[4],
    filter: 'grayscale(100%)',
  },
  emptyText: {
    fontFamily: Tokens.type.fontFamily.mono,
    color: '#666666',
    fontSize: Tokens.type.sm,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  // Recording
  recordSection: {
    alignItems: 'center',
    marginBottom: Tokens.spacing[8],
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: Tokens.spacing[6],
    paddingVertical: Tokens.spacing[3],
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#333333',
    minWidth: 160,
    justifyContent: 'center',
    ...Platform.select({
      web: {
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      },
    }),
  },
  recordButtonHovered: {
    borderColor: '#FFFFFF',
  },
  recordButtonActive: {
    backgroundColor: '#FF0000', // THE RED ACCENT
    borderColor: '#FF0000',
  },
  recordButtonProcessing: {
    opacity: 0.5,
    backgroundColor: '#222222',
  },
  recordButtonPressed: {
    opacity: 0.8,
  },
  recordIcon: {
    fontSize: Tokens.type.h3,
    marginRight: Tokens.spacing[2],
    color: '#FFFFFF',
  },
  recordText: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.sm,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  recordHint: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xxs,
    color: '#666666',
    marginTop: Tokens.spacing[2],
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  errorText: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    color: '#CC0000',
    marginTop: Tokens.spacing[2],
    textAlign: 'center',
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

export default BrainDumpScreen;

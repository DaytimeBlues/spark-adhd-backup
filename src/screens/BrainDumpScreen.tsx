import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
  Pressable,
} from 'react-native';
import StorageService from '../services/StorageService';
import OverlayService from '../services/OverlayService';
import { generateId } from '../utils/helpers';
// We remove MetroButton to use a custom button aligned with new design
import { LinearButton } from '../components/ui/LinearButton';
import { Tokens } from '../theme/tokens';

const INPUT_HEIGHT = 40;
const HIT_SLOP = {
  top: Tokens.spacing[2],
  bottom: Tokens.spacing[2],
  left: Tokens.spacing[2],
  right: Tokens.spacing[2],
};
const ITEM_BORDER_WIDTH = 2;
const ITEM_LINE_HEIGHT = 20;

interface DumpItem {
  id: string;
  text: string;
  createdAt: string;
}

const BrainDumpScreen = () => {
  const [input, setInput] = useState('');
  const [items, setItems] = useState<DumpItem[]>([]);

  // On web, layout animation is CSS based usually, but we keep RN logic for now

  const loadItems = async () => {
    const storedItems = await StorageService.getJSON<DumpItem[]>(
      StorageService.STORAGE_KEYS.brainDump,
    );
    if (!storedItems || !Array.isArray(storedItems)) {
      return;
    }

    const normalized = storedItems.filter(item => {
      return Boolean(item?.id && item?.text && item?.createdAt);
    });

    // Animate initial load
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItems(normalized);
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
    StorageService.setJSON(StorageService.STORAGE_KEYS.brainDump, items);
    OverlayService.updateCount(items.length);
  }, [items]);

  const addItem = () => {
    if (input.trim()) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const newItem: DumpItem = {
        id: generateId(),
        text: input.trim(),
        createdAt: new Date().toISOString(),
      };
      setItems(prevItems => [newItem, ...prevItems]);
      setInput('');
    }
  };

  const deleteItem = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const clearAll = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItems([]);
  };

  const renderItem = ({ item }: { item: DumpItem }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.text}</Text>
      <TouchableOpacity
        onPress={() => deleteItem(item.id)}
        style={styles.deleteButton}
        hitSlop={HIT_SLOP}
      >
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContainer}>
        <View style={styles.contentWrapper}>

          <View style={styles.header}>
            <Text style={styles.title}>Brain Dump</Text>
            <Text style={styles.subtitle}>Unload your thoughts. We'll keep them safe.</Text>
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  Platform.OS === 'web' ? ({ outlineWidth: 0 } as any) : null,
                ]}
                placeholder="What's on your mind?"
                placeholderTextColor={Tokens.colors.text.tertiary}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={addItem}
                multiline
              />
            </View>
            <LinearButton
              title="Add"
              onPress={addItem}
              size="md"
              style={styles.addButton}
            />
          </View>

          {items.length > 0 && (
            <View style={styles.actionsBar}>
              <Text style={styles.countText}>{items.length} items</Text>
              <TouchableOpacity onPress={clearAll}>
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          )}

          <FlatList
            data={items}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>☁️</Text>
                <Text style={styles.emptyText}>
                  Your mind is clear... for now.
                </Text>
              </View>
            }
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 680,
    padding: Tokens.spacing[4],
  },
  header: {
    marginBottom: Tokens.spacing[8],
    marginTop: Tokens.spacing[4],
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: '700',
    color: Tokens.colors.text.primary,
    marginBottom: Tokens.spacing[1],
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.base,
    color: Tokens.colors.text.secondary,
  },
  // Input
  inputSection: {
    flexDirection: 'row',
    marginBottom: Tokens.spacing[6],
    gap: Tokens.spacing[3],
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral.darker,
    borderRadius: Tokens.radii.md,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    minHeight: INPUT_HEIGHT,
    justifyContent: 'center',
  },
  input: {
    paddingHorizontal: Tokens.spacing[3],
    color: Tokens.colors.text.primary,
    fontFamily: 'Inter',
    fontSize: Tokens.type.base,
    minHeight: INPUT_HEIGHT,
    textAlignVertical: 'center',
  },
  addButton: {
    minHeight: INPUT_HEIGHT,
    paddingHorizontal: Tokens.spacing[4],
  },
  // Actions
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Tokens.spacing[4],
    paddingHorizontal: Tokens.spacing[1],
  },
  countText: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.tertiary,
    fontSize: Tokens.type.xs,
  },
  clearText: {
    fontFamily: 'Inter',
    color: Tokens.colors.error.main,
    fontSize: Tokens.type.xs,
    fontWeight: '600',
  },
  // List
  listContent: {
    paddingBottom: Tokens.spacing[16],
  },
  item: {
    backgroundColor: Tokens.colors.neutral.darker,
    borderRadius: Tokens.radii.md,
    padding: Tokens.spacing[4],
    marginBottom: Tokens.spacing[3],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: ITEM_BORDER_WIDTH,
    borderLeftColor: Tokens.colors.indigo.primary,
  },
  itemText: {
    flex: 1,
    color: Tokens.colors.text.primary,
    fontFamily: 'Inter',
    fontSize: Tokens.type.base,
    lineHeight: ITEM_LINE_HEIGHT,
    marginRight: Tokens.spacing[4],
  },
  deleteButton: {
    padding: Tokens.spacing[2],
  },
  deleteText: {
    color: Tokens.colors.text.tertiary,
    fontSize: 14,
  },
  // Empty
  emptyState: {
    alignItems: 'center',
    marginTop: Tokens.spacing[12],
    opacity: 0.5,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Tokens.spacing[4],
  },
  emptyText: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.tertiary,
    fontSize: Tokens.type.base,
  },
});

export default BrainDumpScreen;

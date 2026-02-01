import React, {useEffect, useState} from 'react';
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
} from 'react-native';
import StorageService from '../services/StorageService';
import OverlayService from '../services/OverlayService';
import {generateId} from '../utils/helpers';
import {MetroButton} from '../components/metro/MetroButton';
import {MetroPalette, MetroSpacing, MetroTypography} from '../theme/metroTheme';

interface DumpItem {
  id: string;
  text: string;
  createdAt: string;
}

const BrainDumpScreen = () => {
  const [input, setInput] = useState('');
  const [items, setItems] = useState<DumpItem[]>([]);

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

  const renderItem = ({item}: {item: DumpItem}) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.text}</Text>
      <TouchableOpacity onPress={() => deleteItem(item.id)}>
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Brain Dump</Text>
        <Text style={styles.subtitle}>Clear your mind, capture everything</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            placeholderTextColor={MetroPalette.gray}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={addItem}
            multiline
          />
          <MetroButton title="+" onPress={addItem} style={styles.addButton} />
        </View>

        {items.length > 0 && (
          <View style={styles.clearButtonContainer}>
             <MetroButton
                title="Clear All"
                onPress={clearAll}
                variant="link"
                accentColor={MetroPalette.red}
             />
          </View>
        )}

        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Your brain is empty... for now
            </Text>
          }
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
    marginBottom: MetroSpacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: MetroSpacing.m,
    alignItems: 'stretch',
  },
  input: {
    flex: 1,
    backgroundColor: MetroPalette.darkGray,
    borderRadius: 0,
    padding: MetroSpacing.m,
    color: MetroPalette.white,
    fontFamily: MetroTypography.fontFamily,
    fontSize: MetroTypography.sizes.body,
    marginRight: MetroSpacing.s,
    minHeight: 50,
  },
  addButton: {
    minWidth: 60,
  },
  clearButtonContainer: {
    alignItems: 'flex-end',
    marginBottom: MetroSpacing.m,
  },
  listContent: {
    flexGrow: 1,
  },
  item: {
    backgroundColor: MetroPalette.darkGray,
    borderRadius: 0,
    padding: MetroSpacing.m,
    marginBottom: MetroSpacing.s,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    flex: 1,
    color: MetroPalette.white,
    fontFamily: MetroTypography.fontFamily,
    fontSize: MetroTypography.sizes.body,
  },
  deleteText: {
    color: MetroPalette.gray,
    fontSize: MetroTypography.sizes.h3,
    marginLeft: MetroSpacing.m,
  },
  emptyText: {
    color: MetroPalette.gray,
    fontFamily: MetroTypography.fontFamily,
    fontSize: MetroTypography.sizes.h3,
    textAlign: 'center',
    marginTop: MetroSpacing.xxl,
  },
});

export default BrainDumpScreen;

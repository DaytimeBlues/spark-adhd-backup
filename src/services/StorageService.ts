import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  streakCount: 'streakCount',
  lastUseDate: 'lastUseDate',
  theme: 'theme',
  tasks: 'tasks',
  brainDump: 'brainDump',
  igniteState: 'igniteState',
  pomodoroState: 'pomodoroState',
};

const StorageService = {
  async get(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  async set(key: string, value: string): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },

  async remove(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },

  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const value = await this.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Storage getJSON error:', error);
      return null;
    }
  },

  async setJSON<T>(key: string, value: T): Promise<boolean> {
    try {
      return await this.set(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage setJSON error:', error);
      return false;
    }
  },

  STORAGE_KEYS,
};

export default StorageService;

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_VERSION = 1;
const STORAGE_VERSION_KEY = 'storageVersion';

const STORAGE_KEYS = {
  streakCount: 'streakCount',
  lastUseDate: 'lastUseDate',
  theme: 'theme',
  tasks: 'tasks',
  brainDump: 'brainDump',
  igniteState: 'igniteState',
  pomodoroState: 'pomodoroState',
  firstSuccessGuideState: 'firstSuccessGuideState',
  uxMetricsEvents: 'uxMetricsEvents',
  googleTasksSyncState: 'googleTasksSyncState',
  googleTasksProcessedIds: 'googleTasksProcessedIds',
  googleTasksLastSyncAt: 'googleTasksLastSyncAt',
};

/**
 * Storage migration logic
 * Add migration functions here as schema evolves
 */
const migrations: Record<number, () => Promise<void>> = {
  // Example: Version 2 migration
  // 2: async () => {
  //   const oldKey = await AsyncStorage.getItem('oldKey');
  //   if (oldKey) {
  //     await AsyncStorage.setItem('newKey', transformData(oldKey));
  //     await AsyncStorage.removeItem('oldKey');
  //   }
  // },
};

const runMigrations = async (): Promise<void> => {
  try {
    const storedVersion = await AsyncStorage.getItem(STORAGE_VERSION_KEY);
    const currentVersion = storedVersion ? parseInt(storedVersion, 10) : 0;

    if (currentVersion < STORAGE_VERSION) {
      // Run all migrations between current and target version
      for (let v = currentVersion + 1; v <= STORAGE_VERSION; v++) {
        if (migrations[v]) {
          await migrations[v]();
        }
      }

      await AsyncStorage.setItem(
        STORAGE_VERSION_KEY,
        STORAGE_VERSION.toString(),
      );
    }
  } catch (error) {
    console.error('Storage migration error:', error);
  }
};

const StorageService = {
  /**
   * Initialize storage and run migrations
   * Call this once at app startup
   */
  async init(): Promise<void> {
    await runMigrations();
  },

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

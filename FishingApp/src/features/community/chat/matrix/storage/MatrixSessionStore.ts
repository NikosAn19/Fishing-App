import AsyncStorage from '@react-native-async-storage/async-storage';

const MATRIX_SESSION_KEY = 'matrix_session_sync_token';

/**
 * Handles persistence of Matrix session data (Sync Token).
 * Used to resume sessions without re-fetching old history.
 */
export class MatrixSessionStore {
  /**
   * Save the next_batch token from sync response
   */
  async setSyncToken(token: string): Promise<void> {
    try {
      console.log(`💾 MatrixSessionStore: Saving token: ${token.substring(0, 10)}...`);
      await AsyncStorage.setItem(MATRIX_SESSION_KEY, token);
    } catch (error) {
      console.error('❌ MatrixSessionStore: Failed to save sync token', error);
    }
  }

  /**
   * Retrieve the last saved sync token
   */
  async getSyncToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(MATRIX_SESSION_KEY);
      console.log(`📂 MatrixSessionStore: Loaded token: ${token ? token.substring(0, 10) + '...' : 'null'}`);
      return token;
    } catch (error) {
      console.error('❌ MatrixSessionStore: Failed to get sync token', error);
      return null;
    }
  }

  /**
   * Clear sync token (on logout)
   */
  async clearSyncToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(MATRIX_SESSION_KEY);
      console.log('✅ MatrixSessionStore: Sync token cleared');
    } catch (error) {
      console.error('❌ MatrixSessionStore: Failed to clear sync token', error);
    }
  }
}

export const matrixSessionStore = new MatrixSessionStore();

// Storage Manager - Handles localStorage operations
const storageManager = (() => {
  const STORAGE_KEY = 'todoAppData';
  const THEME_KEY = 'todoAppTheme';

  const save = (data) => {
    try {
      const jsonData = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, jsonData);
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  };

  const load = () => {
    try {
      const jsonData = localStorage.getItem(STORAGE_KEY);
      if (jsonData) {
        return JSON.parse(jsonData);
      }
      return null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  };

  const clear = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  };

  // Theme management
  const saveTheme = (theme) => {
    try {
      localStorage.setItem(THEME_KEY, theme);
      return true;
    } catch (error) {
      console.error('Error saving theme:', error);
      return false;
    }
  };

  const loadTheme = () => {
    try {
      return localStorage.getItem(THEME_KEY) || 'light';
    } catch (error) {
      console.error('Error loading theme:', error);
      return 'light';
    }
  };

  return {
    save,
    load,
    clear,
    saveTheme,
    loadTheme  // Make sure this is exported!
  };
})();

export default storageManager;
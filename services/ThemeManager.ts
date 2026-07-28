export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: 'dark' | 'light' = 'dark';
  private subscribers: Set<(theme: 'dark' | 'light') => void> = new Set();

  private constructor() {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        this.currentTheme = savedTheme;
      }
    }
  }

  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  public getTheme(): 'dark' | 'light' {
    return this.currentTheme;
  }

  public setTheme(theme: 'dark' | 'light') {
    this.currentTheme = theme;
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
    this.subscribers.forEach((cb) => cb(theme));
  }

  public toggleTheme() {
    this.setTheme(this.currentTheme === 'dark' ? 'light' : 'dark');
  }

  public subscribe(callback: (theme: 'dark' | 'light') => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'selected-theme';
  private themeSubject = new BehaviorSubject<string>('default');
  public theme$: Observable<string> = this.themeSubject.asObservable();

  setTheme(theme: string) {
    // Apply theme to document root
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.className = `theme-${theme}`;
    
    // Persist to localStorage
    localStorage.setItem(this.THEME_KEY, theme);
    
    // Notify all subscribers
    this.themeSubject.next(theme);
    
    // Dispatch custom event for any other listeners
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }

  loadTheme() {
    const saved = localStorage.getItem(this.THEME_KEY) || 'default';
    this.setTheme(saved);
  }

  getCurrentTheme(): string | null {
    return localStorage.getItem(this.THEME_KEY);
  }

  getThemeObservable(): Observable<string> {
    return this.theme$;
  }
}

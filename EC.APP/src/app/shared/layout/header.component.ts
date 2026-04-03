
import { Component, inject } from '@angular/core';
import { StateService } from '../../services/state.service';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm/50 transition-colors duration-300"
      [style.background-color]="state.branding().headerColor">
      <!-- Breadcrumbs / Title -->
      <div>
        <h1 class="text-lg font-semibold tracking-tight capitalize"
           [style.color]="getTextColor(state.branding().headerColor)">

        </h1>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-4">
        <!-- Search -->
        <div class="relative hidden md:block">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </span>
          <input type="text" placeholder="Search..."
            class="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-64 outline-none
                   dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:bg-gray-600 dark:placeholder-gray-400">
        </div>

        <!-- Theme Toggle -->
        <button (click)="state.toggleTheme()" class="p-2 transition-transform duration-200 hover:opacity-80 active:scale-95"
           [style.color]="getMutedTextColor(state.branding().headerColor)"
           [title]="state.branding().themeMode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'">

          @if (state.branding().themeMode === 'light') {
            <!-- Moon Icon -->
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
          } @else {
            <!-- Sun Icon -->
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          }
        </button>

        <!-- Notifications -->
        <button class="relative p-2 transition-colors hover:opacity-80"
           [style.color]="getMutedTextColor(state.branding().headerColor)">
          <span class="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        </button>
      </div>
    </header>
  `
})
export class HeaderComponent {
  state = inject(StateService);
  router = inject(Router) as Router;

  // Reactive signal derived from Router events
  currentViewTitle = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.getSafeUrl()),
      startWith('Dashboard') // Safe default to prevent immediate router access
    ),
    { initialValue: 'Dashboard' }
  );

  getSafeUrl(): string {
    try {
      return this.formatTitleFromUrl(this.router.url);
    } catch {
      return 'Dashboard';
    }
  }

  formatTitleFromUrl(url: string): string {
    if (!url || url === '/') return 'Dashboard';
    // Remove slash and capitalization
    const clean = url.split('/')[1] || 'Dashboard';
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  getTextColor(bg: string) {
    return bg === '#FFFFFF' ? '#1F2937' : '#FFFFFF';
  }

  getMutedTextColor(bg: string) {
    return bg === '#FFFFFF' ? '#9CA3AF' : 'rgba(255,255,255,0.8)';
  }
}

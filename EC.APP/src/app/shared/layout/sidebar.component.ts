
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { StateService } from '../../services/state.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside [class]="sidebarClasses()" [style.background-color]="state.branding().sidebarColor">
      <!-- Logo -->
      <div class="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-700 overflow-hidden whitespace-nowrap">
        <div class="flex items-center gap-3 font-bold text-xl tracking-tight" [style.color]="state.branding().primaryColor">
          @if (state.branding().logoUrl) {
            <img [src]="state.branding().logoUrl" class="w-8 h-8 object-contain">
          } @else {
            <svg class="w-8 h-8 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
            </svg>
          }
          <span [class.opacity-0]="state.sidebarCollapsed()" class="transition-opacity duration-300"
             [style.color]="getTextColor(state.branding().sidebarColor)">{{ state.branding().companyName }}</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-1">

        <!-- Overview -->
        <div *ngIf="!state.sidebarCollapsed()" class="px-3 mb-2 text-xs font-semibold uppercase tracking-wider animate-fade-in"
             [style.color]="getMutedTextColor(state.branding().sidebarColor)">Overview</div>

        <a (click)="navigate('/dashboard')" [class]="getLinkClass('/dashboard')" title="Dashboard" class="cursor-pointer">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          <span [class.hidden]="state.sidebarCollapsed()" class="whitespace-nowrap">Dashboard</span>
        </a>

        <!-- Management -->
        <div *ngIf="!state.sidebarCollapsed()" class="px-3 mt-6 mb-2 text-xs font-semibold uppercase tracking-wider animate-fade-in"
             [style.color]="getMutedTextColor(state.branding().sidebarColor)">Management</div>

        <a (click)="navigate('/product')" [class]="getLinkClass('/product')" title="Products" class="cursor-pointer">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          <span [class.hidden]="state.sidebarCollapsed()" class="whitespace-nowrap">Products</span>
        </a>

        <a (click)="navigate('/category')" [class]="getLinkClass('/category')" title="Categories" class="cursor-pointer">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
          <span [class.hidden]="state.sidebarCollapsed()" class="whitespace-nowrap">Categories</span>
        </a>

        <a (click)="navigate('/order')" [class]="getLinkClass('/order')" title="Orders" class="cursor-pointer">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          <span [class.hidden]="state.sidebarCollapsed()" class="whitespace-nowrap">Orders</span>
          <!-- <span *ngIf="!state.sidebarCollapsed()" class="ml-auto bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-xs font-medium">5</span> -->
        </a>

        <a (click)="navigate('/customer')" [class]="getLinkClass('/customer')" title="Customers" class="cursor-pointer">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          <span [class.hidden]="state.sidebarCollapsed()" class="whitespace-nowrap">Customers</span>
        </a>

        <!-- Access Control -->
        <div *ngIf="!state.sidebarCollapsed()" class="px-3 mt-6 mb-2 text-xs font-semibold uppercase tracking-wider animate-fade-in"
             [style.color]="getMutedTextColor(state.branding().sidebarColor)">Access Control</div>

        <a (click)="navigate('/user/adminusers')" [class]="getLinkClass('/user/adminusers')" title="Users" class="cursor-pointer">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          <span [class.hidden]="state.sidebarCollapsed()" class="whitespace-nowrap">Users</span>
        </a>

        <a (click)="navigate('/user/roles')" [class]="getLinkClass('/user/roles')" title="Roles & Permissions" class="cursor-pointer">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          <span [class.hidden]="state.sidebarCollapsed()" class="whitespace-nowrap">Roles</span>
        </a>

        <!-- System -->
        <div *ngIf="!state.sidebarCollapsed()" class="px-3 mt-6 mb-2 text-xs font-semibold uppercase tracking-wider animate-fade-in"
             [style.color]="getMutedTextColor(state.branding().sidebarColor)">System</div>

        <!-- <a (click)="navigate('/tenants')" [class]="getLinkClass('/tenants')" title="Tenant Management" class="cursor-pointer">
           <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
           <span [class.hidden]="state.sidebarCollapsed()" class="whitespace-nowrap">Tenants</span>
        </a> -->

        <a (click)="navigate('/settings')" [class]="getLinkClass('/settings')" title="Settings" class="cursor-pointer">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span [class.hidden]="state.sidebarCollapsed()" class="whitespace-nowrap">Settings</span>
        </a>

      </nav>

      <!-- Collapse Toggle -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-700" [style.border-color]="state.branding().sidebarColor !== '#FFFFFF' ? 'rgba(0,0,0,0.05)' : ''">
        <button (click)="state.toggleSidebar()" class="flex items-center justify-center w-full p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
           [style.color]="getMutedTextColor(state.branding().sidebarColor)">
          <svg [class.rotate-180]="state.sidebarCollapsed()" class="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
        </button>
      </div>

      <!-- User Profile Small -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-700 overflow-hidden" [style.border-color]="state.branding().sidebarColor !== '#FFFFFF' ? 'rgba(0,0,0,0.05)' : ''">
        <div class="flex items-center gap-3">
          <img class="h-9 w-9 rounded-full object-cover border border-gray-200 flex-shrink-0" src="https://ui-avatars.com/api/?name=Admin+User&background=EFF6FF&color=2563EB" alt="Admin">
          <div *ngIf="!state.sidebarCollapsed()" class="flex-1 min-w-0 transition-opacity duration-300">
            <p class="text-sm font-medium truncate" [style.color]="getTextColor(state.branding().sidebarColor)"> {{getUserName()}}  </p>
            <p class="text-xs truncate" [style.color]="getMutedTextColor(state.branding().sidebarColor)">{{ getLoginName() }} </p>
          </div>
          <button *ngIf="!state.sidebarCollapsed()" (click)="logout()" class="text-gray-400 hover:text-red-500 transition-colors" title="Logout">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  state = inject(StateService);
  router = inject(Router) as Router;
  constructor(private tokenService: TokenService) { }
  // Defensive: Create a signal for the URL that safely catches errors
  // This prevents synchronous 'operation is insecure' errors during template rendering
  currentUrl = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        try {
          return this.router.url;
        } catch {
          return '';
        }
      }),
      startWith('') // Start with empty to avoid immediate router access
    ),
    { initialValue: '' }
  );

  sidebarClasses() {
    const base = "border-r border-gray-200 dark:border-gray-700 h-screen flex flex-col fixed left-0 top-0 z-20 transition-all duration-300 ease-in-out";
    return this.state.sidebarCollapsed() ? `${base} w-20` : `${base} w-64`;
  }

  getLinkClass(path: string) {
    // Use the safe signal instead of accessing router.url directly
    const url = this.currentUrl() || '';
    const isActive = url.includes(path);
    const collapsed = this.state.sidebarCollapsed();
    const base = 'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg w-full transition-colors duration-200 mb-1 gap-3 decoration-0';

    const layout = collapsed ? 'justify-center' : 'justify-start';
    const sidebarBg = this.state.branding().sidebarColor;
    const isDarkSidebar = sidebarBg !== '#FFFFFF';

    if (isActive) {
      if (isDarkSidebar) return `${base} ${layout} bg-white/20 text-white`;
      return `${base} ${layout} bg-blue-50 text-blue-700`;
    }

    if (isDarkSidebar) return `${base} ${layout} text-white/70 hover:bg-white/10 hover:text-white`;
    return `${base} ${layout} text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white`;
  }

  getTextColor(bg: string) {
    return bg === '#FFFFFF' ? '#1F2937' : '#FFFFFF';
  }

  getMutedTextColor(bg: string) {
    return bg === '#FFFFFF' ? '#6B7280' : 'rgba(255,255,255,0.6)';
  }

  navigate(path: string) {
    if (window.innerWidth < 1024) {
      this.state.sidebarCollapsed.set(true);
    }
    try {
      this.router.navigate([path]);
    } catch (e) {
      console.warn('Navigation blocked:', e);
    }
  }

  logout() {
    //this.state.logout();
    setTimeout(() => {
      try { this.router.navigate(['/login']); } catch { }
    }, 100);
  }

  getUserName() {
    return this.tokenService.getUserName();
  }

  getLoginName() {
    return this.tokenService.getUserLoginName();
  }
}

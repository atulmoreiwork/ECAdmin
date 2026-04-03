
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { HeaderComponent } from './header.component';
import { StateService } from '../../services/state.service';
import { BrandingService } from '../../services/branding.service';


@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent],
    template: `
    <div class="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <app-sidebar />
      <!-- Layout Content Wrapper -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-in-out"
           [class.ml-64]="!state.sidebarCollapsed()"
           [class.ml-20]="state.sidebarCollapsed()">

        <app-header />

        <main class="flex-1 overflow-y-auto p-0 scroll-smooth">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent implements OnInit {
    state = inject(StateService);
    router = inject(Router);
    brandingService = inject(BrandingService);

    ngOnInit() {
      this.loadAdminBranding();
    }

    private loadAdminBranding(): void {
      this.brandingService.getBranding('admin').subscribe({
        next: (res) => this.state.updateBranding(res)
      });
    }
}

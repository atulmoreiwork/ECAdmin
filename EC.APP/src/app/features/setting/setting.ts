import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IBranding } from '../../models/branding';
import { BrandingService } from '../../services/branding.service';
import { StateService } from '../../services/state.service';
import { IUsers } from '../../models/admin-users';
import { UsersService } from '../../services/users.service';
import { getUserId } from '../../utilities/utility';

@Component({
  selector: 'app-setting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './setting.html',
  styleUrl: './setting.css',
})
export class Setting implements OnInit {
  users!: IUsers;
  state = inject(StateService);
  private brandingService = inject(BrandingService);

  constructor(private userService: UsersService, private cdr: ChangeDetectorRef) { }

  activeTab = 'general';
  selectedBrandingFor: 'admin' | 'client' = 'admin';
  adminBranding: IBranding = this.state.getDefaultBranding();
  clientBranding: IBranding = this.state.getDefaultBranding();
  isBrandingLoading = false;
  isSaving = false;
  feedbackMessage = '';
  feedbackType: 'success' | 'error' = 'success';

  ngOnInit(): void {
    this.loadBrandingForBothPortals();
    this.getUserData();
  }

  getTabClass(tab: string): string {
    const base = 'px-6 py-4 text-sm font-medium focus:outline-none border-b-2 transition-colors ';
    return this.activeTab === tab
      ? base + 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
      : base + 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600';
  }

  private loadBrandingForBothPortals(): void {
    this.isBrandingLoading = true;
    this.brandingService.getBranding('admin').subscribe({
      next: (data) => {
        this.adminBranding = this.state.normalizeBranding(data);
        this.state.updateBranding(this.adminBranding);
        this.brandingService.getBranding('client').subscribe({
          next: (clientData) => {
            this.clientBranding = this.state.normalizeBranding(clientData);
            this.isBrandingLoading = false;
          },
          error: () => {
            this.clientBranding = this.state.getDefaultBranding();
            this.isBrandingLoading = false;
          }
        });
      },
      error: () => {
        this.adminBranding = this.state.getDefaultBranding();
        this.clientBranding = this.state.getDefaultBranding();
        this.state.updateBranding(this.adminBranding);
        this.isBrandingLoading = false;
      }
    });
  }

  get branding(): IBranding {
    return this.selectedBrandingFor === 'admin' ? this.adminBranding : this.clientBranding;
  }

  onBrandingSectionChange(section: 'admin' | 'client'): void {
    this.selectedBrandingFor = section;
    this.feedbackMessage = '';
    this.applyPreview();
  }

  applyPreview(): void {
    const previewBranding = this.selectedBrandingFor === 'admin'
      ? this.adminBranding
      : {
        ...this.clientBranding,
        clientLogoUrl: this.clientBranding.logoUrl,
        clientPrimaryColor: this.clientBranding.primaryColor
      };

    this.state.updateBranding(previewBranding);
  }

  saveSettings(): void {
    if (this.activeTab !== 'branding') {
      this.feedbackType = 'success';
      this.feedbackMessage = 'Settings saved successfully.';
      return;
    }

    this.isSaving = true;
    this.feedbackMessage = '';
    const brandingToSave = this.state.normalizeBranding(this.branding);
    this.brandingService
      .saveBranding(this.selectedBrandingFor, brandingToSave)
      .subscribe({
        next: (res: any) => {
          this.isSaving = false;
          if (res?.success) {
            this.feedbackType = 'success';
            this.feedbackMessage = `${this.selectedBrandingFor === 'admin' ? 'Admin' : 'Client'} portal branding saved successfully.`;
            if (this.selectedBrandingFor === 'admin') {
              this.adminBranding = brandingToSave;
            } else {
              this.clientBranding = brandingToSave;
            }
            this.applyPreview();
          } else {
            this.feedbackType = 'error';
            this.feedbackMessage = 'Failed to save branding.';
          }
        },
        error: () => {
          this.isSaving = false;
          this.feedbackType = 'error';
          this.feedbackMessage = 'Failed to save branding.';
        }
      });
  }

  resetBranding(): void {
    if (this.selectedBrandingFor === 'admin') {
      this.adminBranding = this.state.getDefaultBranding();
    } else {
      this.clientBranding = this.state.getDefaultBranding();
    }
    this.applyPreview();
  }

  getUserData() {
    var userId = parseInt(getUserId());
    this.userService.getUser(userId).subscribe((data: any) => {
      //console.log(data);
      if (data != undefined && data != null) {
        this.users = data;
        this.cdr.detectChanges();
      }
    });
  }
}

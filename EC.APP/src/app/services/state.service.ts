
import { effect, Injectable, signal } from '@angular/core';
import { ITenant } from '../models/tenant';
import { IBranding } from '../models/branding';

export interface User {
    id: string;
    name: string;
    email: string;
    roleId: string;
    roleName: string;
    status: 'Active' | 'Inactive';
    lastLogin: string;
}

export const DEFAULT_BRANDING: IBranding = {
    brandingId: 0,
    companyName: 'ECAdmin',
    logoUrl: '',
    primaryColor: '#2563EB',
    secondaryColor: '#1E40AF',
    sidebarColor: '#FFFFFF',
    headerColor: '#FFFFFF',
    fontFamily: 'Inter',
    themeMode: 'light',
    clientLogoUrl: '',
    clientPrimaryColor: '#2563EB'
};

@Injectable({ providedIn: 'root' })
export class StateService {
    // Navigation State
    readonly sidebarCollapsed = signal(false);
    readonly user = signal<{ name: string; email: string; role: string } | null>(null);

    // App Branding State
    readonly branding = signal<IBranding>({ ...DEFAULT_BRANDING });

    constructor() {
        effect(() => {
            this.applyBrandingToRoot(this.branding());
        });
    }

    toggleSidebar() {
        this.sidebarCollapsed.update(v => !v);
    }

    toggleTheme() {
        this.branding.update(b => {
            const isDark = b.themeMode === 'dark';
            // Switch to opposite
            const newMode = isDark ? 'light' : 'dark';

            return {
                ...b,
                themeMode: newMode,
                // Update structural colors to default defaults for the theme
                sidebarColor: newMode === 'dark' ? '#1F2937' : '#FFFFFF',
                headerColor: newMode === 'dark' ? '#1F2937' : '#FFFFFF',
            };
        });
    }
    logout() {
        this.user.set(null);
    }

    // Tenants
    readonly tenants = signal<ITenant[]>([
        {
            id: 'T-001', name: 'Acme Corp', domain: 'acme.ecadmin.com', plans: 'Enterprise', status: 'Active', users: 124,
            tenantId: 0
        },
        {
            id: 'T-002', name: 'Beta Startups', domain: 'beta.ecadmin.com', plans: 'Starter', status: 'Active', users: 3,
            tenantId: 0
        },
    ]);
    addTenant(tenant: ITenant) { this.tenants.update(t => [tenant, ...t]); }
    updateTenant(updated: ITenant) { this.tenants.update(t => t.map(item => item.id === updated.id ? updated : item)); }
    deleteTenant(id: string) { this.tenants.update(t => t.filter(item => item.id !== id)); }

    updateBranding(newBranding: Partial<IBranding>) {
        this.branding.set(this.normalizeBranding(newBranding));
    }

    getDefaultBranding(): IBranding {
        return { ...DEFAULT_BRANDING };
    }

    normalizeBranding(branding: Partial<IBranding>): IBranding {
        return {
            brandingId: branding.brandingId || 0,
            companyName: branding.companyName || DEFAULT_BRANDING.companyName,
            logoUrl: branding.logoUrl || '',
            primaryColor: this.isHex(branding.primaryColor) ? branding.primaryColor! : DEFAULT_BRANDING.primaryColor,
            secondaryColor: this.isHex(branding.secondaryColor) ? branding.secondaryColor! : DEFAULT_BRANDING.secondaryColor,
            sidebarColor: this.isHex(branding.sidebarColor) ? branding.sidebarColor! : DEFAULT_BRANDING.sidebarColor,
            headerColor: this.isHex(branding.headerColor) ? branding.headerColor! : DEFAULT_BRANDING.headerColor,
            fontFamily: branding.fontFamily || DEFAULT_BRANDING.fontFamily,
            themeMode: branding.themeMode === 'dark' ? 'dark' : 'light',
            brandingFor: branding.brandingFor,
            clientLogoUrl: branding.clientLogoUrl || '',
            clientPrimaryColor: this.isHex(branding.clientPrimaryColor) ? branding.clientPrimaryColor! : DEFAULT_BRANDING.clientPrimaryColor
        };
    }

    private isHex(value: string | undefined): boolean {
        if (!value) return false;
        return /^#([0-9A-F]{3}){1,2}$/i.test(value);
    }

    private applyBrandingToRoot(branding: IBranding): void {
        try {
            const root = document.documentElement;
            root.style.setProperty('--primary-color', branding.primaryColor);
            root.style.setProperty('--primary-color-hover', this.darkenHex(branding.primaryColor, 0.15));
            root.style.setProperty('--secondary-color', branding.secondaryColor);
            root.style.setProperty('--sidebar-bg', branding.sidebarColor);
            root.style.setProperty('--header-bg', branding.headerColor);
            root.style.setProperty('--font-family', branding.fontFamily);
            root.style.fontFamily = branding.fontFamily;

            if (branding.themeMode === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        } catch {
            // Ignore DOM access issues in restricted environments.
        }
    }

    private darkenHex(hex: string, ratio: number): string {
        const normalized = hex.replace('#', '');
        if (normalized.length !== 6) return hex;

        const r = parseInt(normalized.substring(0, 2), 16);
        const g = parseInt(normalized.substring(2, 4), 16);
        const b = parseInt(normalized.substring(4, 6), 16);

        const dr = Math.max(0, Math.min(255, Math.round(r * (1 - ratio))));
        const dg = Math.max(0, Math.min(255, Math.round(g * (1 - ratio))));
        const db = Math.max(0, Math.min(255, Math.round(b * (1 - ratio))));

        return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
    }
}

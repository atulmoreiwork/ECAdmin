export interface IBranding {
  brandingId?: number;
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  sidebarColor: string;
  headerColor: string;
  fontFamily: string;
  themeMode: 'light' | 'dark';
  brandingFor?: 'admin' | 'client';
  clientLogoUrl: string;
  clientPrimaryColor: string;
}

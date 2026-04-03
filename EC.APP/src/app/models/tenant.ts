export interface ITenant {
    tenantId: number;
    id?: string;
    name: string;
    domain: string;
    plans: 'Starter' | 'Pro' | 'Enterprise';
    status: 'Active' | 'Inactive';
    users: number;

    maxUsers?: number;
    storageLimitGB?: number;
    subscriptionStart?: string;
    subscriptionEnd?: string;

    row?: number;
    totalRowCount?: number;
    flag?: number;
}

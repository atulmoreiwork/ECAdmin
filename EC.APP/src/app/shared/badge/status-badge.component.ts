import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../badge/badge.component';

export type OrderStatus = 'pending' | 'processing' | 'delivered' | 'canceled' | 'returned';

@Component({
  selector: 'app-status-badge',
  imports: [CommonModule, BadgeComponent],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.css'
})
export class StatusBadgeComponent {
  @Input() status: OrderStatus = 'pending';

  get statusConfig(): { variant: any; icon: string; label: string } {
    const configs: Record<OrderStatus, { variant: any; icon: string; label: string }> = {
      pending: { variant: 'warning', icon: '⏱️', label: 'Pending' },
      processing: { variant: 'info', icon: '⚙️', label: 'Processing' },
      delivered: { variant: 'success', icon: '✓', label: 'Delivered' },
      canceled: { variant: 'danger', icon: '✕', label: 'Canceled' },
      returned: { variant: 'gray', icon: '↩️', label: 'Returned' }
    };
    return configs[this.status] || configs.pending;
  }
}

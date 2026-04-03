import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TenantService } from '../../../services/tenant.service';

@Component({
  selector: 'app-tenant-delete',
  standalone: true,
  imports: [],
  templateUrl: './tenant-delete.html',
  styleUrl: './tenant-delete.css',
})
export class TenantDelete {
  @Input() tenantId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  constructor(public tenantService: TenantService) {}

  confirmDelete(): void {
    if (!this.tenantId) return;

    this.tenantService.deleteTenantById(this.tenantId).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.deleted.emit();
        } else {
          console.log('Failed to delete tenant: ' + (res?.message || 'Unknown error'));
        }
      },
      error: (err: any) => {
        console.log('Delete error:', err);
      }
    });
  }

  cancelDelete(): void {
    this.close.emit();
  }
}

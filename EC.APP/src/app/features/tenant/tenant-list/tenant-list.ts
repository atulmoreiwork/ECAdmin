import { Component, OnInit, ViewChild, computed, signal } from '@angular/core';
import { ITenant } from '../../../models/tenant';
import { TenantService } from '../../../services/tenant.service';
import { FilterDetails } from '../../../shared/table/table.model';
import { PopupConfig } from '../../../models/popupconfig';
import { Popup } from '../../../shared/popup/popup';
import { TenantAddEdit } from '../tenant-add-edit/tenant-add-edit';
import { TenantDelete } from '../tenant-delete/tenant-delete';

type TenantCard = ITenant & { plans?: string };

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [Popup, TenantAddEdit, TenantDelete],
  templateUrl: './tenant-list.html',
  styleUrl: './tenant-list.css',
})
export class TenantList implements OnInit {
  @ViewChild('addeditTenant') addeditTenant?: TenantAddEdit;
  @ViewChild('deleteTenant') deleteTenant?: TenantDelete;

  constructor(private tenantService: TenantService) { }
  popupConfig: PopupConfig = new PopupConfig();
  selectedTenantId = 0;

  tenants = signal<TenantCard[]>([]);
  currentPage = signal(1);
  itemsPerPage = 6;

  paginatedTenants = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.tenants().slice(start, start + this.itemsPerPage);
  });

  gridFilter: any = {
    Filter: [],
    PageNumber: 0,
    PageSize: 0
  };

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.popupConfig.isShowPopup = false;
    this.fillFilterObject();
  }

  fillFilterObject(): void {
    const index = this.gridFilter.Filter.findIndex(
      (obj: { colId: string }) => obj.colId.toLowerCase() === 'tenantid'
    );

    if (index > -1) {
      this.gridFilter.Filter[index].value = '';
    }

    if (this.gridFilter.Filter.length <= 0) {
      const objFilter = new FilterDetails();
      objFilter.colId = 'tenantid';
      objFilter.name = 'tenantid';
      objFilter.value = '';
      objFilter.type = 'num';
      this.gridFilter.Filter.push(objFilter);
    }

    this.getTenantsData();
  }

  getTenantsData(): void {
    this.tenantService.getAllTenants(this.gridFilter).subscribe({
      next: (data: any) => {
        if (data?.success === true) {
          const rows = data?.result?.data || [];
          this.tenants.set(rows.map((tenant: ITenant) => this.toTenantCard(tenant)));
          return;
        }

        this.tenants.set([]);
      },
      error: (err: any) => {
        console.log(err);
        this.tenants.set([]);
      }
    });
  }

  private toTenantCard(tenant: ITenant): TenantCard {
    return {
      ...tenant,
      id: tenant.id || (tenant.tenantId ? `T-${tenant.tenantId}` : ''),
      plans: (tenant as any).plans || tenant.plans || 'Starter'
    };
  }

  openAddModal(): void {
    this.addEditTenant(0);
  }

  openEditModal(tenant: TenantCard): void {
    this.addEditTenant(tenant.tenantId || 0);
  }

  addEditTenant(tenantId: number): void {
    this.selectedTenantId = tenantId;
    this.popupConfig = {
      popupFunctionalityType: 'addeditTenant',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'medium',
      headerText: this.selectedTenantId > 0 ? 'Update Tenant' : 'Add Tenant',
      buttons: [
        {
          label: this.selectedTenantId > 0 ? 'Update' : 'Add',
          cssClass: 'bg-primary-500 hover:bg-primary-700 text-white',
          action: 'custom',
          emitEventName: 'addEditTenant'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'custom',
          emitEventName: 'cancelAddEditTenant'
        }
      ]
    };
  }

  tenantDelete(tenantId: number): void {
    this.selectedTenantId = tenantId;
    this.popupConfig = {
      popupFunctionalityType: 'delete',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'small',
      headerText: 'Delete Tenant',
      buttons: [
        {
          label: 'Yes, Delete',
          cssClass: 'bg-primary-500 hover:bg-primary-700 text-white',
          action: 'custom',
          emitEventName: 'confirmDeleteTenant'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'custom',
          emitEventName: 'cancelDeleteTenant'
        }
      ]
    };
  }

  closePopup(): void {
    this.initForm();
  }

  onTenantDelete(): void {
    this.initForm();
  }

  onTenantAddEdited(): void {
    this.initForm();
  }

  handlePopupAction(event: string): void {
    switch (event) {
      case 'confirmDeleteTenant':
        this.deleteTenant?.confirmDelete();
        break;
      case 'cancelDeleteTenant':
        this.deleteTenant?.cancelDelete();
        break;
      case 'addEditTenant':
        this.addeditTenant?.submitForm();
        break;
      case 'cancelAddEditTenant':
        this.addeditTenant?.cancelAddEdit();
        break;
    }
  }

  getStatusClass(status: string): string {
    if (status === 'Active') return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }

}

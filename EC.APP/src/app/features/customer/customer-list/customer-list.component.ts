import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CmTableComponent } from '../../../shared/table/cm-table/cm-table.component';
import { FilterDetails, GridConfig, SortModel } from '../../../shared/table/table.model';
import { ICustomer } from '../../../models/customer.model';
import { CustomerService } from '../../../services/customer.service';
import { Router, RouterModule } from '@angular/router';
import { PopupConfig } from '../../../models/popupconfig';
import { CustomerDeleteComponent } from '../customer-delete/customer-delete.component';
import { CMTableDirective } from '../../../shared/table/cm-table.directive';
import { Popup } from '../../../shared/popup/popup';
import { CustomerAddEditComponent } from '../customer-add-edit/customer-add-edit.component';
import { CommonModule, DatePipe } from '@angular/common';
import { CmTablePaginationComponent } from '../../../shared/table/cm-table-pagination/cm-table-pagination.component';
import { setPaginationLogic } from '../../../shared/table/table-utility';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, CmTableComponent, CMTableDirective, RouterModule, CustomerDeleteComponent, Popup, CustomerAddEditComponent, CmTablePaginationComponent, DatePipe],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css'
})
export class CustomerListComponent implements OnInit {
  @ViewChild(CmTableComponent) child?: CmTableComponent;
  @ViewChild('deleteCustomer') deleteCustomer?: CustomerDeleteComponent;
  @ViewChild('addeditCustomer') addeditCustomer?: CustomerAddEditComponent;
  popupConfig: PopupConfig = new PopupConfig();
  gridConfig: GridConfig = new GridConfig();
  customer!: ICustomer;
  selectedCustomerId: number = 0;
  allCustomer: any[] = [];
  viewMode: 'list' | 'tiles' = 'list';
  constructor(private customerService: CustomerService, private router: Router, private cdr: ChangeDetectorRef) {
    this.tableObject.gridConfig = this.gridConfig;
  }
  ngOnInit(): void {
    this.initForm();
  }
  initForm() {
    this.popupConfig.isShowPopup = false;
    this.fillFilterObject();
  }
  sortObj: SortModel = {
    orderBy: -1,
    columnName: 'row',
    sortType: 'num',
    condition: null
  }
  tableObject: any = {
    columns: [],
    data: [],
    rows: [],
    filter: [],
    gridConfig: {},
    totalItems: 0,
    paging: [],
    totalPages: 0,
    pageAccessList: [],
    totalRecordsText: '',
    startIndex: 0,
    endIndex: 0,
    totalRecords: 0,
    pageNumber: 1,
    pageSize: 5,
  }

  gridFilter: any = {
    Filter: this.tableObject.filter,
    PageNumber: 0,
    PageSize: 0
  }

  pageChangeEvent($eve: any) {
    this.fillFilterObject();
  }
  pageSizeChangeEvent($eve: any) {
    this.fillFilterObject();
  }

  fillFilterObject() {
    let index = this.tableObject.filter.findIndex(((obj: { colId: string; }) => obj.colId.toLowerCase() == "customerid"));
    if (index > -1) { this.tableObject.filter[index].value = 1; }
    if (this.tableObject.filter.length <= 0) {
      var objFilter = new FilterDetails();
      objFilter.colId = "customerid"; objFilter.name = "customerid"; objFilter.value = ""; objFilter.type = "num";
      this.tableObject.filter.push(objFilter);
    }
    this.getCustomerData();
  }

  getCustomerData(): void {
    if (this.gridConfig.isServerSidePagination == false) { this.gridFilter.Filter = this.tableObject.filter; this.gridFilter.PageNumber = 0; this.gridFilter.PageSize = 0; }
    else {
      this.gridFilter.Filter = this.tableObject.filter;
      this.gridFilter.PageNumber = this.tableObject.pageNumber;
      this.gridFilter.PageSize = this.tableObject.pageSize;
    }

    this.customerService.getAllCustomers(this.gridFilter)
      .subscribe({
        next: (data: any) => {
          if (data.success == true) {
            // console.log("category Data: " + JSON.stringify(data));
            this.tableObject.totalItems = data.result.totalItems;
            this.tableObject.columns = data.result.columns;
            this.tableObject.filter = data.result.filter;
            this.tableObject.data = data.result.data;
            this.allCustomer = data.result.data;
            this.tableObject.rows = [...this.allCustomer];
            this.child?.GridChanges();
            this.prepareTilePagination();
            this.cdr.detectChanges();
          }
        },
        error: (err: any) => { console.log(err); }
      });
  }

  AddNewCustomer() { this.router.navigate(['customer/customeraddedit/0']); }

  setViewMode(mode: 'list' | 'tiles'): void {
    this.viewMode = mode;
    if (this.viewMode === 'tiles') {
      this.prepareTilePagination();
    }
  }

  customerDelete(obj: any) {
    this.customer = obj;
    this.selectedCustomerId = this.customer.customerId;
    this.popupConfig = {
      popupFunctionalityType: 'delete',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'small',
      headerText: 'Delete Customer',
      buttons: [
        {
          label: 'Yes, Delete',
          cssClass: 'bg-primary-500 hover:bg-primary-700 text-white',
          action: 'custom',
          emitEventName: 'confirmDeleteCustomer'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'custom',
          emitEventName: 'cancelDeleteCustomer'
        }
      ]
    };
  }
  closePopup(): void {
    this.initForm();
  }

  onCustomerDelete() {
    this.initForm();
  }

  onCustomerAddEdited() {
    this.initForm();
  }

  handlePopupAction(event: string) {
    switch (event) {
      case 'confirmDeleteCustomer':
        this.deleteCustomer?.confirmDelete();
        break;

      case 'cancelDeleteCustomer':
        this.deleteCustomer?.cancelDelete();
        break;

      case 'addEditCustomer':
        this.addeditCustomer?.submitForm();
        break;

      case 'cancelAddEditCustomer':
        this.addeditCustomer?.cancelAddEdit();
        break;
    }
  }

  addEditCustomer(customerId: number): void {
    this.selectedCustomerId = customerId;
    this.popupConfig = {
      popupFunctionalityType: 'addeditCustomer',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'medium',
      headerText: this.selectedCustomerId > 0 ? 'Update Customer' : 'Add Customer',
      buttons: [
        {
          label: this.selectedCustomerId > 0 ? 'Update' : 'Add',
          cssClass: 'bg-primary-500 hover:bg-primary-700 text-white',
          action: 'custom',
          emitEventName: 'addEditCustomer'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'custom',
          emitEventName: 'cancelAddEditCustomer'
        }
      ]
    };
  }

  getStatusClass(status: string) {
    if (status === 'active') return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  }

  getCustomerInitial(data: any): string {
    return (data?.firstName || 'C').charAt(0);
  }

  private prepareTilePagination(): void {
    setPaginationLogic(this.tableObject);
  }
}

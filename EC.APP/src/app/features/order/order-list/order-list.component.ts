import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CmTableComponent } from '../../../shared/table/cm-table/cm-table.component';
import { FilterDetails, GridConfig, SortModel } from '../../../shared/table/table.model';
import { IOrder } from '../../../models/order.model';
import { OrderService } from '../../../services/order.service';
import { Router, RouterModule } from '@angular/router';
import { PopupConfig } from '../../../models/popupconfig';
import { CMTableDirective } from '../../../shared/table/cm-table.directive';
import { Popup } from '../../../shared/popup/popup';
import { OrderDelete } from '../order-delete/order-delete';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { OrderAddEditComponent } from '../order-add-edit/order-add-edit.component';
import { OrderDetailsComponent } from '../order-details/order-details.component';
import { CmTablePaginationComponent } from '../../../shared/table/cm-table-pagination/cm-table-pagination.component';
import { setPaginationLogic } from '../../../shared/table/table-utility';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, CmTableComponent, CMTableDirective, RouterModule, OrderDelete, Popup, CmTablePaginationComponent, FormsModule, DatePipe, OrderAddEditComponent, OrderDetailsComponent],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnInit {
  @ViewChild(CmTableComponent) child?: CmTableComponent;
  @ViewChild('deleteOrder') deleteOrder?: OrderDelete;
  @ViewChild('addeditOrder') addeditOrder?: OrderAddEditComponent;
  @ViewChild('viewOrder') viewOrder?: OrderDetailsComponent;
  popupConfig: PopupConfig = new PopupConfig();
  gridConfig: GridConfig = new GridConfig();
  order!: IOrder;
  searchText = '';
  allOrder: any[] = []; // original data
  selectedOrderId: number = 0;
  viewMode: 'list' | 'tiles' = 'list';
  constructor(private orderService: OrderService, private router: Router, private cdr: ChangeDetectorRef) {
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
    pageSize: 10,
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
    let index = this.tableObject.filter.findIndex(((obj: { colId: string; }) => obj.colId.toLowerCase() == "orderid"));
    if (index > -1) { this.tableObject.filter[index].value = ""; }
    if (this.tableObject.filter.length <= 0) {
      var objFilter = new FilterDetails();
      objFilter.colId = "orderid"; objFilter.name = "orderid"; objFilter.value = ""; objFilter.type = "num";
      this.tableObject.filter.push(objFilter);
    }
    this.getOrderData();
  }

  getOrderData(): void {
    if (this.gridConfig.isServerSidePagination == false) { this.gridFilter.Filter = this.tableObject.filter; this.gridFilter.PageNumber = 0; this.gridFilter.PageSize = 0; }
    else {
      this.gridFilter.Filter = this.tableObject.filter;
      this.gridFilter.PageNumber = this.tableObject.pageNumber;
      this.gridFilter.PageSize = this.tableObject.pageSize;
    }

    this.orderService.getAllOrders(this.gridFilter)
      .subscribe({
        next: (data: any) => {
          if (data.success == true) {
            // console.log("category Data: " + JSON.stringify(data));
            this.tableObject.totalItems = data.result.totalItems;
            this.tableObject.columns = data.result.columns;
            this.tableObject.filter = data.result.filter;
            this.tableObject.data = data.result.data;
            this.allOrder = data.result.data;
            this.tableObject.rows = [...this.allOrder];
            this.child?.GridChanges();
            this.prepareTilePagination();
            this.cdr.detectChanges();
          }
        },
        error: (err: any) => { console.log(err); }
      });
  }

  AddNewOrder() { this.router.navigate(['order/orderaddedit/0']); }

  setViewMode(mode: 'list' | 'tiles'): void {
    this.viewMode = mode;
    if (this.viewMode === 'tiles') {
      this.prepareTilePagination();
    }
  }

  addEditOrder(orderId: number): void {
    this.selectedOrderId = orderId;
    this.popupConfig = {
      popupFunctionalityType: 'addeditOrder',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'large',
      headerText: this.selectedOrderId > 0 ? 'Update Order' : 'Add Order',
      buttons: [
        {
          label: this.selectedOrderId > 0 ? 'Update' : 'Add',
          cssClass: 'bg-primary-500 hover:bg-primary-700 text-white',
          action: 'custom',
          emitEventName: 'addEditOrder'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'custom',
          emitEventName: 'cancelAddEditOrder'
        }
      ]
    };
  }

  viewOrders(orderId: number): void {
    this.selectedOrderId = orderId;
    this.popupConfig = {
      popupFunctionalityType: 'viewOrder',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'large',
      headerText: 'View Order',
      buttons: [

      ]
    };
  }


  orderDelete(obj: any) {
    this.popupConfig.isShowPopup = true;
    this.order = obj;
    this.popupConfig = {
      popupFunctionalityType: 'delete',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'small',
      headerText: 'Delete Order',
      buttons: [
        {
          label: 'Yes, Delete',
          cssClass: 'bg-primary-500 hover:bg-primary-700 text-white',
          action: 'custom',
          emitEventName: 'confirmDeleteOrder'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'custom',
          emitEventName: 'cancelDeleteOrder'
        }
      ]
    };
  }

  closePopup(): void {
    this.initForm();
  }

  onOrderDelete() {
    this.initForm();
  }

  onOrderAddEdited() {
    this.initForm();
  }

  handlePopupAction(event: string) {
    switch (event) {
      case 'confirmDeleteOrder':
        this.deleteOrder?.confirmDelete();
        break;

      case 'cancelDeleteCustomer':
        this.deleteOrder?.cancelDelete();
        break;

      case 'addEditOrder':
        this.addeditOrder?.submitForm();
        break;

      case 'cancelAddEditOrder':
        this.addeditOrder?.cancel();
        break;
    }
  }

  onSearchChange() {
    const term = this.searchText?.toLowerCase().trim();

    if (!term) {
      this.tableObject.rows = [...this.allOrder];
      if (this.viewMode === 'tiles') {
        this.prepareTilePagination();
      }
      return;
    }

    this.tableObject.rows = this.allOrder.filter(order =>
      order.orderNumber?.toLowerCase().includes(term) ||
      order.orderId?.toString().includes(term)
    );

    if (this.viewMode === 'tiles') {
      this.prepareTilePagination();
    }
  }

  getStatusClass(status: string) {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ';
    switch (status) {
      case 'Paid': return base + 'bg-green-100 text-green-800';
      case 'Pending': return base + 'bg-yellow-100 text-yellow-800';
      case 'Shipped': return base + 'bg-blue-100 text-blue-800';
      case 'Delivered': return base + 'bg-purple-100 text-purple-800';
      case 'Cancelled': return base + 'bg-red-100 text-red-800';
      case 'Refunded': return base + 'bg-gray-100 text-gray-800';
      default: return base + 'bg-gray-100 text-gray-800';
    }
  }

  private prepareTilePagination(): void {
    setPaginationLogic(this.tableObject);
  }

}

import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { IProduct } from '../../../models/product.model';
import { CmTableComponent } from '../../../shared/table/cm-table/cm-table.component';
import { FilterDetails, GridConfig, SortModel } from '../../../shared/table/table.model';
import { ProductService } from '../../../services/product.service';
import { Router, RouterModule } from '@angular/router';
import { ProductDeleteComponent } from '../product-delete/product-delete.component';
import { Popup } from '../../../shared/popup/popup';
import { PopupConfig } from '../../../models/popupconfig';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../../services/category.service';
import { ICategory } from '../../../models/category.model';
import { CMTableDirective } from '../../../shared/table/cm-table.directive';
import { FormsModule } from '@angular/forms';
import { AddEditProductComponent } from '../add-edit-product/add-edit-product.component';
import { CmTablePaginationComponent } from '../../../shared/table/cm-table-pagination/cm-table-pagination.component';
import { setPaginationLogic } from '../../../shared/table/table-utility';
import { ITenant } from '../../../models/tenant';
import { TenantService } from '../../../services/tenant.service';
import { TokenService } from '../../../services/token.service';


@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductDeleteComponent, AddEditProductComponent, Popup, CmTableComponent, CMTableDirective, CmTablePaginationComponent, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  tenantlist: ITenant[] = []; selectedTenantId: string = '';
  @ViewChild(CmTableComponent) child?: CmTableComponent;
  @ViewChild('deleteProduct') deleteProduct?: ProductDeleteComponent;
  @ViewChild('addeditProduct') addeditProduct?: AddEditProductComponent;
  popupConfig: PopupConfig = new PopupConfig();
  gridConfig: GridConfig = new GridConfig();
  product!: IProduct;
  selectedProductId: number = 0;
  showFilter: boolean = false;
  categoryList: ICategory[] = [];
  searchText = '';
  allProducts: any[] = []; // original data
  viewMode: 'list' | 'tiles' = 'list';
  readonly defaultProductImageUrl = '/images/logo/logo-icon.svg';

  constructor(private productService: ProductService, private router: Router, private cdr: ChangeDetectorRef, private categoryService: CategoryService, private tenantService: TenantService, private tokenService: TokenService) {
    this.tableObject.gridConfig = this.gridConfig;
  }
  ngOnInit(): void {
    this.loadTenant();
  }
  initForm() {
    this.popupConfig.isShowPopup = false;
    this.fillFilterObject();

  }
  loadTenant() {
    this.tenantService.getTenants().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.tenantlist = res.result;
          this.selectedTenantId = this.tokenService.getTenantId().toString();
          this.initForm();
        }
      },
      error: (err: any) => { console.error('Error fetching tenants:', err); }
    });
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
    let index = this.tableObject.filter.findIndex(((obj: { colId: string; }) => obj.colId.toLowerCase() == "userid"));
    if (index > -1) { this.tableObject.filter[index].value = 1; }
    if (this.tableObject.filter.length <= 0) {
      var objFilter = new FilterDetails();
      objFilter.colId = "userid"; objFilter.name = "userid"; objFilter.value = ""; objFilter.type = "num";
      this.tableObject.filter.push(objFilter);
    }
    if (this.tableObject.filter.length <= 0) {
      var objFilter = new FilterDetails();
      objFilter.colId = 'tenantid';
      objFilter.name = 'tenantid';
      objFilter.value = this.selectedTenantId;
      objFilter.type = 'cs';
      this.tableObject.filter.push(objFilter);
    }
    this.getProductData();
  }

  getProductData(): void {
    if (this.gridConfig.isServerSidePagination == false) { this.gridFilter.Filter = this.tableObject.filter; this.gridFilter.PageNumber = 0; this.gridFilter.PageSize = 0; }
    else {
      this.gridFilter.Filter = this.tableObject.filter;
      this.gridFilter.PageNumber = this.tableObject.pageNumber;
      this.gridFilter.PageSize = this.tableObject.pageSize;
    }

    this.productService.getAllProducts(this.gridFilter)
      .subscribe({
        next: (data: any) => {
          if (data.success == true) {
            // console.log("category Data: " + JSON.stringify(data));
            this.tableObject.totalItems = data.result.totalItems;
            this.tableObject.columns = data.result.columns;
            this.tableObject.filter = data.result.filter;
            this.tableObject.data = data.result.data;
            this.tableObject.rows = data.result.data;
            this.allProducts = data.result.data;
            this.tableObject.rows = [...this.allProducts];
            this.child?.GridChanges();
            this.prepareTilePagination();
            this.getCategoryData();
            this.cdr.detectChanges();
          }
        },
        error: (err: any) => { console.log(err); }
      });
  }

  AddEditProduct(productId: number) {
    this.selectedProductId = productId;
    this.popupConfig = {
      popupFunctionalityType: 'addeditProduct',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'large',
      headerText: productId > 0 ? 'Edit Product' : 'Add Product',
      buttons: [
        {
          label: 'Save',
          cssClass: 'bg-primary-500 hover:bg-primary-700 text-white',
          action: 'custom',
          emitEventName: 'confirmSaveProduct'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'custom',
          emitEventName: 'cancelSaveProduct'
        }
      ]
    };
    this.addeditProduct?.initPage();
  }

  EditProduct(productId: number) { this.router.navigate(['product/productaddedit/' + productId]); }

  setViewMode(mode: 'list' | 'tiles'): void {
    this.viewMode = mode;
    if (this.viewMode === 'tiles') {
      this.prepareTilePagination();
    }
  }

  productDelete(product: number | any) {
    this.selectedProductId = (typeof product === 'number' ? product : product?.productId) || 0;
    this.popupConfig = {
      popupFunctionalityType: 'delete',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'small',
      headerText: 'Delete Product',
      buttons: [
        {
          label: 'Yes, Delete',
          cssClass: 'bg-primary-500 hover:bg-primary-700 text-white',
          action: 'custom',
          emitEventName: 'confirmDeleteProduct'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black text-black',
          action: 'custom',
          emitEventName: 'cancelDeleteProduct'
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

  onProductAddEdited() {
    this.initForm();
  }


  handlePopupAction(event: string) {
    switch (event) {
      case 'confirmDeleteProduct':
        this.deleteProduct?.confirmDelete();
        break;

      case 'cancelDeleteProduct':
        this.deleteProduct?.cancelDelete();
        break;

      case 'confirmSaveProduct':
        this.addeditProduct?.submitForm();
        break;

      case 'cancelSaveProduct':
        //this.addeditProduct?.cancelDelete();
        break;

    }
  }

  getCategoryData(): void {
    this.gridFilter.Filter = [];
    this.gridFilter.PageNumber = 1;
    this.gridFilter.PageSize = 100;

    this.categoryService.getAllCategory(this.gridFilter)
      .subscribe({
        next: (data: any) => {
          if (data.success == true) {
            this.categoryList = data.result.data;
            this.cdr.detectChanges();
          }
        },
        error: (err: any) => { console.log(err); }
      });
  }

  getStatusClass(status: string) {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ';
    switch (status.toLocaleLowerCase()) {
      case 'active': return base + 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900';
      case 'draft': return base + 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
      case 'archived': return base + 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900';
      default: return base + 'bg-gray-100 text-gray-800';
    }
  }

  getStatusDotClass(status: string) {
    switch (status.toLocaleLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'draft': return 'bg-gray-400';
      case 'archived': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  }

  onCategoryChange(event: Event) {
    const selectedCategoryId = (event.target as HTMLSelectElement).value;
    this.tableObject.filter = [];
    var objFilter = new FilterDetails();
    objFilter.colId = "categoryid"; objFilter.name = "categoryid"; objFilter.value = selectedCategoryId; objFilter.type = "cs";
    this.tableObject.filter.push(objFilter);
    this.fillFilterObject();
  }

  onStatusChange(event: Event) {
    const selectedStatus = (event.target as HTMLSelectElement).value;
    this.tableObject.filter = [];
    var objFilter = new FilterDetails();
    objFilter.colId = "status"; objFilter.name = "status"; objFilter.value = selectedStatus; objFilter.type = "cs";
    this.tableObject.filter.push(objFilter);
    this.fillFilterObject();
  }

  onSearchChange() {
    const term = this.searchText
      ?.toLowerCase()
      .trim();

    if (!term) {
      this.tableObject.rows = [...this.allProducts];
      if (this.viewMode === 'tiles') {
        this.prepareTilePagination();
      }
      return;
    }

    this.tableObject.rows = this.allProducts.filter(product =>
      product.productName?.toLowerCase().includes(term) ||
      product.productId?.toString().includes(term)
    );

    if (this.viewMode === 'tiles') {
      this.prepareTilePagination();
    }
  }

  onProductImageError(event: Event): void {
    const element = event.target as HTMLImageElement | null;
    if (!element) {
      return;
    }
    element.src = this.defaultProductImageUrl;
  }

  private prepareTilePagination(): void {
    setPaginationLogic(this.tableObject);
  }

  getStockLabel(quantity: number): string {
    if (quantity <= 0) {
      return 'Out of stock';
    }
    if (quantity < 10) {
      return 'Low stock';
    }
    return 'In stock';
  }

  getStockToneClass(quantity: number): string {
    if (quantity <= 0) {
      return 'stock-tone-out';
    }
    if (quantity < 10) {
      return 'stock-tone-low';
    }
    return 'stock-tone-in';
  }

}

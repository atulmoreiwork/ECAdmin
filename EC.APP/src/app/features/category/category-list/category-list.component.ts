import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CmTableComponent } from '../../../shared/table/cm-table/cm-table.component';
import { FilterDetails, GridConfig, SortModel } from '../../../shared/table/table.model';
import { CategoryService } from '../../../services/category.service';
import { Router, RouterModule } from '@angular/router';
import { ICategory } from '../../../models/category.model';
import { PopupConfig } from '../../../models/popupconfig';
import { CategoryDeleteComponent } from '../category-delete/category-delete.component';
import { CMTableDirective } from '../../../shared/table/cm-table.directive';
import { Popup } from '../../../shared/popup/popup';
import { CategoryAddEditComponent } from '../category-add-edit/category-add-edit.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CmTablePaginationComponent } from '../../../shared/table/cm-table-pagination/cm-table-pagination.component';
import { setPaginationLogic } from '../../../shared/table/table-utility';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, CmTableComponent, CMTableDirective, RouterModule, CategoryDeleteComponent, Popup, CategoryAddEditComponent, CmTablePaginationComponent, FormsModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css'
})
export class CategoryListComponent implements OnInit {
  @ViewChild(CmTableComponent) child?: CmTableComponent;
  @ViewChild('deleteCategory') deleteCategory?: CategoryDeleteComponent;
  @ViewChild('addeditCategory') addeditCategory?: CategoryAddEditComponent;
  popupConfig: PopupConfig = new PopupConfig();
  gridConfig: GridConfig = new GridConfig();
  category!: ICategory;
  selectedCategoryId: number = 0;
  searchText = '';
  allCategory: any[] = []; // original data
  viewMode: 'list' | 'tiles' = 'list';

  constructor(private categoryService: CategoryService, private router: Router, private cdr: ChangeDetectorRef) {
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
    let index = this.tableObject.filter.findIndex(((obj: { colId: string; }) => obj.colId.toLowerCase() == "categoryid"));
    if (index > -1) { this.tableObject.filter[index].value = ""; }
    if (this.tableObject.filter.length <= 0) {
      var objFilter = new FilterDetails();
      objFilter.colId = "categoryid"; objFilter.name = "categoryid"; objFilter.value = ""; objFilter.type = "num";
      this.tableObject.filter.push(objFilter);
    }
    this.getCategoryData();
  }

  getCategoryData(): void {
    if (this.gridConfig.isServerSidePagination == false) { this.gridFilter.Filter = this.tableObject.filter; this.gridFilter.PageNumber = 0; this.gridFilter.PageSize = 0; }
    else {
      this.gridFilter.Filter = this.tableObject.filter;
      this.gridFilter.PageNumber = parseInt(this.tableObject.pageNumber);
      this.gridFilter.PageSize = parseInt(this.tableObject.pageSize);
    }

    this.categoryService.getAllCategory(this.gridFilter)
      .subscribe({
        next: (data: any) => {
          if (data.success == true) {
            // console.log("category Data: " + JSON.stringify(data));
            this.tableObject.totalItems = data.result.totalItems;
            this.tableObject.columns = data.result.columns;
            this.tableObject.filter = data.result.filter;
            this.tableObject.data = data.result.data;
            this.tableObject.rows = data.result.data;
            this.allCategory = data.result.data;
            this.tableObject.rows = [...this.allCategory];
            this.child?.GridChanges();
            this.prepareTilePagination();
            this.cdr.detectChanges();
          }
        },
        error: (err: any) => { console.log(err); }
      });
  }

  AddNewCategory() { this.router.navigate(['category/categoryaddedit/0']); }

  setViewMode(mode: 'list' | 'tiles'): void {
    this.viewMode = mode;
    if (this.viewMode === 'tiles') {
      this.prepareTilePagination();
    }
  }

  addEditCategory(categoryId: number): void {

    this.selectedCategoryId = categoryId;
    this.popupConfig = {
      popupFunctionalityType: 'addeditCategory',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'medium',
      headerText: this.selectedCategoryId > 0 ? 'Update Category' : 'Add Category',
      buttons: [
        {
          label: this.selectedCategoryId > 0 ? 'Update' : 'Add',
          cssClass: 'bg-primary-500 hover:bg-primary-700 text-white',
          action: 'custom',
          emitEventName: 'addEditCategory'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'custom',
          emitEventName: 'cancelAddEditCategory'
        }
      ]
    };
    this.addeditCategory?.initForm();
  }

  categoryDelete(categoryId: number) {
    this.selectedCategoryId = categoryId;
    this.popupConfig = {
      popupFunctionalityType: 'delete',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'small',
      headerText: 'Delete Category',
      buttons: [
        {
          label: 'Yes, Delete',
          cssClass: 'bg-primary-500 hover:bg-primary-700 text-white',
          action: 'custom',
          emitEventName: 'confirmDeleteCategory'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'custom',
          emitEventName: 'cancelDeleteCategory'
        }
      ]
    };
  }

  closePopup(): void {
    this.initForm();
  }

  onCategoryDelete() {
    this.initForm();
  }

  onCategoryAddEdited() {
    this.initForm();
  }

  handlePopupAction(event: string) {
    switch (event) {
      case 'confirmDeleteCategory':
        this.deleteCategory?.confirmDelete();
        break;

      case 'cancelDeleteCategory':
        this.deleteCategory?.cancelDelete();
        break;

      case 'addEditCategory':
        this.addeditCategory?.submitForm();
        break;

      case 'cancelAddEditCategory':
        this.addeditCategory?.cancelAddEdit();
        break;
    }
  }

  getStatusClass(status: string) {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ';
    switch (status) {
      case 'active': return base + 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900';
      case 'draft': return base + 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
      case 'archived': return base + 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900';
      default: return base + 'bg-gray-100 text-gray-800';
    }
  }

  getStatusDotClass(status: string) {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'draft': return 'bg-gray-400';
      case 'archived': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  }

  onSearchChange() {
    const term = this.searchText?.toLowerCase().trim();

    if (!term) {
      this.tableObject.rows = [...this.allCategory];
      if (this.viewMode === 'tiles') {
        this.prepareTilePagination();
      }
      return;
    }

    this.tableObject.rows = this.allCategory.filter(category =>
      category.categoryName?.toLowerCase().includes(term) ||
      category.categoryId?.toString().includes(term)
    );

    if (this.viewMode === 'tiles') {
      this.prepareTilePagination();
    }
  }

  private prepareTilePagination(): void {
    setPaginationLogic(this.tableObject);
  }
}

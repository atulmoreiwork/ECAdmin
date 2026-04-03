import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../../services/users.service';
import { IUsers } from '../../../models/admin-users';
import { CmTableComponent } from '../../../shared/table/cm-table/cm-table.component';
import { FilterDetails, GridConfig, SortModel } from '../../../shared/table/table.model';
import { PopupConfig } from '../../../models/popupconfig';
import { Popup } from '../../../shared/popup/popup';
import { UserDeleteComponent } from './user-delete.component';
import { CMTableDirective } from '../../../shared/table/cm-table.directive';
import { CommonModule } from '@angular/common';
import { UsersAddEditComponent } from './users-add-edit.component';
import { CmTablePaginationComponent } from '../../../shared/table/cm-table-pagination/cm-table-pagination.component';
import { setPaginationLogic } from '../../../shared/table/table-utility';
@Component({
  standalone: true,
  imports: [CmTableComponent, CMTableDirective, RouterModule, UserDeleteComponent, Popup, CommonModule, UsersAddEditComponent, CmTablePaginationComponent],
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
  @ViewChild(CmTableComponent) child?: CmTableComponent;
  @ViewChild('deleteUser') deleteUser?: UserDeleteComponent;
  @ViewChild('addEditUser') addEditUser?: UsersAddEditComponent;
  popupConfig: PopupConfig = new PopupConfig();
  gridConfig: GridConfig = new GridConfig();
  user!: IUsers;
  selectedUserId: number = 0;
  allUsers: any[] = [];
  viewMode: 'list' | 'tiles' = 'list';
  constructor(private usersService: UsersService, private router: Router, private cdr: ChangeDetectorRef) {
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
    let index = this.tableObject.filter.findIndex(((obj: { colId: string; }) => obj.colId.toLowerCase() == "userid"));
    if (index > -1) { this.tableObject.filter[index].value = ""; }
    if (this.tableObject.filter.length <= 0) {
      var objFilter = new FilterDetails();
      objFilter.colId = "userid"; objFilter.name = "userid"; objFilter.value = ""; objFilter.type = "num";
      this.tableObject.filter.push(objFilter);
    }
    this.getUsersData();
  }

  getUsersData(): void {
    if (this.gridConfig.isServerSidePagination == false) { this.gridFilter.Filter = this.tableObject.filter; this.gridFilter.PageNumber = 0; this.gridFilter.PageSize = 0; }
    else {
      this.gridFilter.Filter = this.tableObject.filter;
      this.gridFilter.PageNumber = parseInt(this.tableObject.pageNumber);
      this.gridFilter.PageSize = parseInt(this.tableObject.pageSize);
    }

    this.usersService.getUsers(this.gridFilter)
      .subscribe({
        next: (data: any) => {
          if (data.success == true) {
            // console.log("Users Data: " + JSON.stringify(data));
            this.tableObject.totalItems = data.result.totalItems;
            this.tableObject.columns = data.result.columns;
            this.tableObject.filter = data.result.filter;
            this.tableObject.data = data.result.data;
            this.allUsers = data.result.data;
            this.tableObject.rows = [...this.allUsers];
            this.child?.GridChanges();
            this.prepareTilePagination();
            this.cdr.detectChanges();
          }
        },
        error: (err: any) => { console.log(err); }
      });
  }

  AddNewUser() { this.router.navigate(['user/useraddedit/0']); }

  setViewMode(mode: 'list' | 'tiles'): void {
    this.viewMode = mode;
    if (this.viewMode === 'tiles') {
      this.prepareTilePagination();
    }
  }


  userDelete(userId: number) {
    this.selectedUserId = userId;
    this.popupConfig = {
      popupFunctionalityType: 'delete',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'small',
      headerText: 'Delete User',
      buttons: [
        {
          label: 'Yes, Delete',
          cssClass: 'bg-primary-500 hover:bg-primary-700 text-white',
          action: 'custom',
          emitEventName: 'confirmDeleteUser'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'custom',
          emitEventName: 'cancelDeleteUser'
        }
      ]
    };
  }

  addUpdateUser(userId: number): void {
    this.selectedUserId = userId;
    this.popupConfig = {
      popupFunctionalityType: 'addeditUser',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'medium',
      headerText: this.selectedUserId > 0 ? 'Update User' : 'Add User',
      buttons: [
        {
          label: this.selectedUserId > 0 ? 'Update' : 'Add',
          cssClass: 'bg-primary-500 hover:bg-primary-700 text-white',
          action: 'custom',
          emitEventName: 'addEditUser'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'custom',
          emitEventName: 'cancelAddEditUser'
        }
      ]
    };
    this.addEditUser?.initForm();
  }

  onUserAddEdited() {
    this.initForm();
  }
  closePopup(): void {
    this.initForm();
  }

  onUserDelete() {
    this.initForm();
  }

  handlePopupAction(event: string) {
    switch (event) {
      case 'confirmDeleteUser':
        this.deleteUser?.confirmDelete();
        break;

      case 'cancelDeleteUser':
        this.deleteUser?.cancelDelete();
        break;

      case 'addEditUser':
        this.addEditUser?.submitForm();
        break;

      case 'cancelAddEditUser':
        this.addEditUser?.cancelAddEdit();
        break;
    }
  }

  getUserName(data: any): string {
    const fullName = `${data?.firstName || ''} ${data?.lastName || ''}`.trim();
    return data?.userName || fullName || 'User';
  }

  getUserInitial(data: any): string {
    return this.getUserName(data).charAt(0);
  }

  getUserStatusClass(status: string): string {
    if ((status || '').toLowerCase() === 'active') {
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    }
    return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
  }

  private prepareTilePagination(): void {
    setPaginationLogic(this.tableObject);
  }
}

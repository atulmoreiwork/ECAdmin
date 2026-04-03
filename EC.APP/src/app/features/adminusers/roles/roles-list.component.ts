import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CmTableComponent } from '../../../shared/table/cm-table/cm-table.component';
import { FilterDetails, GridConfig, SortModel } from '../../../shared/table/table.model';
import { UsersService } from '../../../services/users.service';
import { IRole } from '../../../models/admin-users';
import { PopupConfig } from '../../../models/popupconfig';
import { RoleDeleteComponent } from './role-delete.component';

import { CMTableDirective } from '../../../shared/table/cm-table.directive';
import { Popup } from '../../../shared/popup/popup';
import { CommonModule } from '@angular/common';
import { RolesAddEditComponent } from './roles-add-edit.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, RoleDeleteComponent, RolesAddEditComponent, Popup],
  selector: 'app-roles-list',
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.css']
})
export class RolesListComponent implements OnInit {
  @ViewChild(CmTableComponent) child?: CmTableComponent;
  @ViewChild('deleteRole') deleteRole?: RoleDeleteComponent;
  @ViewChild('addeditRole') addeditRole?: RolesAddEditComponent;
  popupConfig: PopupConfig = new PopupConfig();
  gridConfig: GridConfig = new GridConfig();
  role!: IRole;
  selectedRoleId: number = 0;
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
    let index = this.tableObject.filter.findIndex(((obj: { colId: string; }) => obj.colId.toLowerCase() == "roleid"));
    if (index > -1) { this.tableObject.filter[index].value = ""; }
    if (this.tableObject.filter.length <= 0) {
      var objFilter = new FilterDetails();
      objFilter.colId = "roleid"; objFilter.name = "roleid"; objFilter.value = ""; objFilter.type = "num";
      this.tableObject.filter.push(objFilter);
    }
    this.getRolesData();
  }

  getRolesData(): void {
    if (this.gridConfig.isServerSidePagination == false) { this.gridFilter.Filter = this.tableObject.filter; this.gridFilter.PageNumber = 0; this.gridFilter.PageSize = 0; }
    else {
      this.gridFilter.Filter = this.tableObject.filter;
      this.gridFilter.PageNumber = parseInt(this.tableObject.pageNumber);
      this.gridFilter.PageSize = parseInt(this.tableObject.pageSize);
    }

    this.usersService.getAllRoles(this.gridFilter)
      .subscribe({
        next: (data: any) => {
          if (data.success == true) {
            // console.log("category Data: " + JSON.stringify(data));
            this.tableObject.totalItems = data.result.totalItems;
            this.tableObject.columns = data.result.columns;
            this.tableObject.filter = data.result.filter;
            this.tableObject.data = data.result.data;
            this.tableObject.rows = data.result.data;
            this.child?.GridChanges();
            this.cdr.detectChanges();
          }
        },
        error: (err: any) => { console.log(err); }
      });
  }

  roleDelete(roleId: number) {
    this.selectedRoleId = roleId;
    this.popupConfig = {
      popupFunctionalityType: 'delete',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'small',
      headerText: 'Delete Role',
      buttons: [
        {
          label: 'Yes, Delete',
          cssClass: 'bg-primary-500 hover:bg-primary-700 text-white',
          action: 'custom',
          emitEventName: 'confirmDeleteRole'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'custom',
          emitEventName: 'cancelDeleteRole'
        }
      ]
    };
  }

  addEditRole(roleId: number): void {
    this.selectedRoleId = roleId;
    this.popupConfig = {
      popupFunctionalityType: 'addeditRole',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'medium',
      headerText: this.selectedRoleId > 0 ? 'Update Role' : 'Add Role',
      buttons: [
        {
          label: this.selectedRoleId > 0 ? 'Update' : 'Add',
          cssClass: 'bg-primary-500 hover:bg-primary-700 text-white',
          action: 'custom',
          emitEventName: 'addEditRole'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'custom',
          emitEventName: 'cancelAddEditRole'
        }
      ]
    };
  }

  onRoleAddEdited() {
    this.initForm();
  }

  closePopup(): void {
    this.initForm();
  }

  onRoleDelete() {
    this.initForm();
  }

  handlePopupAction(event: string) {
    switch (event) {
      case 'confirmDeleteRole':
        this.deleteRole?.confirmDelete();
        break;

      case 'cancelDeleteRole':
        this.deleteRole?.cancelDelete();
        break;

      case 'addEditRole':
        this.addeditRole?.submitForm();
        break;

      case 'cancelAddEditRole':
        this.addeditRole?.cancelAddEdit();
        break;
    }
  }
}

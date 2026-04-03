import { AfterContentInit, Component, ContentChildren, EventEmitter, Input, OnInit, Output, QueryList, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { filterFunction, setPaginationLogic, sort } from '../table-utility';
import {  InsertionDetails, SortModel } from '../table.model';
import { CmTablePaginationComponent } from '../cm-table-pagination/cm-table-pagination.component';
import { CommonModule } from '@angular/common';
import { CMTableDirective } from '../cm-table.directive';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CmTablePaginationComponent],
  selector: 'cm-table',
  templateUrl: './cm-table.component.html',
  styleUrls: ['./cm-table.component.css']
})
export class CmTableComponent implements OnInit, AfterContentInit {
  @ViewChild('insertionform') form?: NgForm;
  @ContentChildren(CMTableDirective) childs?: QueryList<CMTableDirective>; 

  @Input() public tableObject: any;
  @Input() public sortObj: any;
  @Input() public isShowInsertion: any = "N";
  @Output() pageChangeEvent: EventEmitter<any>  = new EventEmitter<any>();
  @Output() pageSizeChangeEvent: EventEmitter<any>  = new EventEmitter<any>();
  @Output() addButtonEvent: EventEmitter<any>  = new EventEmitter<any>();
  colmnName: string = '';  template: any = {};

  constructor() { }
  ngOnInit(): void  {  }
  ngAfterContentInit(): void {  
    this.childs?.forEach((e)=> {
       if(e.name){ this.template[e.name] = e.temp; }
     })
   }

  sortData(eve: any)
  {
    let columnName = eve.target.getAttribute("columnName");
    this.colmnName = columnName;
    let sortType = eve.target.getAttribute("sortType");
    this.sortObj.orderBy = this.sortObj.orderBy*-1;
    this.sortObj.columnName = columnName;
    this.sortObj.sortType = sortType;  
    //if(this.tableObject.gridConfig.isServerSidePagination == false){
      this.GridChanges();
    //}
  }

  filterData(eve: any)
  {
    let value = eve.target.value;
    let columnName = eve.target.getAttribute("columnName");
    const index = this.tableObject.filter.findIndex((x: { name: any; }) => x.name === columnName);    
    this.tableObject.filter[index].value = value;
    if(this.tableObject.gridConfig.isServerSidePagination == false){
     this.GridChanges();
    }
  } 
  GridChanges()
  {  
    this.tableObject.rows = this.tableObject.data;
    filterFunction(this.tableObject); 
    sort(this.tableObject.rows, this.sortObj.columnName,this.sortObj.orderBy,this.sortObj.sortType,this.sortObj.condition);
    this.tableObject = setPaginationLogic(this.tableObject); 
    this.isShowError = false;       
  }
  pChange(p: number)
  {
    this.tableObject.pageNumber = p;
    if(this.tableObject.gridConfig.isServerSidePagination){
      this.pageChangeEvent.next(p);
    }else {
      this.GridChanges();
    }
  }  
  pageSizeChange(p: number)
  {
    this.tableObject.pageNumber = 1;
    this.tableObject.pageSize = p;
    if(this.tableObject.gridConfig.isServerSidePagination){
      this.pageSizeChangeEvent.next(p);      
    } else{
      this.GridChanges();
    }
  }
  checkAllCheckBox(ev: any) { 
		this.tableObject.data.forEach((x: { isSelected: any; }) => x.isSelected = ev.target.checked);
	}

	isAllCheckBoxChecked() {
		return this.tableObject.data.every((p: { checked: any; }) => p.checked);
	}

  isShowError: boolean= false;
  addClick(){
    this.isShowError = true;  
    if(this.valdateField() == false){ this.isShowError = true; return; }
  
    // console.log("Form Details: "+ JSON.stringify(this.tableObject.columns));
    this.addButtonEvent.next(false); 
  }

  valdateField(){
    var result = true;
    for(var i= 0; i<this.tableObject.columns.length; i++){
      if(this.tableObject.columns[i].insertDetails.isDisplayOnGrid)
      {
        if(this.tableObject.columns[i].insertDetails.value == null || this.tableObject.columns[i].insertDetails.value == ''){
          result = false;
          break;
        }
      }
    }
    return result;
  }

}

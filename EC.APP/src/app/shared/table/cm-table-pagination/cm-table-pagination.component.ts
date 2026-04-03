import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'cm-table-pagination',
  templateUrl: './cm-table-pagination.component.html',
  styleUrls: ['./cm-table-pagination.component.css']
})
export class CmTablePaginationComponent implements OnInit {
  pageSizeList:Array<any> =  [10, 25, 50, 100, 200, 500, 1000];  
 
  @Input() tableObject: any; 
  @Output() pageChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() pageSizeChange: EventEmitter<number> = new EventEmitter<number>();
  constructor() { }
  ngOnInit(): void {  }
  
  paging(p: number){
    this.tableObject.pageNumber = p;
    this.pageChange.next(p);  
  }

  pgSizeChange(event: any): void {
    this.tableObject.pageNumber = 1;
    this.pageSizeChange.next(event.target.value);   
  }

  onChange(e: any) {
    var number = parseInt(e.target.value);
    this.tableObject.pageNumber = number;
    this.pageChange.next(number);    
  }
}

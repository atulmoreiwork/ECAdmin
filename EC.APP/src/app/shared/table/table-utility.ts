import { formatDate } from "@angular/common";
import { PageAccess } from "./table.model";

export function sort(list: Array<any>, columnName: any, orderBy: number, columnType: string, condition: any) {
  return list.sort((a, b) => {
    if (condition != null) {
      // console.log("I am in condition");
      return condition(a, b, orderBy);
    }
    if (columnType == 'num') {

      return parseInt(a[columnName]) > parseInt(b[columnName]) ? -1 * orderBy : 1 * orderBy;
    }
    else if (columnType == 'cs') {
      return a[columnName] > b[columnName] ? -1 * orderBy : 1 * orderBy;
    } else if (columnType == 'cin') {
      return a[columnName].toLowerCase() > b[columnName].toLowerCase() ? -1 * orderBy : 1 * orderBy;
    } else if (columnType == 'date') {
      var date1 = new Date(a[columnName]); var date2 = new Date(b[columnName]);
      return formatDate(date1, 'yyyy-MM-dd', 'en_US') > formatDate(date2, 'yyyy-MM-dd', 'en_US') ? -1 * orderBy : 1 * orderBy;
    } else {
      return a[columnName] > b[columnName] ? -1 * orderBy : 1 * orderBy;
    }
  });
}


export function filterFunction(tableObject: any) {
  let rows = tableObject.data;
  for (var i = 0; i < tableObject.filter.length; i++) {
    let val = tableObject.filter[i].value;
    let col = tableObject.filter[i].colId;
    rows = rows.filter((e: any) => {
      if (val == '') { return true; }
      if (tableObject.filter[i].type == 'cs') {
        return e[col] == val;
      }
      else if (tableObject.filter[i].type == 'num') {
        return parseInt(e[col]) == parseInt(val);
      }
      else if (tableObject.filter[i].type == 'numGte') {
        return parseInt(e[col]) >= parseInt(val);
      }
      else if (tableObject.filter[i].type == 'numLte') {
        return parseInt(e[col]) <= parseInt(val);
      }
      else if (tableObject.filter[i].type == 'cin') {
        return e[col].toLowerCase().indexOf(val.toLowerCase()) > -1;
      }
      else if (tableObject.filter[i].type == "dteGte") {
        let date1 = new Date(e[col]); let date2 = new Date(val);
        if (formatDate(date1, 'yyyy-MM-dd', 'en_US') >= formatDate(date2, 'yyyy-MM-dd', 'en_US')) { return true; } else { return false; }
      }
      else if (tableObject.filter[i].type == "dteLte") {
        let date1 = new Date(e[col]); let date2 = new Date(val);
        if (formatDate(date1, 'yyyy-MM-dd', 'en_US') <= formatDate(date2, 'yyyy-MM-dd', 'en_US')) { return true; } else { return false; }
      }
      else { return e[col] == val; }
    });
  }
  tableObject.rows = rows;
}

export function setPaginationLogic(tableObject: any) {
  tableObject.pageNumber = tableObject.pageNumber || 1;
  var defaultPageSize = 5;
  var totalRecord = tableObject.rows.length;
  if (tableObject.gridConfig.isServerSidePagination) { totalRecord = tableObject.totalItems; }
  var totalPages = Math.ceil(totalRecord / tableObject.pageSize);
  if (tableObject.pageNumber > totalPages) {
    tableObject.pageNumber = 1;
  }
  var startPage = 1; var endPage;
  if (totalPages <= defaultPageSize) {
    startPage = 1;
    endPage = totalPages;
  }
  else {
    if (tableObject.pageNumber <= 3) {
      startPage = 1;
      endPage = defaultPageSize;
    }
    else if (tableObject.pageNumber + 2 >= totalPages) {
      startPage = totalPages - 4;
      endPage = totalPages;
    }
    else {
      startPage = tableObject.pageNumber - 2;
      endPage = tableObject.pageNumber + 2;
    }
  }
  // calculate start and end item indexes
  var startIndex = (tableObject.pageNumber - 1) * tableObject.pageSize;
  var endIndex = Math.min(startIndex + parseInt(tableObject.pageSize) - 1, totalRecord - 1);
  var pages = [...Array((endPage + 1) - startPage).keys()].map(i => startPage + i);
  tableObject.paging = pages;
  tableObject.totalPages = totalPages;
  tableObject.totalRecordsText = totalRecord + " Records Found";
  tableObject.startIndex = startIndex + 1; // Display as 1-indexed
  tableObject.endIndex = endIndex + 1; // Display as 1-indexed
  tableObject.totalRecords = totalRecord;
  tableObject.pageAccessList = getAccessListFunction(tableObject);
  if (tableObject.gridConfig.isServerSidePagination == false) {
    tableObject.rows = tableObject.rows.slice(startIndex, endIndex + 1);
  }
  return tableObject;
}

export function getAccessListFunction(tableObject: any) {
  var totalRecord = tableObject.rows.length;
  if (tableObject.gridConfig.isServerSidePagination) { totalRecord = tableObject.totalItems; }
  var pageAccessList: PageAccess[] = [];
  var totalPages = Math.ceil(totalRecord / tableObject.pageSize);
  if (totalPages > 1) {
    for (var i = 1; i <= totalPages; i++) {
      var obj = new PageAccess();
      obj.key = i;
      obj.value = i.toString();
      pageAccessList.push(obj);
    }
  }
  else {
    var obj = new PageAccess();
    obj.key = 1;
    obj.value = "1";
    pageAccessList.push(obj);
  }
  return pageAccessList;
}

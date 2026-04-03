import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'excludeDeleted'
})
export class ExcludeDeletedPipe implements PipeTransform {
  transform(items: any[], isDeletedKey: string = 'isDeleted'): any[] {
    if (!items) return [];
    return items.filter(item => !item[isDeletedKey]);
  }
}

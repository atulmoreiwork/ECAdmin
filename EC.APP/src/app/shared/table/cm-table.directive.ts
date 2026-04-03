import { Directive, Input, TemplateRef } from "@angular/core";


@Directive({
  selector: '[cmTable]'
})
export class CMTableDirective {
  @Input() public name?: string;
  constructor(public temp: TemplateRef<any>) { }
}
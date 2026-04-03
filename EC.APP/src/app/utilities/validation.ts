import { AbstractControl, FormControl, ValidatorFn } from '@angular/forms';
export default class Validation {
  static match(controlName: string, checkControlName: string): ValidatorFn {
    return (controls: AbstractControl) => {
      const control = controls.get(controlName);
      const checkControl = controls.get(checkControlName);
      if (checkControl?.errors && !checkControl.errors['matching']) {
        return null;
      }
      if (control?.value !== checkControl?.value) {
        controls.get(checkControlName)?.setErrors({ matching: true });
        return { matching: true };
      } else {
        return null;
      }
    };
  }
}
export function requiredFileType( type: string ) {
  return function (control: FormControl) {
    const file = control.value;
    var result = true;
    if ( file ) {
      const extension = file.name.split('.')[1].toLowerCase();
      var str_spl = type.split(",");
      for (var num=0; num < str_spl.length; num++){
         if(str_spl[num].toLowerCase() == extension.toLowerCase())
         {
            result = false;
            break;
         }      
      }
      if (result === true ) {
        return {
          requiredFileType: true
        };
      }      
      return null;
    }
    return null;
  };
}
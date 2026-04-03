import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IRole, permission } from '../../../models/admin-users';
import { RoleService } from '../../../services/role.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports:[CommonModule, FormsModule, ReactiveFormsModule],
  selector: 'app-roles-add-edit',
  templateUrl: './roles-add-edit.component.html',
  styleUrls: ['./roles-add-edit.component.css']
})
export class RolesAddEditComponent implements OnInit {
  @Input() id!: number;
  @Output() close = new EventEmitter<void>();
  @Output() addedited = new EventEmitter<void>();
  regLabel: string =""; btnLabel: string ="Register";
  roles!: IRole; claimData: any; isFilterShown: boolean = false;
  headerName: string = ''; buttonName: string = '';  
  collegeId = ""; groupId = ""; roleId? = 0;
  PermissionData: permission[] = [];
  submitted = false; addRoleError = false;errorMessage ='';successMessage='';
  addeditRoleForm! : FormGroup;
  get f(): { [key: string]: AbstractControl } {return this.addeditRoleForm.controls; }
  constructor(public fb: FormBuilder, private router: Router, private acRoute: ActivatedRoute, private roleService: RoleService, private cdr:ChangeDetectorRef)
  {         

  }        
  ngOnInit(): void{
     this.initForm();
    // this.acRoute.params.subscribe((e) => {
    //   this.id = +e['id'];
    //   if(this.id > 0){this.headerName = "Edit Role"; this.buttonName = "Update";}
    //   else {this.headerName = "Add Roles";  this.buttonName = "Save";}
    //   this.roleService.getRole(this.id).subscribe((data : any) => {
    //     //console.log(data);
    //     if (data == undefined || data == null) {
    //       this.submitted =true
    //       this.addRoleError = true; 
    //       this.errorMessage += 'No role exists for ' + this.id;
    //       this.successMessage = '';
    //     } else {
    //       this.roles = data;
    //       this.setForm(this.roles);
    //     }
    //   });
    // });
  }
    ngOnChanges(changes: SimpleChanges) {
    if (changes['id']) {
      this.initForm();
    }
  }
  initForm() { 
      if (this.id > 0) { this.headerName = "Edit Role"; this.buttonName = "Update"; }
      else { this.headerName = "Add Role"; this.buttonName = "Save"; }
      this.roleService.getRole(this.id).subscribe((data) => {
        //console.log(data);
        if (data == undefined || data == null) {
          this.submitted = true
          this.addRoleError = true;
          this.errorMessage += 'No role exists for ' + this.id;
          this.successMessage = '';
        } else {
          this.roles = data;
          this.setForm(this.roles);
        }
      });
  }
  setForm(role: IRole) {     
    this.addeditRoleForm = this.fb.group({
      roleName:  [role.roleName, [Validators.required]],
      roleDescription:  [role.roleDescription, [Validators.required]]     
    });
    this.cdr.detectChanges();
  } 

  submitForm(){
    this.submitted = true;
    if (this.addeditRoleForm?.invalid) {
      return;
    }
    const u = { ...this.roles, ...this.addeditRoleForm.value };
    this.roleService.addUpdateRole(u).subscribe({
      next: (data) => {
        this.addRoleError = false;
        if(data.success == true) {
          this.addedited.emit();
          //this.router.navigate(['user/roles']);
        }
      },
      error: (err) => {
        this.addRoleError = true;
        if (err.error != null && err.error.responseException != null) {
          if (err.error.responseException.customErrors != null) {
            for (let key of err.error.responseException.customErrors) {
              this.errorMessage += key.reason + '\n';
            }
          } else {
            for (let key of err.error.responseException.validationErrors) {
              this.errorMessage += key.reason + '\n';
            }
          }
        }
      },
    });
  }
  cancel(){
    this.router.navigate(['user/roles']); 
  }
    cancelAddEdit(): void {
     this.close.emit();
  }
  alphaNumberOnly (e: any) {  // Accept only alpha numerics, not special characters 
    var regex = new RegExp("^[a-zA-Z0-9 ]+$");
    var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    if (regex.test(str)) {
        return true;
    } 
    e.preventDefault();
    return false;
  }  
  onPaste(e: any) {
    e.preventDefault();
    return false;
  }
}

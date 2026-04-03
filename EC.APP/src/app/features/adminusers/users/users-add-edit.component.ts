import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { IRole, IUsers } from '../../../models/admin-users';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../../services/role.service';
import { UsersService } from '../../../services/users.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports:[CommonModule, FormsModule, ReactiveFormsModule],
  selector: 'app-users-add-edit',
  templateUrl: './users-add-edit.component.html',
  styleUrls: ['./users-add-edit.component.css']
})
export class UsersAddEditComponent implements OnInit {
  @Input() id!: number;
  @Output() close = new EventEmitter<void>();
  @Output() addedited = new EventEmitter<void>(); 
  regLabel: string =""; btnLabel: string ="Register";
  users!: IUsers; claimData: any; isFilterShown: boolean = false;
  headerName: string = ''; buttonName: string = ''; successMessage: string = ''; errorMessage: string = '';
  submitted = false; addUserError = false;
  userRolesList: IRole[] = [];
  roleId = "";
  emailRegex = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$'; 
  AddNewUserForm!: FormGroup;
  get f(): { [key: string]: AbstractControl } {
    return this.AddNewUserForm.controls;
  }
  constructor(public fb: FormBuilder, private router: Router, private acRoute: ActivatedRoute, private roleService: RoleService, private userService: UsersService, private cdr: ChangeDetectorRef)
  {         

  }        
  ngOnInit(): void
  { 
    this.initForm();
    // this.getRolesData();  
    // this.acRoute.params.subscribe((e) => {
    //   this.id = +e['id'];
    //   if(this.id > 0){this.headerName = "Edit User"; this.buttonName = "Update";}
    //   else {this.headerName = "Add User";  this.buttonName = "Save";}
    //   this.userService.getUser(this.id).subscribe((data : any) => {
    //     //console.log(data);
    //     if (data == undefined || data == null) {
    //       this.submitted =true
    //       this.addUserError = true; 
    //       this.errorMessage += 'No user exists for ' + this.id;
    //       this.successMessage = '';
    //     } else {
    //       this.users = data;
    //       this.setForm(this.users);
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

    this.getRolesData();  
      if (this.id > 0) { this.headerName = "Edit User"; this.buttonName = "Update"; }
      else { this.headerName = "Add User"; this.buttonName = "Save"; }
      this.userService.getUser(this.id).subscribe((data: any) => {
        //console.log(data);
        if (data == undefined || data == null) {
          this.submitted = true
          this.addUserError = true;
          this.errorMessage += 'No user exists for ' + this.id;
          this.successMessage = '';
        } else {
          this.users = data;
          this.setForm(this.users);
        }
      });
  }
  setForm(user: IUsers) {     
    this.AddNewUserForm = this.fb.group({
      firstName: [user.firstName, [Validators.required]],
      lastName: [user.lastName, [Validators.required]],
      email: [user.email, [Validators.required, Validators.pattern(this.emailRegex)]],
      password: [user.password, [Validators.required]],
      confirmPassword : [user.password, [Validators.required]],
      roleId:  [user.roleId.toString() || '' , [Validators.required]],
      phoneNumber: [user.phoneNumber, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      status: [user.status, Validators.required],
    })
    //,{validators: [Validators.match('password', 'confirmPassword')]})
    
    this.roleId = this.AddNewUserForm?.value.roleId;
    this.cdr.detectChanges();
  }


  gridFilter: any = {
    Filter:[],
    PageNumber: 0,
    PageSize: 0
  } 

  getRolesData(): void
  {
    this.roleService.getRoles().subscribe({ next: (data: any) => {
        if(data.success == true)
        {
          console.log("Roles Data: " + JSON.stringify(data));
          this.userRolesList = data.result;           
        } 
      },
      error: (err: any) => {console.log(err); }
    });
  }

 
  submitForm() 
  {
    this.submitted = true;
    if (this.AddNewUserForm?.invalid) {
      return;
    }
    const u = { ...this.users, ...this.AddNewUserForm.value, roleId: parseInt(this.AddNewUserForm.value.roleId, 0)  };
    this.userService.addUpdateUser(u).subscribe({
      next: (data) => {
        this.addUserError = false;
        if(data.success == true) {
          this.addedited.emit();
          //this.router.navigate(['user/adminusers']);
        }
      },
      error: (err) => {
        this.addUserError = true;
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
      this.router.navigate(['user/adminusers']); 
  }
   cancelAddEdit(): void {
     this.close.emit();
  }
  alphaNumberOnly (e: any) {  
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

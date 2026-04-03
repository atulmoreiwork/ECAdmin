import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ICustomer } from '../../../models/customer.model';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from '../../../services/customer.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './customer-add-edit.component.html',
  styleUrl: './customer-add-edit.component.css'
})
export class CustomerAddEditComponent implements OnInit, OnChanges {
  //id?: number;
  @Input() id!: number;
  @Output() close = new EventEmitter<void>();
  @Output() addedited = new EventEmitter<void>();
  customer!: ICustomer; claimData: any; isFilterShown: boolean = false;
  initialStatus: string = '';
  headerName: string = ''; buttonName: string = '';
  private loadToken = 0;
  emailRegex = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
  AddNewCustomerForm!: FormGroup;
  get f(): { [key: string]: AbstractControl } {
    return this.AddNewCustomerForm.controls;
  }
  constructor(public customerService: CustomerService, public fb: FormBuilder, private router: Router, private cdr: ChangeDetectorRef) {

  }
  ngOnInit(): void {
    // Ensure form exists even before first input-bound load.
    if (!this.AddNewCustomerForm) {
      this.customer = this.getEmptyCustomer();
      this.setForm(this.customer);
    }
    // this.acRoute.params.subscribe((e) => {
    //   this.id = +e['id'];
    //   if(this.id > 0){this.headerName = "Edit Customer"; this.buttonName = "Update";}
    //   else {this.headerName = "Add Customer";  this.buttonName = "Save";}
    //   this.customerService.getCustomer(this.id).subscribe((data) => {
    //     //console.log(data);
    //     if (data == undefined || data == null) {
    //       this.submitted =true
    //       this.addCustomerError = true;
    //       this.errorMessage += 'No customer exists for ' + this.id;
    //       this.successMessage = '';
    //     } else {
    //       this.customer = data;
    //       this.setForm(this.customer);
    //     }
    //   });
    // });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']) {
      this.initForm();
    }
  }

  initForm() {
    const customerId = Number(this.id) > 0 ? Number(this.id) : 0;

    this.submitted = false;
    this.addCustomerError = false;
    this.errorMessage = '';
    this.successMessage = '';

    if (customerId > 0) { this.headerName = "Edit Customer"; this.buttonName = "Update"; }
    else { this.headerName = "Add Customer"; this.buttonName = "Save"; }

    // Reset immediately so stale values never flash while API call is in-flight.
    this.customer = this.getEmptyCustomer();
    this.setForm(this.customer);

    const token = ++this.loadToken;
    this.customerService.getCustomer(customerId).subscribe({
      next: (data) => {
        if (token !== this.loadToken) return;

        if (data == undefined || data == null) {
          this.submitted = true;
          this.addCustomerError = true;
          this.errorMessage = 'No customer exists for ' + customerId;
          this.successMessage = '';
          this.customer = this.getEmptyCustomer();
          this.setForm(this.customer);
          return;
        }

        this.customer = data;
        this.setForm(this.customer);
      },
      error: () => {
        if (token !== this.loadToken) return;
        this.submitted = true;
        this.addCustomerError = true;
        this.errorMessage = 'Failed to load customer details.';
        this.customer = this.getEmptyCustomer();
        this.setForm(this.customer);
      }
    });
  }

  setForm(customer: ICustomer) {
    this.AddNewCustomerForm = this.fb.group({
      firstName: [customer.firstName, [Validators.required]],
      lastName: [customer.lastName, [Validators.required]],
      status: [customer.status, Validators.required],
      address: [customer.address, Validators.required],
      city: [customer.city, Validators.required],
      postalCode: [customer.postalCode, Validators.required],
      state: [customer.state, Validators.required],
      country: [customer.country, Validators.required],
      phoneNumber: [customer.phoneNumber, Validators.required],
      email: [customer.email, [Validators.required, Validators.pattern(this.emailRegex)]],
      password: [customer.password, Validators.required]
    });
    this.cdr.detectChanges();
  }

  submitted = false; addCustomerError = false; errorMessage = ''; successMessage = '';
  submitForm() {
    this.submitted = true;
    this.errorMessage = '';
    if (this.AddNewCustomerForm?.invalid) {
      return;
    }
    //this.AddNewCategoryForm.get('parentCategoryId')!.setValue(this.parentCategoryId);
    const u = { ...this.customer, ...this.AddNewCustomerForm.value };
    this.customerService.addUpdateCustomer(u).subscribe({
      next: (data) => {
        this.addCustomerError = false;
        if (data.success == true) {
          this.addedited.emit();
          //this.router.navigate(['customer']);
        }
      },
      error: (err) => {
        this.addCustomerError = true;
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
  cancel() {
    this.router.navigate(['customer']);
  }
  cancelAddEdit(): void {
    this.close.emit();
  }

  alphaNumberOnly(e: any) {
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

  private getEmptyCustomer(): ICustomer {
    return {
      customerId: 0,
      firstName: '',
      lastName: '',
      status: '',
      address: '',
      city: '',
      postalCode: '',
      state: '',
      country: '',
      phoneNumber: '',
      email: '',
      password: '',
      row: '',
      totalRowCount: '',
      flag: 0
    };
  }
}

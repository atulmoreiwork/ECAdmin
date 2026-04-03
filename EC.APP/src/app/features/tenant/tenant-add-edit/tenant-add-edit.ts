import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { ITenant } from '../../../models/tenant';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TenantService } from '../../../services/tenant.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tenant-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './tenant-add-edit.html',
  styleUrl: './tenant-add-edit.css',
})
export class TenantAddEdit implements OnInit {
  @Input() id!: number;
  @Output() close = new EventEmitter<void>();
  @Output() addedited = new EventEmitter<void>();

  tenant!: ITenant;
  submitted = false;
  addTenantError = false;
  errorMessage = '';
  successMessage = '';
  addEditTenantForm!: FormGroup;

  get f(): { [key: string]: AbstractControl } {
    return this.addEditTenantForm.controls;
  }

  constructor(
    public tenantService: TenantService,
    public fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']) {
      this.initForm();
    }
  }

  initForm(): void {
    this.submitted = false;
    this.addTenantError = false;
    this.errorMessage = '';
    this.successMessage = '';

    this.tenantService.getTenant(this.id).subscribe({
      next: (data) => {
        if (data === undefined || data === null) {
          this.submitted = true;
          this.addTenantError = true;
          this.errorMessage = 'No tenant exists for ' + this.id;
          return;
        }

        this.tenant = data;
        this.setForm(this.tenant);
      },
      error: () => {
        this.submitted = true;
        this.addTenantError = true;
        this.errorMessage = 'Failed to load tenant.';
      }
    });
  }

  setForm(tenant: ITenant): void {
    this.addEditTenantForm = this.fb.group({
      name: [tenant.name, [Validators.required]],
      domain: [tenant.domain, [Validators.required]],
      plans: [tenant.plans, [Validators.required]],
      status: [tenant.status, [Validators.required]],
      users: [tenant.users, [Validators.required, Validators.min(0)]]
    });
    this.cdr.detectChanges();
  }

  submitForm(): void {
    this.submitted = true;
    if (this.addEditTenantForm?.invalid) {
      return;
    }

    const payload: ITenant = { ...this.tenant, ...this.addEditTenantForm.value };
    this.tenantService.addUpdateTenant(payload).subscribe({
      next: (data: any) => {
        this.addTenantError = false;
        if (data?.success === true) {
          this.addedited.emit();
        }
      },
      error: (err: any) => {
        this.addTenantError = true;
        this.errorMessage = '';
        if (err?.error?.responseException?.customErrors) {
          for (const key of err.error.responseException.customErrors) {
            this.errorMessage += key.reason + '\n';
          }
        } else if (err?.error?.responseException?.validationErrors) {
          for (const key of err.error.responseException.validationErrors) {
            this.errorMessage += key.reason + '\n';
          }
        } else {
          this.errorMessage = 'Failed to save tenant.';
        }
      }
    });
  }

  cancelAddEdit(): void {
    this.close.emit();
  }
}

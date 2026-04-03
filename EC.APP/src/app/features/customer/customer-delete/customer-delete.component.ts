import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerService } from '../../../services/customer.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-delete',
  standalone: true,
  imports: [],
  templateUrl: './customer-delete.component.html',
  styleUrl: './customer-delete.component.css'
})
export class CustomerDeleteComponent implements OnInit {
   @Input() customerId!: number;
   @Output() close = new EventEmitter<void>();
   @Output() deleted = new EventEmitter<void>();
  
   constructor(public customerService: CustomerService, public fb: FormBuilder, private router: Router) {  }
 
   ngOnInit(): void 
   { 
 
   } 
 
   confirmDelete(): void {
     if (!this.customerId) return;
 
     this.customerService.deleteCustomerById(this.customerId).subscribe({
       next: (res: any) => {
         if (res.success) { 
           this.deleted.emit();
         } else {
           console.log('Failed to delete customer: ' + res.message);
         }
       },
       error: (err: any) => {
         console.log('Delete error:', err);
         console.log('An error occurred while deleting the customer.');
       }
     });
   }
 
   cancelDelete(): void {
     this.close.emit();
   }
}

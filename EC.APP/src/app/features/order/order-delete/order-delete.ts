import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OrderService } from '../../../services/order.service';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-delete',
  imports: [],
  templateUrl: './order-delete.html',
  styleUrl: './order-delete.css'
})
export class OrderDelete {
   @Input() orderId!: number;
   @Output() close = new EventEmitter<void>();
   @Output() deleted = new EventEmitter<void>();
  
   constructor(public orderService: OrderService, public fb: FormBuilder, private router: Router) {  }
 
   ngOnInit(): void 
   { 
 
   } 
 
   confirmDelete(): void {
     if (!this.orderId) return;
 
     this.orderService.deleteOrderById(this.orderId).subscribe({
       next: (res: any) => {
         if (res.success) { 
           this.deleted.emit();
         } else {
           console.log('Failed to delete order: ' + res.message);
         }
       },
       error: (err: any) => {
         console.log('Delete error:', err);
         console.log('An error occurred while deleting the order.');
       }
     });
   }
 
   cancelDelete(): void {
     this.close.emit();
   }
}

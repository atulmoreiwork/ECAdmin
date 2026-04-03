import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IProduct } from '../../../models/product.model';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-delete',
  standalone: true,
  imports: [],
  templateUrl: './product-delete.component.html',
  styleUrl: './product-delete.component.css'
})
export class ProductDeleteComponent implements OnInit {
  @Input() productId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  constructor(public productService: ProductService, public fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {

  }

  confirmDelete(): void {
    if (!this.productId) return;

    this.productService.deleteProductById(this.productId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.deleted.emit();
        } else {
          console.log('Failed to delete product: ' + res.message);
        }
      },
      error: (err: any) => {
        console.log('Delete error:', err);
        console.log('An error occurred while deleting the product.');
      }
    });
  }

  cancelDelete(): void {
    this.close.emit();
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category-delete',
  standalone: true,
  imports: [],
  templateUrl: './category-delete.component.html',
  styleUrl: './category-delete.component.css'
})
export class CategoryDeleteComponent implements OnInit{
  @Input() categoryId!: number;
   @Output() close = new EventEmitter<void>();
   @Output() deleted = new EventEmitter<void>();
  
   constructor(public categoryService: CategoryService, public fb: FormBuilder, private router: Router) {  }
 
   ngOnInit(): void 
   { 
 
   } 
 
   confirmDelete(): void {
     if (!this.categoryId) return;
 
     this.categoryService.deleteCategoryById(this.categoryId).subscribe({
       next: (res: any) => {
         if (res.success) { 
           this.deleted.emit();
         } else {
           console.log('Failed to delete category: ' + res.message);
         }
       },
       error: (err: any) => {
         console.log('Delete error:', err);
         console.log('An error occurred while deleting the category.');
       }
     });
   }
 
   cancelDelete(): void {
     this.close.emit();
   }
}

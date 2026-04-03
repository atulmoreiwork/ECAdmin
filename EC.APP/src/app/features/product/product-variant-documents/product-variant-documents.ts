import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IDocument } from '../../../models/document.model';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../../services/document.service';
import { ExcludeDeletedPipe } from '../../../shared/pipe/exclude-deleted.pipe';
import { DragDropImagesComponent } from '../../../shared/drag-drop-images/drag-drop-images.component';

@Component({
  selector: 'app-product-variant-documents',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ExcludeDeletedPipe, DragDropImagesComponent],
  templateUrl: './product-variant-documents.html',
  styleUrl: './product-variant-documents.css'
})
export class ProductVariantDocuments implements OnInit {
  @ViewChild(DragDropImagesComponent) dragDropImages!: DragDropImagesComponent;
  @Input() key!: number;
  @Input() productVariantId!: number;
  documents: IDocument[] = [];
  uploadedImages: File[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() uploadedProductVariantImages = new EventEmitter<File[]>();
  constructor(public productService: ProductService, public fb: FormBuilder, private router: Router, public documentService: DocumentService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.initForm();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['productVariantId']) {
      this.initForm();
    }
  }
  initForm() {
    debugger;
    this.documents = [];
    this.uploadedImages = [];

    if (!this.productVariantId || this.productVariantId <= 0) return;

    const param = {
      AssociatedId: this.productVariantId,
      AssociatedType: 'ProductVariant'
    };

    this.documentService.getDocuments(param).subscribe({
      next: (data) => {
        if (data.success) {
          this.documents = data.result ?? [];
        } else {
          this.documents = [];
        }
         this.cdr.detectChanges();
      },
      error: () => {
        this.documents = [];
      }
    });
  }

  removeDocument(document: any): void {
    const index = this.documents.findIndex(doc => doc.documentId === document.documentId);
    if (index !== -1) {
      this.documents[index].isDeleted = true;
      this.documents = [...this.documents];
    }
  }

  onImageListChange(imageList: File[]): void {
     this.uploadedImages = imageList;
    //console.log('Updated Image List:', this.uploadedImages);
  }

  submitForm(): void{
     this.uploadedProductVariantImages.emit(this.uploadedImages);
     if (this.dragDropImages) this.dragDropImages.reset();
     this.close.emit();
  }

  cancelAddEdit(): void {
    this.documents = [];
    this.uploadedImages = [];
    if (this.dragDropImages) this.dragDropImages.reset();
    this.close.emit();
  }
}

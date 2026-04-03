import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IProduct, IProductVariant } from '../../../models/product.model';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../services/product.service';

@Component({
  standalone:true,
  imports:[CommonModule, FormsModule, ReactiveFormsModule],
  selector: 'app-product-form',
  templateUrl: './product-form.html',
})
export class ProductFormComponent implements OnInit {
 productForm!: FormGroup;
  productImages: any[] = [];
  variantImages: { [key: number]: any[] } = {};

  isProductDragOver = false;
  isVariantDragOver: { [key: number]: boolean } = {};

  // Preview modal
  isPreviewOpen = false;
  previewImageUrl: string | null = null;

  productId: number = 0;
  isLoading = false;

  constructor(private fb: FormBuilder, private route: ActivatedRoute,  private productService: ProductService ) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      productId: [0],
      productName: ['', Validators.required],
      urlSlug: [''],
      description: [''],
      price: [0, Validators.required],
      stockQuantity: [0],
      status: ['Active'],
      productVariants: this.fb.array([]),
    });

    // Get product ID from route
    const idParam = this.route.snapshot.paramMap.get('id');
    this.productId = idParam ? +idParam : 0;

    if (this.productId > 0) {
      this.loadProduct(this.productId);
    } else {
      this.addVariant(); // Add one empty variant for new product
    }
  }

  get variants(): FormArray {
    return this.productForm.get('productVariants') as FormArray;
  }

  createVariant(variant?: IProductVariant): FormGroup {
    return this.fb.group({
      productVariantId: [variant?.productVariantId || 0],
      productId: [variant?.productId || 0],
      color: [variant?.color || ''],
      size: [variant?.size || ''],
      price: [variant?.price || 0],
      stockQuantity: [variant?.stockQuantity || 0],
    });
  }

  addVariant(variant?: IProductVariant) {
    this.variants.push(this.createVariant(variant));
  }

  removeVariant(index: number) {
    this.variants.removeAt(index);
    delete this.variantImages[index];
  }

  /* 🔹 Load product for edit mode */
  loadProduct(id: number) {
    this.isLoading = true;
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.isLoading = false;
        this.productForm.patchValue(product);

        // Variants
        this.variants.clear();
        (product.productVariants || []).forEach((v) => this.addVariant(v));

        // Product images
        this.productImages = [];
        if ((product as any).productImages?.length) {
          this.productImages = (product as any).productImages.map((img: any) => ({
            url: img.imageUrl,
            file: null,
            isExisting: true,
            imageId: img.imageId,
          }));
        }

        // Variant images
        this.variantImages = {};
        if ((product as any).variantDocuments?.length) {
          (product as any).variantDocuments.forEach((vDoc: any, index: number) => {
            this.variantImages[index] = vDoc.files.map((f: any) => ({
              url: f.fileUrl,
              file: null,
              isExisting: true,
              fileId: f.fileId,
            }));
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('❌ Error loading product:', err);
      },
    });
  }

  /* ---------- Image Uploads ---------- */
  onProductImageSelect(event: any) {
    this.addProductImages(event.target.files);
  }

  onProductDrop(event: DragEvent) {
    event.preventDefault();
    this.isProductDragOver = false;
    const files = event.dataTransfer?.files;
    if (files) this.addProductImages(files);
  }

  addProductImages(files: FileList | File[]) {
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      this.productImages.push({ file, url, isExisting: false });
    });
  }

  removeProductImage(index: number) {
    this.productImages.splice(index, 1);
  }

  onVariantImageSelect(event: any, variantIndex: number) {
    this.addVariantImages(event.target.files, variantIndex);
  }

  onVariantDrop(event: DragEvent, variantIndex: number) {
    event.preventDefault();
    this.isVariantDragOver[variantIndex] = false;
    const files = event.dataTransfer?.files;
    if (files) this.addVariantImages(files, variantIndex);
  }

  addVariantImages(files: FileList | File[], variantIndex: number) {
    if (!this.variantImages[variantIndex]) this.variantImages[variantIndex] = [];
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      this.variantImages[variantIndex].push({ file, url, isExisting: false });
    });
  }

  removeVariantImage(variantIndex: number, imageIndex: number) {
    this.variantImages[variantIndex].splice(imageIndex, 1);
  }

  /* ---------- Preview ---------- */
  openPreview(imageUrl: string) {
    this.previewImageUrl = imageUrl;
    this.isPreviewOpen = true;
  }

  closePreview() {
    this.isPreviewOpen = false;
    this.previewImageUrl = null;
  }

  /* ---------- Submit ---------- */
  onSubmit() {
    debugger;
    if (this.productForm.invalid) return;

    const product: IProduct = this.productForm.value;
    const formData = new FormData();
    formData.append('product', JSON.stringify(product));

    // Product Images
    this.productImages.forEach((img) => {
      if (!img.isExisting) formData.append('productImages', img.file);
    });

    // Variant Images
    product.productVariants.forEach((_, i) => {
      const imgs = this.variantImages[i] || [];
      imgs.forEach((img) => {
        if (!img.isExisting) formData.append(`variant_${i}_images`, img.file);
      });
    });

    console.log('📤 Ready to send FormData:', formData);
    // Call productService.saveProduct(formData) here
  }
}
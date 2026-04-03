import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IProduct, IProductVariant, IVariantUploadImage } from '../../../models/product.model';
import { ICategory } from '../../../models/category.model';
import { CategoryService } from '../../../services/category.service';
import { DocumentService } from '../../../services/document.service';
import { IDocument } from '../../../models/document.model';
import { CommonModule } from '@angular/common';
import { ExcludeDeletedPipe } from '../../../shared/pipe/exclude-deleted.pipe';
import { ImageEditor } from '../../../shared/image-editor/image-editor';
import { firstValueFrom } from 'rxjs';

type ProductImageUpload = {
  localKey: number;
  file: File;
};

@Component({
  selector: 'app-add-edit-product',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ExcludeDeletedPipe, ImageEditor],
  templateUrl: './add-edit-product.component.html',
  styleUrl: './add-edit-product.component.css'
})
export class AddEditProductComponent implements OnInit, OnChanges {
  @Input() id: number = 0;
  @Output() close = new EventEmitter<void>();

  headerName: string = "Add/Edit Product";
  buttonName: string = "Save";
  categoryId: any;
  categoryList: ICategory[] = [];
  product!: IProduct;
  variants: IProductVariant[] = [];
  documents: IDocument[] = [];
  uploadedImages: File[] = [];
  productImageUploads: ProductImageUpload[] = [];
  addNewProductForm!: FormGroup;
  submitted = false;
  ErrorResponse: any;
  responseType: 'success' | 'error' = 'success';
  selectedProductVariantId: number = 0;

  // UI State
  activeTab: 'general' | 'variants' | 'images' = 'general';
  selectingVariantImage = signal<number>(-1);
  editingProduct = signal<boolean>(false);
  imageEditorOpen = signal<boolean>(false);
  imageEditorUrl = signal<string | null>(null);
  editingProductImageIndex = signal<number>(-1);
  imageEditorTarget = signal<'product' | 'variant-existing' | 'variant-uploaded' | null>(null);
  editingVariantIndex = signal<number>(-1);
  editingVariantDocumentIndex = signal<number>(-1);
  editingVariantUploadIndex = signal<number>(-1);

  private localImageKeyCounter = 1;

  get f(): { [key: string]: AbstractControl } {
    return this.addNewProductForm.controls;
  }

  constructor(
    public productService: ProductService,
    public fb: FormBuilder,
    private router: Router,
    private acRoute: ActivatedRoute,
    private categoryService: CategoryService,
    public documentService: DocumentService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initPage();
  }

  initPage() {
    this.createForm();
    this.getCategoryList();
    this.initForm();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']) {
      this.initPage();
    }
  }
  createForm() {
    this.addNewProductForm = this.fb.group({
      productId: [0],
      productName: ['', Validators.required],
      description: [''],
      status: ['Active', Validators.required],
      categoryId: ['', Validators.required],
      price: [0, Validators.required],
      stockQuantity: [0]
    });
  }
  initForm() {
    if (this.id > 0) {
      this.headerName = "Edit Product";
      this.buttonName = "Update";
      this.editingProduct.set(true);
    } else {
      this.headerName = "Add Product";
      this.buttonName = "Save";
      this.editingProduct.set(false);
    }
    if (this.id > 0) {
      this.productService.getProduct(this.id).subscribe((data) => {
        if (data == undefined || data == null) {
          this.submitted = true;
          this.ErrorResponse = 'No product exists for ' + this.id;
          this.responseType = 'error';
        } else {
          this.product = data;
          this.setForm(this.product);
        }
      });
    }
  }

  setForm(product: IProduct) {
    this.addNewProductForm = this.fb.group({
      productId: [product.productId],
      productName: [product.productName, [Validators.required]],
      description: [product.description],
      status: [product.status || 'Active', Validators.required],
      categoryId: [product.categoryId || "", Validators.required],
      price: [product.price, Validators.required],
      stockQuantity: [product.stockQuantity || 0],
      importedFile: ['']
    });

    this.variants = product.productVariants || [];

    // Ensure all arrays are initialized for each variant
    this.variants.forEach((variant, index) => {
      if (!variant.uploadedImages) {
        variant.uploadedImages = [];
      }
      if (!variant.documents) {
        variant.documents = [];
      }
      variant.documents = this.normalizeDocuments(variant.documents, 'ProductVariant');
      if (!variant.deletedDocumentIds) {
        variant.deletedDocumentIds = [];
      }
      if (variant.productVariantId > 0 && variant.documents.length === 0) {
        this.getVariantDocuments(variant.productVariantId, index);
      }
      // Log variant images for debugging
      console.log(`Variant ${index} (ID: ${variant.productVariantId}) has ${variant.documents.length} existing images`);
    });
    this.categoryId = product.categoryId == 0 ? "" : product.categoryId;
    this.getDocuments(product.productId);
    this.cdr.detectChanges();
  }

  getCategoryList() {
    this.categoryService.getCategories().subscribe((data) => {
      if (data.success == true) {
        this.categoryList = data.result;
        this.cdr.detectChanges();
      }
    });
  }

  submitForm() {
    this.submitted = true;
    this.addNewProductForm.markAllAsTouched();

    if (this.addNewProductForm?.invalid) {
      this.ErrorResponse = 'Please fill all required fields';
      this.responseType = 'error';
      return;
    }

    var formData: any = new FormData();
    formData.append('ProductId', this.addNewProductForm.get('productId')?.value);
    formData.append('ProductName', this.addNewProductForm.get('productName')?.value);
    formData.append('Description', this.addNewProductForm.get('description')?.value);
    formData.append('CategoryId', this.addNewProductForm.get('categoryId')?.value);
    formData.append('Price', this.addNewProductForm.get('price')?.value);
    formData.append('Status', this.addNewProductForm.get('status')?.value);
    formData.append('StockQuantity', this.getTotalStock());

    this.productImageUploads.forEach((upload) => {
      formData.append('ImportFile', upload.file);
    });

    // Process variants with uploaded images only
    const variantsPayload = this.variants.map((v, vIndex) => {
      const uploadedImageKeys = (v.uploadedImages || []).map((_, i) => `variant-${vIndex}-img-${i}`);

      return {
        productVariantId: v.productVariantId ?? 0,
        size: v.size ?? '',
        color: v.color ?? '',
        price: v.price ?? 0,
        stockQuantity: v.stockQuantity ?? 0,
        deletedDocumentIds: v.deletedDocumentIds ?? [],
        imageKeys: uploadedImageKeys
      };
    });

    formData.append('ProductVariants', JSON.stringify(variantsPayload));
    formData.append('Documents', JSON.stringify(this.documents));

    // Append variant uploaded files
    this.variants.forEach((variant, vIndex) => {
      if (variant.uploadedImages && variant.uploadedImages.length > 0) {
        variant.uploadedImages.forEach((img, i) => {
          formData.append(`variant-${vIndex}-img-${i}`, img.file);
        });
      }
    });

    console.log('FormData Contents:');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    this.productService.addUpdateProduct(formData).subscribe({
      next: (response: any) => {
        if (response && response.success === true) {

          this.ErrorResponse = 'Product saved successfully';
          this.responseType = 'success';
          this.cdr.detectChanges();

          setTimeout(() => {
            this.closeModal();
          }, 1500);

        } else {
          this.ErrorResponse = response.message || 'Unknown error occurred';
          this.responseType = 'error';
          this.cdr.detectChanges();
        }
      }
    });
  }

  closeModal() {
    this.close.emit();
  }

  cancel() {
    this.closeModal();
  }

  // Tab Management
  getTabClass(tab: string): string {
    const isActive = this.activeTab === tab;
    return isActive
      ? 'border-b-2 border-blue-600 text-blue-600 px-1 py-2 text-sm font-medium'
      : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-2 text-sm font-medium transition-colors';
  }

  // Image Management
  onImageListChange(imageList: File[]): void {
    this.uploadedImages = imageList;
    console.log('Updated Image List:', this.uploadedImages);
  }

  handleImageUpload(event: any): void {
    const files = Array.from(event.target.files || []) as File[];
    if (!files.length) return;

    const readFile = (file: File): Promise<IDocument> =>
      new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
          const localKey = this.localImageKeyCounter++;
          resolve({
            documentId: 0,
            fileName: file.name,
            fileUrl: reader.result as string,
            associatedId: this.product?.productId || 0,
            associatedType: 'Product',
            isPrimary: this.documents.length === 0,
            localKey
          } as unknown as IDocument);
        };
        reader.readAsDataURL(file);
      });

    Promise.all(files.filter(f => f.type.startsWith('image/')).map(readFile))
      .then(images => {
        this.documents = [...this.documents, ...images];
        const newUploads = images.map((doc, idx) => ({
          localKey: (doc as any).localKey,
          file: files[idx]
        }));
        this.productImageUploads = [...this.productImageUploads, ...newUploads];
        this.uploadedImages = this.productImageUploads.map(x => x.file);
        this.cdr.detectChanges();
      });

    event.target.value = '';
  }

  removeImage(doc: IDocument): void {
    const index = this.documents.findIndex(x => x === doc);
    if (index < 0) {
      return;
    }

    const target = this.documents[index] as any;
    if (target.documentId > 0) {
      target.isDeleted = true;
      this.documents = [...this.documents];
    } else {
      this.documents.splice(index, 1);
      if (target.localKey != null) {
        this.productImageUploads = this.productImageUploads.filter(x => x.localKey !== target.localKey);
      }
    }

    this.uploadedImages = this.productImageUploads.map(x => x.file);
    this.cdr.detectChanges();
  }

  getDocuments(ProductId: any) {
    var param = { AssociatedId: ProductId, AssociatedType: "Product" };
    this.documentService.getDocuments(param).subscribe({
      next: data => {
        if (data.success === true) {
          this.documents = this.normalizeDocuments(data.result, 'Product');
        }
      },
      error: err => {
        console.error('Error loading documents:', err);
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

  // Variant Management
  addVariant() {
    this.variants.push({
      productVariantId: 0,
      productId: this.product?.productId || 0,
      color: "",
      size: "",
      price: this.addNewProductForm?.get('price')?.value || 0,
      stockQuantity: 0,
      documents: [] as IDocument[],
      uploadedImages: [] as IVariantUploadImage[],
      deletedDocumentIds: []
    });
  }

  removeVariant(index: number): void {
    this.variants.splice(index, 1);
  }

  getTotalStock(): number {
    return this.variants
      .filter(v => !(v as any).isDeleted)
      .reduce((total, variant) => total + (variant.stockQuantity || 0), 0);
  }

  // Variant Image Handling
  toggleImageSelector(variantIndex: number) {
    if (this.selectingVariantImage() === variantIndex) {
      this.selectingVariantImage.set(-1);
    } else {
      this.selectingVariantImage.set(variantIndex);
    }
  }

  handleVariantImageUpload(event: any, variantIndex: number) {
    const files = Array.from(event.target.files || []) as File[];
    if (!files.length) return;

    const variant = this.variants[variantIndex];
    if (!variant.uploadedImages) {
      variant.uploadedImages = [];
    }

    const readFile = (file: File): Promise<IVariantUploadImage> =>
      new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          file,
          preview: reader.result as string
        });
        reader.readAsDataURL(file);
      });

    Promise.all(files.filter(f => f.type.startsWith('image/')).map(readFile))
      .then(images => {
        variant.uploadedImages = [...(variant.uploadedImages || []), ...images];
        console.log(`Added ${images.length} images to variant ${variantIndex}`, variant.uploadedImages);
        this.cdr.detectChanges();
      });

    event.target.value = '';
  }

  removeVariantImageUI(variantIndex: number, imageIndex: number, isUploaded: boolean) {
    const variant = this.variants[variantIndex];
    if (variant.uploadedImages && variant.uploadedImages.length > imageIndex) {
      variant.uploadedImages.splice(imageIndex, 1);
      this.cdr.detectChanges();
    }
  }

  removeExistingVariantImage(variantIndex: number, documentId: number) {
    const variant = this.variants[variantIndex];

    // Initialize deletedDocumentIds if not exists
    if (!variant.deletedDocumentIds) {
      variant.deletedDocumentIds = [];
    }

    // Mark document for deletion
    variant.deletedDocumentIds.push(documentId);

    // Remove from documents array to update UI immediately
    const docIndex = variant.documents.findIndex(d => d.documentId === documentId);
    if (docIndex >= 0) {
      variant.documents.splice(docIndex, 1);
    }

    console.log(`Marked document ${documentId} for deletion from variant ${variantIndex}`);
    this.cdr.detectChanges();
  }

  getVariantImagePreview(variant: IProductVariant, variantIndex: number): string {
    // Check uploaded images
    if (variant.uploadedImages && variant.uploadedImages.length > 0) {
      return variant.uploadedImages[0].preview;
    }
    // Check existing documents (for edit mode)
    if (variant.documents && variant.documents.length > 0) {
      return variant.documents[0].fileUrl || variant.documents[0].physicalFileUrl || '';
    }
    return '';
  }

  getVariantImageCount(variant: IProductVariant, variantIndex: number): number {
    const uploadedCount = variant.uploadedImages?.length || 0;
    const existingCount = variant.documents?.length || 0;
    return uploadedCount + existingCount;
  }

  async openImageEditor(doc: IDocument): Promise<void> {
    const target = doc as any;
    const index = this.documents.findIndex((x: any) =>
      x === doc ||
      (target.documentId > 0 && x.documentId === target.documentId) ||
      (target.localKey != null && x.localKey === target.localKey) ||
      (!!target.fileUrl && x.fileUrl === target.fileUrl)
    );
    if (index < 0) {
      return;
    }

    this.editingProductImageIndex.set(index);
    this.imageEditorTarget.set('product');
    const source = await this.resolveImageForEditor(this.documents[index] as any);
    if (!source) return;
    this.imageEditorUrl.set(source);
    this.imageEditorOpen.set(true);
  }

  async openVariantExistingImageEditor(variantIndex: number, doc: IDocument): Promise<void> {
    const variant = this.variants[variantIndex];
    if (!variant?.documents?.length) return;

    const target = doc as any;
    const docIndex = variant.documents.findIndex((x: any) =>
      x === doc ||
      (target.documentId > 0 && x.documentId === target.documentId) ||
      (!!target.fileUrl && x.fileUrl === target.fileUrl)
    );

    if (docIndex < 0) return;

    this.imageEditorTarget.set('variant-existing');
    this.editingVariantIndex.set(variantIndex);
    this.editingVariantDocumentIndex.set(docIndex);
    this.editingVariantUploadIndex.set(-1);
    const source = await this.resolveImageForEditor(variant.documents[docIndex] as any);
    if (!source) return;
    this.imageEditorUrl.set(source);
    this.imageEditorOpen.set(true);
  }

  openVariantUploadedImageEditor(variantIndex: number, imageIndex: number): void {
    const variant = this.variants[variantIndex];
    if (!variant?.uploadedImages?.length || imageIndex < 0 || imageIndex >= variant.uploadedImages.length) return;

    this.imageEditorTarget.set('variant-uploaded');
    this.editingVariantIndex.set(variantIndex);
    this.editingVariantDocumentIndex.set(-1);
    this.editingVariantUploadIndex.set(imageIndex);
    this.imageEditorUrl.set(variant.uploadedImages[imageIndex].preview);
    this.imageEditorOpen.set(true);
  }

  closeImageEditor(): void {
    this.imageEditorOpen.set(false);
    this.imageEditorUrl.set(null);
    this.imageEditorTarget.set(null);
    this.editingProductImageIndex.set(-1);
    this.editingVariantIndex.set(-1);
    this.editingVariantDocumentIndex.set(-1);
    this.editingVariantUploadIndex.set(-1);
    this.cdr.detectChanges();
  }

  async saveEditedProductImage(croppedBase64: string): Promise<void> {
    const target = this.imageEditorTarget();
    if (!target || !croppedBase64) {
      this.closeImageEditor();
      return;
    }

    const extension = this.getFileExtensionFromBase64(croppedBase64);
    const fileName = `cropped_${Date.now()}.${extension}`;
    const croppedFile = this.base64ToFile(croppedBase64, fileName);
    if (target === 'product') {
      const index = this.editingProductImageIndex();
      if (index < 0 || index >= this.documents.length) {
        this.closeImageEditor();
        return;
      }

      const oldDoc = this.documents[index] as any;
      const newLocalKey = this.localImageKeyCounter++;
      const replacementDoc: IDocument = {
        documentId: 0,
        documentType: oldDoc.documentType || 'Image',
        fileName,
        fileUrl: croppedBase64,
        physicalFileUrl: '',
        associatedId: this.product?.productId || 0,
        associatedType: 'Product',
        isDeleted: false,
        flag: 1,
        row: '',
        totalRowCount: '',
        localKey: newLocalKey
      } as unknown as IDocument;

      let updatedIndex = index;
      if (oldDoc.documentId > 0) {
        oldDoc.isDeleted = true;
        this.documents = [...this.documents, replacementDoc];
        updatedIndex = this.documents.length - 1;
      } else {
        this.documents = this.documents.map((d, i) => i === index ? replacementDoc : d);
        if (oldDoc.localKey != null) {
          this.productImageUploads = this.productImageUploads.filter(x => x.localKey !== oldDoc.localKey);
        }
      }

      this.productImageUploads = [...this.productImageUploads, { localKey: newLocalKey, file: croppedFile }];
      this.uploadedImages = this.productImageUploads.map(x => x.file);
      this.editingProductImageIndex.set(updatedIndex);
      this.imageEditorUrl.set(replacementDoc.fileUrl);
      this.cdr.detectChanges();
      this.closeImageEditor();
      return;
    }

    const variantIndex = this.editingVariantIndex();
    if (variantIndex < 0 || variantIndex >= this.variants.length) {
      this.closeImageEditor();
      return;
    }

    const variant = this.variants[variantIndex];
    if (!variant.uploadedImages) {
      variant.uploadedImages = [];
    }

    if (target === 'variant-existing') {
      const docIndex = this.editingVariantDocumentIndex();
      if (!variant.documents || docIndex < 0 || docIndex >= variant.documents.length) {
        this.closeImageEditor();
        return;
      }

      if (!variant.deletedDocumentIds) {
        variant.deletedDocumentIds = [];
      }

      const oldDoc = variant.documents[docIndex];
      if (oldDoc?.documentId > 0) {
        variant.deletedDocumentIds = [...variant.deletedDocumentIds, oldDoc.documentId];
      }

      variant.documents = variant.documents.filter((_, i) => i !== docIndex);
      variant.uploadedImages = [...variant.uploadedImages, { file: croppedFile, preview: croppedBase64 }];
      this.imageEditorTarget.set('variant-uploaded');
      this.editingVariantDocumentIndex.set(-1);
      this.editingVariantUploadIndex.set(variant.uploadedImages.length - 1);
      this.imageEditorUrl.set(croppedBase64);
      this.cdr.detectChanges();
      this.closeImageEditor();
      return;
    }

    const uploadIndex = this.editingVariantUploadIndex();
    if (uploadIndex < 0 || uploadIndex >= variant.uploadedImages.length) {
      this.closeImageEditor();
      return;
    }

    variant.uploadedImages = variant.uploadedImages.map((img, i) =>
      i === uploadIndex ? { file: croppedFile, preview: croppedBase64 } : img
    );
    this.imageEditorUrl.set(croppedBase64);
    this.closeImageEditor();
    this.cdr.detectChanges();
  }

  private base64ToFile(base64Data: string, fileName: string): File {
    const [meta, content] = base64Data.split(',');
    const mime = (meta.match(/data:(.*?);base64/) || [])[1] || 'image/jpeg';
    const binary = atob(content || '');
    const length = binary.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new File([bytes], fileName, { type: mime });
  }

  private getFileExtensionFromBase64(base64Data: string): string {
    if (base64Data.startsWith('data:image/png')) return 'png';
    if (base64Data.startsWith('data:image/webp')) return 'webp';
    return 'jpg';
  }

  private async resolveImageForEditor(doc: IDocument): Promise<string | null> {
    const target = doc as any;
    if (target?.documentId > 0) {
      try {
        const fileBlob = await firstValueFrom(this.documentService.getDocumentFile(target.documentId));
        return await this.blobToDataUrl(fileBlob);
      } catch {
        return target?.fileUrl || target?.physicalFileUrl || null;
      }
    }
    return target?.fileUrl || target?.physicalFileUrl || null;
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = () => reject(new Error('Could not convert blob to data URL'));
      reader.readAsDataURL(blob);
    });
  }

  private getVariantDocuments(productVariantId: number, variantIndex: number): void {
    const param = { AssociatedId: productVariantId, AssociatedType: 'ProductVariant' };
    this.documentService.getDocuments(param).subscribe({
      next: (data) => {
        if (data?.success === true && this.variants[variantIndex]) {
          this.variants[variantIndex].documents = this.normalizeDocuments(data.result, 'ProductVariant');
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error(`Error loading variant documents for variant ${productVariantId}:`, err);
      }
    });
  }

  private normalizeDocuments(documents: IDocument[] = [], associatedType: 'Product' | 'ProductVariant'): IDocument[] {
    return (documents || []).map((doc: any) => ({
      ...doc,
      associatedType: associatedType,
      fileUrl: doc?.fileUrl || doc?.physicalFileUrl || ''
    }));
  }
}

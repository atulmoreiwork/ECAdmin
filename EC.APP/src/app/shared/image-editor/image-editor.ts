import { Component, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage, OutputFormat } from 'ngx-image-cropper';

@Component({
  selector: 'app-image-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageCropperComponent],
  templateUrl: './image-editor.html',
  styleUrl: './image-editor.css',
})
export class ImageEditor {
  isOpen = input.required<boolean>();
  imageEvent = input<any | undefined>(undefined);
  imageUrl = input<string | undefined>(undefined);


  save = output<string>(); // Emits Base64 string
  cancel = output<void>();

  // Cropper Settings
  maintainAspectRatio = signal(true);
  aspectRatio = signal(1 / 1);
  resizeWidth = signal(1000); // Default web friendly
  format = signal<OutputFormat>('jpeg');
  quality = signal(85);
  rotation = signal(0);
  transform = signal({}); // For Zoom

  // UI State
  loading = signal(true);
  currentScale = signal(1);

  // Output State
  croppedImageBlob: Blob | null | undefined = null;
  croppedImageBase64: string = '';
  croppedImageWidth = 0;
  croppedImageHeight = 0;
  convertingCrop = signal(false);

  // Helpers
  estimatedSize = computed(() => {
    if (!this.croppedImageBase64) return 'Calculating...';
    // Approx base64 size
    const len = this.croppedImageBase64.length;
    const sizeInBytes = 4 * Math.ceil((len / 3)) * 0.5624896334383812;
    const sizeInKb = sizeInBytes / 1000;
    return sizeInKb > 1000 ? `${(sizeInKb / 1000).toFixed(2)} MB` : `${sizeInKb.toFixed(1)} KB`;
  });

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImageBlob = event.blob;
    this.croppedImageBase64 = event.base64 || '';

    // In ngx-image-cropper v8+, `base64` may be empty and only blob/objectUrl is returned.
    // Convert blob to base64 so parent components always receive a persistent data URL.
    if (event.blob) {
      this.convertingCrop.set(true);
      this.blobToBase64(event.blob).then(b64 => {
        this.croppedImageBase64 = b64 as string;
      }).finally(() => {
        this.convertingCrop.set(false);
      });
    } else {
      this.convertingCrop.set(false);
    }
    this.croppedImageWidth = event.width;
    this.croppedImageHeight = event.height;
    this.loading.set(false);
  }

  imageLoaded(image: LoadedImage) {
    this.loading.set(false);
  }

  cropperReady() {
    this.loading.set(false);
  }

  loadImageFailed() {
    console.error('Image load failed');
    this.loading.set(false);
    alert('Could not load image. Please try another file.');
  }

  // Actions
  setRatio(w: number, h: number) {
    this.maintainAspectRatio.set(true);
    this.aspectRatio.set(w / h);
  }

  setFreeCrop() {
    this.maintainAspectRatio.set(false);
  }

  rotateLeft() {
    this.loading.set(true);
    setTimeout(() => {
      this.rotation.update(r => r - 90);
    }, 10); // Yield to render spinner
  }

  rotateRight() {
    this.loading.set(true);
    setTimeout(() => {
      this.rotation.update(r => r + 90);
    }, 10);
  }

  onZoomChange(e: any) {
    const val = parseFloat(e.target.value);
    this.currentScale.set(val);
    this.transform.set({ scale: val });
  }

  saveImage() {
    if (this.convertingCrop()) {
      return;
    }

    if (this.croppedImageBase64?.startsWith('data:image/')) {
      this.save.emit(this.croppedImageBase64);
    }
  }

  getRatioClass(ratioVal: number) {
    const current = this.maintainAspectRatio() ? this.aspectRatio() : -1;
    // Rough comparison for float
    const isActive = Math.abs(current - ratioVal) < 0.01;
    const base = "px-2 py-2 text-xs border rounded transition-colors ";
    return isActive
      ? "bg-blue-600 text-white border-blue-600"
      : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600";
  }

  private blobToBase64(blob: Blob) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }
}

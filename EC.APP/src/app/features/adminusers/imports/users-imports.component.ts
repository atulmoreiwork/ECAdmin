
// ...existing code...
import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpEventType, HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { UsersService } from '../../../services/users.service';

@Component({
  standalone: true,
  selector: 'app-users-imports',
  templateUrl: './users-imports.component.html',
  styleUrls: ['./users-imports.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class UsersImportsComponent {
  selectedFile: File | null = null;
  fileName = '';
  uploadMessage = '';
  uploadSuccess = false;
  fileValid = false;
  fileError = false;

  constructor(public usersService: UsersService){}

  // Handle drag events
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) this.validateFile(file);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.validateFile(file);
  }

  validateFile(file: File) {
    const allowedExtensions = ['.xlsx', '.xls'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedExtensions.includes(fileExt)) {
      this.fileError = true;
      this.fileValid = false;
      this.uploadMessage = 'Invalid file type. Please upload an Excel file.';
      this.uploadSuccess = false;
      this.selectedFile = null;
      this.fileName = '';
      return;
    }

    this.fileError = false;
    this.fileValid = true;
    this.selectedFile = file;
    this.fileName = file.name;
    this.uploadMessage = '';
  }

  async uploadFile() {
    if (!this.selectedFile) {
      this.uploadMessage = 'Please select a file first.';
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.usersService.uploadExcel(formData).subscribe({
      next: (response: Blob) => {
        // ✅ Create a blob URL and download
        const fileURL = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = 'Validated_Import.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(fileURL);

        this.uploadMessage = 'File validated and downloaded successfully.';
        this.uploadSuccess = true;
      },
      error: (error: any) => {
        console.error('Error uploading file:', error);
        this.uploadMessage = 'Error occurred while uploading file.';
        this.uploadSuccess = false;
      },
    });
  }
  downloadSample() {
    const link = document.createElement('a');
    link.href = 'assets/sample/UsersSample.xlsx';
    link.download = 'UsersSample.xlsx';
    link.click();
  }
}

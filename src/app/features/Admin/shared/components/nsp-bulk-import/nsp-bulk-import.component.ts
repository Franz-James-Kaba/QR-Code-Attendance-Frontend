import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '@shared/components/button/button.component';

import { NSPImportResult, NSPRequest } from '../../models/nsp.model';
import { FileUploadService } from '../../services/file-upload.service';
import { NspService } from '../../services/nsp.service';

@Component({
  selector: 'app-nsp-bulk-import',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './nsp-bulk-import.component.html',
})
export class NspBulkImportComponent {
  private readonly fileUploadService = inject(FileUploadService);
  private readonly nspService = inject(NspService);

  @Output() importComplete = new EventEmitter<NSPImportResult>();
  @Output() cancel = new EventEmitter<void>();

  fileName = '';
  file: File | null = null;
  isUploading = false;
  isProcessing = false;
  parseError = '';
  nsps: NSPRequest[] = [];
  validationErrors: string[] = [];

  // File input handling
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    this.file = input.files[0];
    this.fileName = this.file.name;
    this.parseError = '';
    this.nsps = [];
    this.validationErrors = [];

    // Only accept CSV files
    if (!this.file.name.toLowerCase().endsWith('.csv')) {
      this.parseError = 'Please upload a CSV file';
      this.file = null;
      this.fileName = '';
      return;
    }

    this.parseFile();
  }

  // Parse the uploaded file
  parseFile(): void {
    if (!this.file) return;

    this.isProcessing = true;

    this.fileUploadService.parseNspCsvFile(this.file).subscribe({
      next: (nsps) => {
        this.nsps = nsps;
        this.isProcessing = false;

        // Validate NSPs
        this.validateNsps();
      },
      error: (error) => {
        this.parseError = error.message ?? 'Failed to parse CSV file';
        this.isProcessing = false;
      }
    });
  }

  // Basic validation for NSPs
  validateNsps(): void {
    this.validationErrors = [];

    if (this.nsps.length === 0) {
      this.validationErrors.push('No valid NSP records found in the file');
      return;
    }

    // Check for duplicate emails
    const emails = new Set<string>();
    const duplicates = new Set<string>();

    this.nsps.forEach(nsp => {
      if (emails.has(nsp.email.toLowerCase())) {
        duplicates.add(nsp.email.toLowerCase());
      } else {
        emails.add(nsp.email.toLowerCase());
      }
    });

    if (duplicates.size > 0) {
      this.validationErrors.push(`Found ${duplicates.size} duplicate email(s) in the file`);
    }

    // Validate email format
    const invalidEmails = this.nsps.filter(nsp => !this.isValidEmail(nsp.email));
    if (invalidEmails.length > 0) {
      this.validationErrors.push(`Found ${invalidEmails.length} invalid email(s) in the file`);
    }
    
    // Validate first and last name are provided
    const invalidNames = this.nsps.filter(nsp => !nsp.firstName || !nsp.lastName);
    if (invalidNames.length > 0) {
      this.validationErrors.push(`Found ${invalidNames.length} record(s) with missing first or last name`);
    }
  }

  // Email validation helper
  isValidEmail(email: string): boolean {
    // Basic email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // Download CSV template
  downloadTemplate(): void {
    this.fileUploadService.downloadTemplate();
  }

  // Submit the bulk import
  onSubmit(): void {
    if (!this.nsps.length || this.validationErrors.length > 0) {
      return;
    }

    this.isUploading = true;

    this.nspService.bulkImportNsps(this.nsps).subscribe({
      next: (result) => {
        this.isUploading = false;
        this.importComplete.emit(result);
      },
      error: (error) => {
        this.isUploading = false;
        this.parseError = error.message ?? 'Failed to import NSPs';
      }
    });
  }

  // Cancel the operation
  onCancel(): void {
    this.cancel.emit();
  }
}

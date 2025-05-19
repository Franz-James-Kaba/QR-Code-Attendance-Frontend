import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

import { NSPRequest } from '../models/nsp.model';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  /**
   * Parse CSV file containing NSP data
   * Expected format:
   * firstName,middleName,lastName,email
   * John,Doe,Smith,john.smith@example.com
   * ...
   */
  parseNspCsvFile(file: File): Observable<NSPRequest[]> {
    return from(
      new Promise<NSPRequest[]>((resolve, reject) => {
        const reader = new FileReader();
        const nsps: NSPRequest[] = [];

        reader.onload = event => {
          try {
            const csvData = event.target?.result as string;
            const lines = csvData.split('\n').filter(line => line.trim() !== '');

            // Get header row and validate required columns
            const headers = lines[0].split(',').map(header => header.trim().toLowerCase());

            const requiredHeaders = ['firstname', 'lastname', 'email'];
            const hasRequiredHeaders = requiredHeaders.every(required =>
              headers.includes(required)
            );

            if (!hasRequiredHeaders) {
              reject(new Error('CSV file is missing required columns: firstName, lastName, email'));
              return;
            }

            const firstNameIndex = headers.indexOf('firstname');
            const middleNameIndex = headers.indexOf('middlename');
            const lastNameIndex = headers.indexOf('lastname');
            const emailIndex = headers.indexOf('email');

            // Process data rows (skip header)
            for (let i = 1; i < lines.length; i++) {
              const values = lines[i].split(',').map(value => value.trim());

              // Skip empty lines
              if (values.length <= 1) continue;

              // Create NSP object
              const nsp: NSPRequest = {
                firstName: values[firstNameIndex],
                lastName: values[lastNameIndex],
                email: values[emailIndex],
              };

              // Add optional middle name if available
              if (middleNameIndex !== -1 && values[middleNameIndex]) {
                nsp.middleName = values[middleNameIndex];
              }

              // Basic validation
              if (!nsp.firstName || !nsp.lastName || !nsp.email) {
                continue; // Skip incomplete rows
              }

              nsps.push(nsp);
            }

            resolve(nsps);
          } catch (error) {
            reject(error instanceof Error ? error : new Error(String(error)));
          }
        };

        reader.onerror = () => {
          reject(new Error('Error reading file'));
        };

        reader.readAsText(file);
      })
    );
  }

  /**
   * Create a CSV template for NSP import
   */
  generateCsvTemplate(): string {
    return 'firstName,middleName,lastName,email\n';
  }

  /**
   * Download a file (used for template)
   */
  downloadTemplate(): void {
    const template = this.generateCsvTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = 'nsp_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';

// Personnel interface
export interface Personnel {
  name: string;
  stack: string;
  status: string;
}

@Component({
  selector: 'app-personnel-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputFieldComponent,
    ButtonComponent,
    IconComponent,
    LoadingComponent
  ],
  templateUrl: './personnel-table.component.html',
  styleUrls: ['./personnel-table.component.scss']
})
export class PersonnelTableComponent implements OnInit {
  // Full list of personnel
  allPersonnel: Personnel[] = [
    { name: 'Abdul Rashid', stack: 'Front-End(Angular)', status: 'NSP' },
    { name: 'Isaac Hayfron', stack: 'UI/UX Trainer', status: 'Facilitator' },
    { name: 'Wade Warren', stack: 'UI/UX Designer', status: 'NSP' },
    { name: 'Robert Fox', stack: 'Back-End(Java)', status: 'NSP' },
    { name: 'Jacob Jones', stack: 'QA', status: 'NSP' },
    { name: 'Cody Fisher', stack: 'QA', status: 'NSP' },
    { name: 'Ralph Edwards', stack: 'Front-End(React)', status: 'NSP' }
  ];

  // Filtered personnel list (what's shown in the table)
  filteredPersonnel: Personnel[] = [];

  // Search and filter states
  searchQuery: string = '';
  selectedStack: string = 'All Stacks';
  selectedStatus: string = 'All Status';

  // Dropdown options
  stackOptions: string[] = ['All Stacks', 'Front-End(Angular)', 'Front-End(React)', 'Back-End(Java)', 'UI/UX Designer', 'UI/UX Trainer', 'QA'];
  statusOptions: string[] = ['All Status', 'NSP', 'Facilitator'];

  // Loading state
  isLoading: boolean = false;

  constructor() { }

  ngOnInit(): void {
    // Initialize with all personnel
    this.filteredPersonnel = [...this.allPersonnel];

    // Simulate loading
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  // Filter personnel based on search query and dropdown selections
  filterPersonnel(): void {
    this.isLoading = true;

    // Start with all personnel
    let filtered = [...this.allPersonnel];

    // Apply search filter (case insensitive)
    if (this.searchQuery.trim() !== '') {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(person =>
        person.name.toLowerCase().includes(query) ||
        person.stack.toLowerCase().includes(query) ||
        person.status.toLowerCase().includes(query)
      );
    }

    // Apply stack filter
    if (this.selectedStack !== 'All Stacks') {
      filtered = filtered.filter(person => person.stack === this.selectedStack);
    }

    // Apply status filter
    if (this.selectedStatus !== 'All Status') {
      filtered = filtered.filter(person => person.status === this.selectedStatus);
    }

    // Update the filtered list
    setTimeout(() => {
      this.filteredPersonnel = filtered;
      this.isLoading = false;
    }, 300); // Small delay to show loading indicator
  }

  // Handle search input
  onSearch(): void {
    this.filterPersonnel();
  }

  // Handle stack filter change
  onStackFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedStack = select.value;
    this.filterPersonnel();
  }

  // Handle status filter change
  onStatusFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus = select.value;
    this.filterPersonnel();
  }
}

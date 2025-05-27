import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Personnel interface
export interface Personnel {
  name: string;
  stack: string;
  points: number;
  position?: number; // Added position field
}

@Component({
  selector: 'app-personnel-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './personnel-table.component.html',
  styleUrls: ['./personnel-table.component.scss', '../../../../../shared/styles/table.css'],
})
export class PersonnelTableComponent implements OnInit {
  // Full list of personnel
  allPersonnel: Personnel[] = [
    { name: 'Abdul Rashid', stack: 'Front-End(Angular)', points: 850 },
    { name: 'Isaac Hayfron', stack: 'UI/UX Trainer', points: 920 },
    { name: 'Wade Warren', stack: 'UI/UX Designer', points: 760 },
    { name: 'Robert Fox', stack: 'Back-End(Java)', points: 890 },
    { name: 'Jacob Jones', stack: 'QA', points: 800 },
    { name: 'Cody Fisher', stack: 'QA', points: 750 },
    { name: 'Ralph Edwards', stack: 'Front-End(React)', points: 830 },
  ];

  // Filtered personnel list (what's shown in the table)
  filteredPersonnel: Personnel[] = [];

  // Search and filter states
  searchQuery: string = '';
  selectedStack: string = 'All Stacks';

  // Dropdown options
  stackOptions: string[] = [
    'All Stacks',
    'Front-End(Angular)',
    'Front-End(React)',
    'Back-End(Java)',
    'UI/UX Designer',
    'UI/UX Trainer',
    'QA',
  ];

  // Loading state
  isLoading: boolean = false;

  constructor() {}

  ngOnInit(): void {
    // Initialize with all personnel sorted by points
    this.filteredPersonnel = [...this.allPersonnel]
      .sort((a, b) => b.points - a.points)
      .map((person, index) => ({
        ...person,
        position: index + 1,
      }));

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
      filtered = filtered.filter(
        person =>
          person.name.toLowerCase().includes(query) ||
          person.stack.toLowerCase().includes(query)
      );
    }

    // Apply stack filter
    if (this.selectedStack !== 'All Stacks') {
      filtered = filtered.filter(person => person.stack === this.selectedStack);
    }

    // Sort by points and assign positions
    filtered = filtered
      .sort((a, b) => b.points - a.points)
      .map((person, index) => ({
        ...person,
        position: index + 1,
      }));

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
}

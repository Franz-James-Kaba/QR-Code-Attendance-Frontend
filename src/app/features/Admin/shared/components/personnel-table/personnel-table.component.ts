import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { LeaderboardService } from '../../services/leaderboard.service';

export interface Personnel {
  name: string;
  stack: string;
  points: number;
  position?: number;
}

@Component({
  selector: 'app-personnel-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './personnel-table.component.html',
  styleUrls: ['./personnel-table.component.scss', '../../../../../shared/styles/table.css'],
})
export class PersonnelTableComponent implements OnInit, OnDestroy {
  private readonly leaderboardService = inject(LeaderboardService);  private readonly destroy$ = new Subject<void>();

  allPersonnel: Personnel[] = [];
  filteredPersonnel: Personnel[] = [];
  paginatedPersonnel: Personnel[] = [];

  // Pagination
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;

  searchQuery: string = '';
  selectedStack: string = 'All Stacks';

  // Loading state
  isLoading: boolean = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private loadLeaderboard(): void {
    this.isLoading = true;
    this.error = null;

    this.leaderboardService.getLeaderboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (entries) => {
          // Handle empty state (204 No Content)
          if (!entries || entries.length === 0) {
            this.allPersonnel = [];
            this.filteredPersonnel = [];
            this.isLoading = false;
            return;
          }

          this.allPersonnel = entries.map(entry => ({
            name: `${entry.firstName} ${entry.lastName}`,
            stack: 'Not Available', // Stack info not provided by API
            points: entry.totalPoints,
            position: entry.position
          }));
          this.filterPersonnel();
        },
        error: (err) => {
          if (err.message === 'You do not have permission to view the leaderboard.') {
            this.error = 'You do not have permission to view the leaderboard.';
          } else if (err.message === 'Server error. Please try again later.') {
            this.error = 'Server error. Please try again later.';
          } else {
            this.error = 'Failed to load leaderboard data. Please try again later.';
          }
          this.isLoading = false;
          console.error('Error loading leaderboard:', err);
        }
      });
  }  filterPersonnel(): void {
    // Start with all personnel, sorted by points (highest first) and position
    let filtered = [...this.allPersonnel]
      .sort((a, b) => {
        if (a.points === b.points) {
          // If points are equal, sort by position (if available)
          if (a.position && b.position) {
            return a.position - b.position;
          }
          return 0;
        }
        return b.points - a.points;
      });

    // Apply search filter (case insensitive)
    if (this.searchQuery.trim() !== '') {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        person => person.name.toLowerCase().includes(query)
      );
    }

    // Update the filtered list and paginate
    this.filteredPersonnel = filtered;
    this.totalPages = Math.ceil(this.filteredPersonnel.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages) || 1;
    this.updatePaginatedResults();
    this.isLoading = false;
  }

  private updatePaginatedResults(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedPersonnel = this.filteredPersonnel.slice(startIndex, endIndex);
  }

  private updateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredPersonnel.length / this.pageSize);
    // Reset current page if it's out of bounds
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
  }

  onSearch(): void {
    this.currentPage = 1; // Reset to first page on search
    this.filterPersonnel();
  }

  onRetry(): void {
    this.loadLeaderboard();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.updatePaginatedResults();
    }
  }

  get pages(): number[] {
    const pagesArray: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pagesArray.push(i);
    }
    return pagesArray;
  }
}

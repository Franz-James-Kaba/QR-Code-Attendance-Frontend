import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LoadingService } from '@core/services/loading/loading.service';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navigation-loading',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  template: `
    @if (isLoading$ | async) {
      <app-loading 
        variant="navigation" 
        color="primary" 
        text="Loading page..."
      ></app-loading>
    }
  `,
  styles: []
})
export class NavigationLoadingComponent implements OnInit {
  isLoading$!: Observable<boolean>;
  
  constructor(private loadingService: LoadingService) {}
  
  ngOnInit(): void {
    this.isLoading$ = this.loadingService.navigationLoading$;
  }
}
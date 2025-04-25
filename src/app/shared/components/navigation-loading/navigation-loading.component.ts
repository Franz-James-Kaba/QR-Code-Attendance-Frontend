import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { LoadingService } from '@core/services/loading/loading.service';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navigation-loading',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  templateUrl: './navigation-loading.component.html',
  styleUrls: ['./navigation-loading.component.scss'],
})
export class NavigationLoadingComponent implements OnInit {
  isLoading$!: Observable<boolean>;

  private readonly loadingService = inject(LoadingService);

  ngOnInit(): void {
    this.isLoading$ = this.loadingService.navigationLoading$;
  }
}

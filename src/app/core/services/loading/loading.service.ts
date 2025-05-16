import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private readonly navigationLoadingSubject = new BehaviorSubject<boolean>(false);
  navigationLoading$: Observable<boolean> = this.navigationLoadingSubject.asObservable();

  // For general loading
  show(): void {
    this.loadingSubject.next(true);
  }

  hide(): void {
    this.loadingSubject.next(false);
  }

  // Specifically for navigation between pages
  showNavigationLoading(): void {
    this.navigationLoadingSubject.next(true);
  }

  hideNavigationLoading(): void {
    this.navigationLoadingSubject.next(false);
  }
}

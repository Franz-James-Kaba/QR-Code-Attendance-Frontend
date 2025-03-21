import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface BreadcrumbItem {
  label: string;
  link?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private readonly breadcrumbsSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  breadcrumbs$ = this.breadcrumbsSubject.asObservable();

  updateBreadcrumbs(items: BreadcrumbItem[] | null) {
    this.breadcrumbsSubject.next(items ?? []);
  }
}

import { BreadcrumbService } from '@Admin/core/services/breadcrumb.service';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BreadcrumbItem } from '@shared/models/breadcrumb.model';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
})
export class BreadcrumbComponent implements OnInit {
  @Input() items: BreadcrumbItem[] = [];
  private readonly breadcrumbService = inject(BreadcrumbService);

  ngOnInit() {
    this.breadcrumbService.breadcrumbs$.subscribe((breadcrumbs) => {
      this.items = breadcrumbs;
    });
  }
}

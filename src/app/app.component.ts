import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationLoadingInterceptor } from '@core/interceptors/navigation-loading/navigation-loading.interceptor';
import { NavigationLoadingComponent } from '@shared/components/navigation-loading/navigation-loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavigationLoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'qr-code-attendance-frontend';
  private readonly navigationLoadingInterceptor = inject(NavigationLoadingInterceptor);
}

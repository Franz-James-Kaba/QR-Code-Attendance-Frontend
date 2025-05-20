import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  // We'll keep the component logic minimal since it's mainly a layout container
}

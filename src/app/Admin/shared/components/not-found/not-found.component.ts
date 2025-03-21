import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule, ButtonComponent],
  templateUrl: './not-found.component.html',
})
export class NotFoundComponent {}

import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  EventEmitter,
  Output,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() title = 'Modal';
  @Input() visible = false;
  @Input() isLoading = false;
  @Input() loadingAction: 'create' | 'update' | null = null;
  @Output() modalClosed = new EventEmitter<void>();

  // Flag to control content visibility for animations
  showContent = false;

  get loadingMessage(): string {
    if (!this.isLoading) return '';

    if (this.loadingAction === 'create') {
      return 'Creating...';
    } else if (this.loadingAction === 'update') {
      return 'Updating...';
    }
    return 'Processing...';
  }

  ngOnInit(): void {
    if (this.visible) {
      this.onVisibilityChange(true);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // React to visible input changes
    if (changes['visible']) {
      this.onVisibilityChange(changes['visible'].currentValue);
    }
  }

  ngOnDestroy(): void {

    this.showContent = false;
    document.body.style.overflow = '';
  }

  onVisibilityChange(isVisible: boolean): void {
    if (isVisible) {
      setTimeout(() => {
        this.showContent = true;
        document.body.style.overflow = 'hidden';
      }, 50);
    } else {
      this.showContent = false;
      document.body.style.overflow = '';

      setTimeout(() => {
        this.modalClosed.emit();
      }, 300);
    }
  }

  close(): void {
    if (!this.isLoading) {
      this.onVisibilityChange(false);
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (!this.isLoading && (event.target as HTMLElement).classList.contains('fixed')) {
      this.close();
    }
  }
}

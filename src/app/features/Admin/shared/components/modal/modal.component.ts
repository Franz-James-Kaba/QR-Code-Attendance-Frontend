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
    // Listen for visible changes to trigger animations
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
    // Cleanup any potential animation timeouts
    this.showContent = false;
    document.body.style.overflow = '';
  }

  /**
   * Called when the visible input changes
   */
  onVisibilityChange(isVisible: boolean): void {
    if (isVisible) {
      // When opening, first render the component, then animate in
      setTimeout(() => {
        this.showContent = true;
        // Prevent scrolling on the body when modal is open
        document.body.style.overflow = 'hidden';
      }, 50); // Small delay to ensure DOM has updated
    } else {
      // When closing, first animate out, then remove from DOM
      this.showContent = false;
      // Re-enable scrolling
      document.body.style.overflow = '';

      // Allow time for animation to complete before emitting closed event
      setTimeout(() => {
        this.modalClosed.emit();
      }, 300); // Match this with your CSS transition duration
    }
  }

  /**
   * Closes the modal
   */
  close(): void {
    if (!this.isLoading) {
      this.onVisibilityChange(false);
    }
  }

  /**
   * Handles backdrop clicks to close the modal
   */
  onBackdropClick(event: MouseEvent): void {
    // Only close if the backdrop itself was clicked, not modal content
    // And don't close if we're in a loading state
    if (!this.isLoading && (event.target as HTMLElement).classList.contains('fixed')) {
      this.close();
    }
  }
}

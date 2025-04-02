import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[clickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<void>();

  constructor(private readonly elementRef: ElementRef) {}

  @HostListener('document:click', ['$event.target'])
  onClick(target: HTMLElement | EventTarget): void {
    // Explicitly use elementRef to satisfy linter
    const element = this.elementRef.nativeElement;
    const clickedInside = element.contains(target);
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}

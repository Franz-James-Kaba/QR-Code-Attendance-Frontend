import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
  inject,
  AfterViewInit,
} from '@angular/core';

@Directive({
  selector: '[appTimeRange]',
  standalone: true,
})
export class TimeRangeDirective implements AfterViewInit {
  @Input() activeClass = 'bg-gray-100';
  @Input() inactiveClass = 'bg-white';

  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  ngAfterViewInit(): void {
    // Set the first button as active by default
    const parent = this.el.nativeElement.parentElement;
    if (parent && parent.firstElementChild === this.el.nativeElement) {
      this.renderer.addClass(this.el.nativeElement, this.activeClass);
      this.renderer.removeClass(this.el.nativeElement, this.inactiveClass);
    }
  }

  @HostListener('click') onClick() {
    // Find all sibling elements with the same directive
    const parent = this.el.nativeElement.parentElement;
    if (!parent) return;

    // Convert HTMLCollection to Array and filter for elements with our directive
    const elements = Array.from(parent.children);
    const siblings = elements.filter(
      el => el instanceof HTMLElement && el.hasAttribute('appTimeRange')
    );

    // Remove active class from all siblings
    siblings.forEach(sibling => {
      this.renderer.removeClass(sibling, this.activeClass);
      this.renderer.addClass(sibling, this.inactiveClass);
    });

    // Add active class to current element
    this.renderer.removeClass(this.el.nativeElement, this.inactiveClass);
    this.renderer.addClass(this.el.nativeElement, this.activeClass);
  }
}

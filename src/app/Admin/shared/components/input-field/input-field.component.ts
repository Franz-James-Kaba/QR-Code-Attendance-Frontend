import { Component, Input, Self, Optional, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NgControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input-field.component.html',
  styleUrl: './input-field.component.css'
})
export class InputFieldComponent implements ControlValueAccessor, OnInit {
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' = 'text';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() name = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() showPasswordToggle = false;
  @Input() validateAmalitechEmail = false;
  value: any = '';
  isPassword = false;
  showPassword = false;
  hasError = false;
  touched = false;

  constructor(@Self() @Optional() private readonly ngControl: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    this.isPassword = this.type === 'password';
  }

  // ControlValueAccessor methods
  onChange = (value: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.onTouched();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  markAsTouched(): void {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  get inputType(): string {
    if (this.isPassword) {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }

  get errorMessage(): string | null {
    if (this.ngControl?.errors && this.touched) {
      const errors = this.ngControl.errors;
      if (errors['required']) return 'This field is required';
      if (errors['email']) return 'Please enter a valid email';
      if (errors['amaliTechEmail']) return 'Please enter a valid AmaliTech email address';
      if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength}`;
      if (errors['pattern']) return 'Invalid format';
    }
    return null;
  }
}

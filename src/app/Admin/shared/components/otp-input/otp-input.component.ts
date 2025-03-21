import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-otp-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './otp-input.component.html',
  styleUrl: './otp-input.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OtpInputComponent),
      multi: true
    }
  ]
})
export class OtpInputComponent implements ControlValueAccessor {
  @Input() length = 6;
  @Input() disabled = false;

  otpValues: string[] = [];
  focused = false;

  private onChange = (value: string) => {};
  private onTouched = () => {};

  ngOnInit() {
    this.otpValues = new Array(this.length).fill('');
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const isNumber = /[\d]/.test(event.key);
    const isBackspace = event.key === 'Backspace';
    const isArrowLeft = event.key === 'ArrowLeft';
    const isArrowRight = event.key === 'ArrowRight';

    if (!isNumber && !isBackspace && !isArrowLeft && !isArrowRight) {
      event.preventDefault();
    }
  }

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value.length > 1) {
      input.value = value.slice(-1);
    }

    this.otpValues[index] = input.value;

    if (value && index < this.length - 1) {
      const nextInput = input.parentElement?.nextElementSibling?.querySelector('input');
      if (nextInput) nextInput.focus();
    }

    this.emitValue();
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text')?.slice(0, this.length);

    if (!pastedData) return;

    this.otpValues = [...pastedData.split(''), ...new Array(this.length).fill('')].slice(0, this.length);
    this.emitValue();
  }

  private emitValue() {
    const otp = this.otpValues.join('');
    this.onChange(otp);
    this.onTouched();
  }

  writeValue(value: string): void {
    if (!value) {
      this.otpValues = new Array(this.length).fill('');
      return;
    }
    this.otpValues = value.split('').slice(0, this.length);
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
}

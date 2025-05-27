import { Session, SessionRequest } from '@Admin/shared/models/session/session.model';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-session-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './session-form.component.html',
})
export class SessionFormComponent implements OnInit {
  @Input() initialData: Session | null = null;
  @Input() isSubmitting = false;
  @Output() formSubmit = new EventEmitter<SessionRequest>();
  @Output() formCancel = new EventEmitter<void>();

  form!: FormGroup;

  get isEdit(): boolean {
    return !!this.initialData;
  }

  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    this.initForm();
    if (this.initialData) {
      this.patchForm();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]]
    });
  }

  private patchForm(): void {
    if (!this.initialData) return;

    const startDateTime = this.formatDateTimeForInput(new Date(this.initialData.startTime));
    const endDateTime = this.formatDateTimeForInput(new Date(this.initialData.endTime));

    this.form.patchValue({
      name: this.initialData.name,
      startTime: startDateTime,
      endTime: endDateTime,
    });
  }

  formatDateTimeForInput(date: Date): string {
    return date.toISOString().slice(0, 16);
  }
    onSubmit(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const formValue = this.form.value;
    const sessionData: SessionRequest = {
      name: formValue.name,
      startTime: new Date(formValue.startTime).toISOString(),
      endTime: new Date(formValue.endTime).toISOString(),
    };

    this.formSubmit.emit(sessionData);
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  isStartDateValid(): boolean {
    const startDate = this.form.get('startTime')?.value;
    return !startDate || new Date(startDate) >= new Date();
  }

  isEndDateValid(): boolean {
    const startDate = this.form.get('startTime')?.value;
    const endDate = this.form.get('endTime')?.value;

    return !startDate || !endDate || new Date(endDate) > new Date(startDate);
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.touched && control.hasError(errorName);
  }
}

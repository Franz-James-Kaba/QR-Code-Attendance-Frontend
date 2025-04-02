import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function amaliTechEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const email = control.value.toLowerCase();
    const validDomains = ['@amalitech.com', '@amalitech.org'];
    const isValidDomain = validDomains.some(domain => email.endsWith(domain));

    return isValidDomain ? null : { amaliTechEmail: true };
  };
}

import { AbstractControl, ValidationErrors } from '@angular/forms';

export function futureDate(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!(value instanceof Date)) {
    return null;
  }
  const chosenDay = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return chosenDay.getTime() > todayStart.getTime() ? null : { pastDate: true };
}

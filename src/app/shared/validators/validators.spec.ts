import { FormControl } from '@angular/forms';
import { futureDate } from './future-date.validator';
import { notBlank } from './not-blank.validator';

describe('notBlank', () => {
  it('accepts normal text and empty text', () => {
    expect(notBlank(new FormControl('Car'))).toBeNull();
    expect(notBlank(new FormControl(''))).toBeNull();
  });

  it('rejects text made only of spaces', () => {
    expect(notBlank(new FormControl('   '))).toEqual({ blank: true });
  });
});

describe('futureDate', () => {
  it('accepts tomorrow', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(futureDate(new FormControl(tomorrow))).toBeNull();
  });

  it('rejects today and the past', () => {
    expect(futureDate(new FormControl(new Date()))).toEqual({ pastDate: true });
    expect(futureDate(new FormControl(new Date(2000, 0, 1)))).toEqual({ pastDate: true });
  });

  it('ignores an empty value (required handles that)', () => {
    expect(futureDate(new FormControl(null))).toBeNull();
  });
});

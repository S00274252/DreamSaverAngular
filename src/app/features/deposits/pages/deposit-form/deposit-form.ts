import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrentUserService } from '../../../../core/current-user.service';
import { fromApiDate, toIsoDate } from '../../../../shared/date.util';
import { CreateDepositDto, UpdateDepositDto } from '../../models/deposit.model';
import { DepositService } from '../../services/deposit.service';

@Component({
  selector: 'app-deposit-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './deposit-form.html',
})
export class DepositForm implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly depositService = inject(DepositService);
  private readonly currentUser = inject(CurrentUserService);

  readonly id = input<string>();

  depositForm = this.formBuilder.nonNullable.group({
    amount: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    date: this.formBuilder.control<Date | null>(new Date(), [Validators.required]),
    note: ['', [Validators.maxLength(200)]],
  });

  saving = signal(false);
  saveError = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;

    this.depositService.getDepositById(id).subscribe({
      next: (deposit) =>
        this.depositForm.patchValue({
          amount: deposit.amount,
          date: fromApiDate(deposit.date),
          note: deposit.note ?? '',
        }),
      error: (err: Error) => this.saveError.set(err.message),
    });
  }

  onSubmit(): void {
    if (this.depositForm.invalid) {
      this.depositForm.markAllAsTouched();
      return;
    }

    const { amount, date, note } = this.depositForm.getRawValue();
    const userId = this.currentUser.userId();
    if (amount === null || date === null || !userId) return;

    const id = this.id();
    const trimmedNote = note.trim();

    this.saving.set(true);
    this.saveError.set(null);
    this.depositForm.disable();

    const request = id
      ? this.depositService.updateDeposit(id, this.buildUpdate(amount, date, trimmedNote))
      : this.depositService.addDeposit(this.buildCreate(userId, amount, date, trimmedNote));

    request.subscribe({
      next: () => {
        this.snackBar.open('Deposit saved', 'Close', { duration: 5000 });
        this.router.navigate(['/deposits']);
      },
      error: (err: Error) => {
        this.saveError.set(err.message);
        this.saving.set(false);
        this.depositForm.enable();
      },
    });
  }

  private buildCreate(userId: string, amount: number, date: Date, note: string): CreateDepositDto {
    const dto: CreateDepositDto = { userId, amount, date: toIsoDate(date) };
    if (note) {
      dto.note = note;
    }
    return dto;
  }

  // An empty note is sent as '' so clearing it in the form really clears it on the server
  private buildUpdate(amount: number, date: Date, note: string): UpdateDepositDto {
    return { amount, date: toIsoDate(date), note };
  }
}

import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CurrentUserService } from '../../../../core/current-user.service';
import { toIsoDate } from '../../../../shared/date.util';
import { LoadState, withLoadState } from '../../../../shared/load-state';
import { reloadableState } from '../../../../shared/reloadable-state';
import { futureDate } from '../../../../shared/validators/future-date.validator';
import { Prediction } from '../../models/finance.model';
import { FinanceService } from '../../services/finance.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly formBuilder = inject(FormBuilder);
  private readonly financeService = inject(FinanceService);
  protected readonly currentUser = inject(CurrentUserService);

  private readonly balance = reloadableState(() => this.financeService.getBalance(this.currentUser.userId() ?? ''));
  protected readonly balanceState = this.balance.state;

  protected readonly tomorrow = this.addDays(new Date(), 1);

  predictionForm = this.formBuilder.group({
    date: this.formBuilder.control<Date | null>(null, [Validators.required, futureDate]),
    monthlyDeposit: this.formBuilder.control<number | null>(null, [Validators.min(0)]),
  });

  protected readonly prediction = signal<LoadState<Prediction> | null>(null);

  onPredict(): void {
    if (this.predictionForm.invalid) {
      this.predictionForm.markAllAsTouched();
      return;
    }

    const { date, monthlyDeposit } = this.predictionForm.getRawValue();
    const userId = this.currentUser.userId();
    if (date === null || !userId) return;

    withLoadState(
      this.financeService.getPrediction(userId, toIsoDate(date), monthlyDeposit ?? undefined),
    ).subscribe((state) => this.prediction.set(state));
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}

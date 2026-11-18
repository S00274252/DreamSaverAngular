import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrentUserService } from '../../../../core/current-user.service';
import { reloadableState } from '../../../../shared/reloadable-state';
import { Deposit } from '../../models/deposit.model';
import { DepositService } from '../../services/deposit.service';

@Component({
  selector: 'app-deposit-list',
  imports: [RouterLink, CurrencyPipe, DatePipe, MatButtonModule, MatCardModule],
  templateUrl: './deposit-list.html',
})
export class DepositList {
  private readonly depositService = inject(DepositService);
  private readonly currentUser = inject(CurrentUserService);
  private readonly snackBar = inject(MatSnackBar);

  private readonly list = reloadableState(() =>
    this.depositService.getDeposits(this.currentUser.userId() ?? ''),
  );
  protected readonly state = this.list.state;
  protected readonly actionError = signal<string | null>(null);

  deleteDeposit(deposit: Deposit): void {
    if (!confirm(`Delete this deposit of ${deposit.amount}?`)) return;

    this.actionError.set(null);
    this.depositService.deleteDeposit(deposit._id).subscribe({
      next: () => {
        this.snackBar.open('Deposit deleted', 'Close', { duration: 5000 });
        this.list.reload();
      },
      error: (err: Error) => this.actionError.set(err.message),
    });
  }
}

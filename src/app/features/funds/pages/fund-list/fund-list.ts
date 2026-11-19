import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrentUserService } from '../../../../core/current-user.service';
import { reloadableState } from '../../../../shared/reloadable-state';
import { Fund } from '../../models/fund.model';
import { FundService } from '../../services/fund.service';

@Component({
  selector: 'app-fund-list',
  imports: [RouterLink, CurrencyPipe, DatePipe, MatButtonModule, MatCardModule],
  templateUrl: './fund-list.html',
})
export class FundList {
  private readonly fundService = inject(FundService);
  private readonly currentUser = inject(CurrentUserService);
  private readonly snackBar = inject(MatSnackBar);

  private readonly list = reloadableState(() => this.fundService.getFunds(this.currentUser.userId() ?? ''));
  protected readonly state = this.list.state;
  protected readonly actionError = signal<string | null>(null);

  deleteFund(fund: Fund): void {
    if (!confirm(`Delete the fund "${fund.name}"?`)) return;

    this.actionError.set(null);
    this.fundService.deleteFund(fund._id).subscribe({
      next: () => {
        this.snackBar.open('Fund deleted', 'Close', { duration: 5000 });
        this.list.reload();
      },
      error: (err: Error) => this.actionError.set(err.message),
    });
  }
}

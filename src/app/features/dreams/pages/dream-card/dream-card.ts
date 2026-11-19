import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { switchMap } from 'rxjs';
import { LoadState, withLoadState } from '../../../../shared/load-state';
import { Dream, DreamEstimate } from '../../models/dream.model';
import { DreamService } from '../../services/dream.service';

@Component({
  selector: 'app-dream-card',
  imports: [RouterLink, CurrencyPipe, DatePipe, MatButtonModule, MatCardModule, MatProgressBarModule],
  templateUrl: './dream-card.html',
})
export class DreamCard {
  private readonly dreamService = inject(DreamService);

  readonly dream = input.required<Dream>();
  readonly deleted = output<Dream>();

  protected readonly estimate = toSignal(
    toObservable(this.dream).pipe(
      switchMap((dream) => withLoadState(this.dreamService.getEstimate(dream._id))),
    ),
    { initialValue: { status: 'loading' } as LoadState<DreamEstimate> },
  );

  progress(estimate: DreamEstimate): number {
    if (estimate.targetAmount <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round((estimate.currentBalance / estimate.targetAmount) * 100)));
  }
}

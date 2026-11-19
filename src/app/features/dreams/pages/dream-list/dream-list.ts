import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrentUserService } from '../../../../core/current-user.service';
import { reloadableState } from '../../../../shared/reloadable-state';
import { Dream } from '../../models/dream.model';
import { DreamService } from '../../services/dream.service';
import { DreamCard } from '../dream-card/dream-card';

@Component({
  selector: 'app-dream-list',
  imports: [RouterLink, MatButtonModule, DreamCard],
  templateUrl: './dream-list.html',
})
export class DreamList {
  private readonly dreamService = inject(DreamService);
  private readonly currentUser = inject(CurrentUserService);
  private readonly snackBar = inject(MatSnackBar);

  private readonly list = reloadableState(() => this.dreamService.getDreams(this.currentUser.userId() ?? ''));
  protected readonly state = this.list.state;
  protected readonly actionError = signal<string | null>(null);

  deleteDream(dream: Dream): void {
    if (!confirm(`Delete the dream "${dream.title}"?`)) return;

    this.actionError.set(null);
    this.dreamService.deleteDream(dream._id).subscribe({
      next: () => {
        this.snackBar.open('Dream deleted', 'Close', { duration: 5000 });
        this.list.reload();
      },
      error: (err: Error) => this.actionError.set(err.message),
    });
  }
}

import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrentUserService } from '../../../../core/current-user.service';
import { reloadableState } from '../../../../shared/reloadable-state';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  imports: [RouterLink, MatButtonModule, MatCardModule],
  templateUrl: './user-list.html',
})
export class UserList {
  private readonly userService = inject(UserService);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly currentUser = inject(CurrentUserService);

  private readonly list = reloadableState(() => this.userService.getUsers());
  protected readonly state = this.list.state;
  protected readonly actionError = signal<string | null>(null);

  select(user: User): void {
    this.currentUser.select(user);
    this.snackBar.open(`Now using ${user.name}'s profile`, 'Close', { duration: 5000 });
  }

  deleteUser(user: User): void {
    if (!confirm(`Delete ${user.name}? Their deposits, funds and dreams will be deleted too.`)) return;

    this.actionError.set(null);
    this.userService.deleteUser(user._id).subscribe({
      next: () => {
        if (this.currentUser.userId() === user._id) {
          this.currentUser.clear();
        }
        this.snackBar.open(`${user.name} deleted`, 'Close', { duration: 5000 });
        this.list.reload();
      },
      error: (err: Error) => this.actionError.set(err.message),
    });
  }
}

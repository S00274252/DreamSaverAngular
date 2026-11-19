import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrentUserService } from '../../../../core/current-user.service';
import { notBlank } from '../../../../shared/validators/not-blank.validator';
import { DreamService } from '../../services/dream.service';

@Component({
  selector: 'app-dream-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  templateUrl: './dream-form.html',
})
export class DreamForm implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dreamService = inject(DreamService);
  private readonly currentUser = inject(CurrentUserService);

  readonly id = input<string>();

  dreamForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(60), notBlank]],
    targetAmount: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(1)]),
    achieved: [false],
  });

  saving = signal(false);
  saveError = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;

    this.dreamService.getDreamById(id).subscribe({
      next: (dream) =>
        this.dreamForm.patchValue({
          title: dream.title,
          targetAmount: dream.targetAmount,
          achieved: dream.achieved,
        }),
      error: (err: Error) => this.saveError.set(err.message),
    });
  }

  onSubmit(): void {
    if (this.dreamForm.invalid) {
      this.dreamForm.markAllAsTouched();
      return;
    }

    const { title, targetAmount, achieved } = this.dreamForm.getRawValue();
    const userId = this.currentUser.userId();
    if (targetAmount === null || !userId) return;

    const id = this.id();
    const request = id
      ? this.dreamService.updateDream(id, { title: title.trim(), targetAmount, achieved })
      : this.dreamService.addDream({ userId, title: title.trim(), targetAmount });

    this.saving.set(true);
    this.saveError.set(null);
    this.dreamForm.disable();

    request.subscribe({
      next: () => {
        this.snackBar.open('Dream saved', 'Close', { duration: 5000 });
        this.router.navigate(['/dreams']);
      },
      error: (err: Error) => {
        this.saveError.set(err.message);
        this.saving.set(false);
        this.dreamForm.enable();
      },
    });
  }
}

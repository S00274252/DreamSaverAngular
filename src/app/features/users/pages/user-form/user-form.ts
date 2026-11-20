import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrentUserService } from '../../../../core/current-user.service';
import { notBlank } from '../../../../shared/validators/not-blank.validator';
import { CreateUserDto, UpdateUserDto } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { switchMap } from 'rxjs';
import { AuthService } from '../../../../core/auth.service';

@Component({
  selector: 'app-user-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  templateUrl: './user-form.html',
})
export class UserForm implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly userService = inject(UserService);
  private readonly currentUser = inject(CurrentUserService);
  private readonly auth = inject(AuthService);

  readonly id = input<string>();

  userForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(50), notBlank]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  saving = signal(false);
  saveError = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;

    this.userForm.controls.password.setValidators([Validators.minLength(8)]);
    this.userForm.controls.password.updateValueAndValidity();

    this.userService.getUserById(id).subscribe({
      next: (user) => this.userForm.patchValue({ name: user.name, email: user.email }),
      error: (err: Error) => this.saveError.set(err.message),
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.userForm.getRawValue();
    const id = this.id();

    this.saving.set(true);
    this.saveError.set(null);
    this.userForm.disable();

    if (id) {
      const changes: UpdateUserDto = { name: name.trim(), email: email.trim() };
      if (password) {
        changes.password = password;
      }
      this.userService.updateUser(id, changes).subscribe({
        next: (user) => {
          if (this.currentUser.userId() === user._id) {
            this.currentUser.select(user);
          }
          this.snackBar.open(`${user.name} saved`, 'Close', { duration: 5000 });
          this.router.navigate(['/dashboard']);
        },
        error: (err: Error) => this.failSave(err),
      });
    } else {
      const newUser: CreateUserDto = { name: name.trim(), email: email.trim(), password };
      this.auth
        .register(newUser)
        .pipe(switchMap(() => this.auth.login(newUser.email, newUser.password)))
        .subscribe({
          next: (user) => {
            this.snackBar.open(`Welcome, ${user.name}`, 'Close', { duration: 5000 });
            this.router.navigate(['/dashboard']);
          },
          error: (err: Error) => this.failSave(err),
        });
    }
  }

  private failSave(err: Error): void {
    this.saveError.set(err.message);
    this.saving.set(false);
    this.userForm.enable();
  }
}

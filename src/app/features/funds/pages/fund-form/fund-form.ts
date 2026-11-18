import { Component, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrentUserService } from '../../../../core/current-user.service';
import { fromApiDate, toIsoDate } from '../../../../shared/date.util';
import { notBlank } from '../../../../shared/validators/not-blank.validator';
import { CreateFundDto, FundType, UpdateFundDto } from '../../models/fund.model';
import { FundService } from '../../services/fund.service';

@Component({
  selector: 'app-fund-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './fund-form.html',
})
export class FundForm implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fundService = inject(FundService);
  private readonly currentUser = inject(CurrentUserService);

  readonly id = input<string>();

  fundForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(60), notBlank]],
    type: this.formBuilder.nonNullable.control<FundType>('static'),
    amount: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    
    interestRate: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(100),
    ]),
    startDate: this.formBuilder.control<Date | null>(null, [Validators.required]),
    durationMonths: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.pattern(/^\d+$/),
    ]),
  });

  saving = signal(false);
  saveError = signal<string | null>(null);

  protected readonly isInterest = signal(false);

  constructor() {
    this.applyType('static');
    this.fundForm.controls.type.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((type) => this.applyType(type));
  }

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;

    this.fundService.getFundById(id).subscribe({
      next: (fund) => {
        this.fundForm.patchValue({
          name: fund.name,
          type: fund.type,
          amount: fund.amount,
          interestRate: fund.interestRate ?? null,
          startDate: fund.startDate ? fromApiDate(fund.startDate) : null,
          durationMonths: fund.durationMonths ?? null,
        });
      },
      error: (err: Error) => this.saveError.set(err.message),
    });
  }

  onSubmit(): void {
    if (this.fundForm.invalid) {
      this.fundForm.markAllAsTouched();
      return;
    }

    const { name, type, amount, interestRate, startDate, durationMonths } = this.fundForm.getRawValue();
    const userId = this.currentUser.userId();
    if (amount === null || !userId) return;

    const fields: UpdateFundDto = { name: name.trim(), type, amount };
    if (type === 'interest') {
      if (interestRate === null || startDate === null || durationMonths === null) return;
      fields.interestRate = interestRate;
      fields.startDate = toIsoDate(startDate);
      fields.durationMonths = durationMonths;
    }

    const id = this.id();
    const request = id
      ? this.fundService.updateFund(id, fields)
      : this.fundService.addFund({ userId, ...fields } satisfies CreateFundDto);

    this.setSaving(true);
    this.saveError.set(null);

    request.subscribe({
      next: () => {
        this.snackBar.open('Fund saved', 'Close', { duration: 5000 });
        this.router.navigate(['/funds']);
      },
      error: (err: Error) => {
        this.saveError.set(err.message);
        this.setSaving(false);
      },
    });
  }

  private applyType(type: FundType): void {
    const interestControls = [
      this.fundForm.controls.interestRate,
      this.fundForm.controls.startDate,
      this.fundForm.controls.durationMonths,
    ];
    this.isInterest.set(type === 'interest');
    for (const control of interestControls) {
      if (type === 'interest') {
        control.enable({ emitEvent: false });
      } else {
        control.disable({ emitEvent: false });
      }
    }
  }

  private setSaving(saving: boolean): void {
    this.saving.set(saving);
    if (saving) {
      this.fundForm.disable({ emitEvent: false });
    } else {
      this.fundForm.enable({ emitEvent: false });
      this.applyType(this.fundForm.controls.type.value);
    }
  }
}

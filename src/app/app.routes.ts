import { Routes } from '@angular/router';
import { currentUserGuard } from './core/current-user.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [currentUserGuard],
    children: [
      {
        path: 'deposits',
        title: 'Deposits',
        loadComponent: () => import('./features/deposits/pages/deposit-list/deposit-list').then((m) => m.DepositList),
      },
      {
        path: 'deposits/new',
        title: 'Add deposit',
        loadComponent: () => import('./features/deposits/pages/deposit-form/deposit-form').then((m) => m.DepositForm),
      },
      {
        path: 'deposits/:id/edit',
        title: 'Edit deposit',
        loadComponent: () => import('./features/deposits/pages/deposit-form/deposit-form').then((m) => m.DepositForm),
      },
      {
        path: 'funds',
        title: 'Funds',
        loadComponent: () => import('./features/funds/pages/fund-list/fund-list').then((m) => m.FundList),
      },
      {
        path: 'funds/new',
        title: 'Add fund',
        loadComponent: () => import('./features/funds/pages/fund-form/fund-form').then((m) => m.FundForm),
      },
      {
        path: 'funds/:id/edit',
        title: 'Edit fund',
        loadComponent: () => import('./features/funds/pages/fund-form/fund-form').then((m) => m.FundForm),
      },
    ],
  },
];

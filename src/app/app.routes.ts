import { Routes } from '@angular/router';
import { currentUserGuard } from './core/current-user.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  
  {
    path: 'login',
    title: 'Log in',
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    title: 'Create account',
    loadComponent: () => import('./features/users/pages/user-form/user-form').then((m) => m.UserForm),
  },

  {
    path: '',
    canActivate: [currentUserGuard],
    children: [
      {
        path: 'dashboard',
        title: 'Dashboard',
        loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
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
      {
        path: 'dreams',
        title: 'Dreams',
        loadComponent: () => import('./features/dreams/pages/dream-list/dream-list').then((m) => m.DreamList),
      },
      {
        path: 'dreams/new',
        title: 'Add dream',
        loadComponent: () => import('./features/dreams/pages/dream-form/dream-form').then((m) => m.DreamForm),
      },
      {
        path: 'dreams/:id/edit',
        title: 'Edit dream',
        loadComponent: () => import('./features/dreams/pages/dream-form/dream-form').then((m) => m.DreamForm),
      },
      {
        path: 'users/:id/edit',
        title: 'Edit profile',
        loadComponent: () => import('./features/users/pages/user-form/user-form').then((m) => m.UserForm),
      },
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];

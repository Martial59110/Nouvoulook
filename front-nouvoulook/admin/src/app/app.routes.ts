import { Routes } from '@angular/router';
import { authGuard } from './pages/guards/auth.guard';
import { ReactiveFormsModule } from '@angular/forms';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/affichage/affichage.component').then(m => m.AffichageComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: 'donations',
        loadComponent: () => import('./pages/donations/donations.component').then(m => m.DonationsComponent)
      },
      {
        path: 'volunteers',
        loadComponent: () => import('./pages/volunteers/volunteers.component').then(m => m.VolunteersComponent)
      },
      {
        path: 'news',
        loadComponent: () => import('./pages/news/news.component').then(m => m.NewsComponent)
      },
      {
        path: 'partners',
        loadComponent: () => import('./pages/partners/partners.component').then(m => m.PartnersComponent)
      },
      {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
      },
      {
        path: 'history',
        loadComponent: () => import('./pages/history/history.component').then(m => m.HistoryComponent)
      },
      {
        path: 'boutique',
        loadComponent: () => import('./pages/boutique/boutique.component').then(m => m.BoutiqueComponent)
      },
      {
        path: 'legal-mentions',
        loadComponent: () => import('./pages/legal-mentions/legal-mentions.component').then(m => m.LegalMentionsComponent)
      }
    ]
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

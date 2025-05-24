import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  token: string = '';
  loading = false;
  error: string | null = null;
  success: string | null = null;
  resetForm: any;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatch });
  }

  passwordsMatch(group: any) {
    return group.get('password').value === group.get('confirmPassword').value ? null : { notMatching: true };
  }

  submit() {
    this.error = null;
    this.success = null;
    if (this.resetForm.invalid || !this.token) {
      this.error = 'Formulaire invalide ou lien expiré.';
      return;
    }
    this.loading = true;
    this.http.patch('/api/auth/reset-password', {
      token: this.token,
      password: this.resetForm.value.password
    }).subscribe({
      next: () => {
        this.success = 'Mot de passe réinitialisé ! Vous pouvez vous connecter.';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: err => {
        this.error = err.error?.message || 'Erreur lors de la réinitialisation.';
        this.loading = false;
      }
    });
  }
} 
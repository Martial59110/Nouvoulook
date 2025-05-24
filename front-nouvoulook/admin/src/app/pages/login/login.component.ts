import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

function isSafeInput(str: string): boolean {
  // Pas d'espaces, pas de guillemets, pas de point-virgule, pas de chevrons, pas de SQL classique
  return !(/[\s'";<>]/.test(str));
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;
  error = '';

  // Pour la modale de réinitialisation
  showForgotModal = false;
  resetEmail = '';
  resetMessage = '';

  constructor(private auth: AuthService, private router: Router) {
    this.resetFields();
  }

  resetFields() {
    this.email = '';
    this.password = '';
    this.rememberMe = false;
    this.error = '';
  }

  isFormValid(): boolean {
    // Email regex simple
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
    return (
      emailValid &&
      this.password.length > 0 &&
      isSafeInput(this.email) &&
      isSafeInput(this.password)
    );
  }

  onSubmit() {
    this.error = '';
    if (!this.isFormValid()) {
      this.error = 'Champs invalides ou dangereux.';
      this.password = '';
      return;
    }
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        if (!res.user) {
          this.error = 'Erreur de configuration du compte';
          return;
        }
        this.auth.setTokens(res.access_token, res.refresh_token, this.rememberMe, res.user);
        this.router.navigate(['/admin']);
      },
      error: () => {
        this.error = 'Identifiants incorrects';
        this.password = '';
      }
    });
  }

  openForgotModal(event: Event) {
    event.preventDefault();
    this.showForgotModal = true;
    this.resetEmail = '';
    this.resetMessage = '';
  }

  closeForgotModal() {
    this.showForgotModal = false;
    this.resetEmail = '';
    this.resetMessage = '';
  }

  onForgotSubmit() {
    if (!this.resetEmail) return;
    this.resetMessage = '';
    this.auth.forgotPassword(this.resetEmail).subscribe({
      next: (res: any) => {
        this.resetMessage = res?.message || 'Si cet email existe dans notre base, un lien de réinitialisation vous a été envoyé.';
      },
      error: () => {
        this.resetMessage = 'Erreur lors de la demande. Réessayez plus tard.';
      }
    });
  }
}

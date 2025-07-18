import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SecurityGuard implements CanActivate {
  constructor(
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Vérifier la sécurité de l'URL
    if (!this.isUrlSecure(state.url)) {
      console.warn('Security warning: Insecure URL access attempt', state.url);
      this.router.navigate(['/login']);
      return false;
    }

    // Vérifier les paramètres de route pour les injections
    if (route.params) {
      for (const [key, value] of Object.entries(route.params)) {
        if (typeof value === 'string' && this.containsMaliciousContent(value)) {
          console.warn('Security warning: Malicious content in route params', { key, value });
          this.router.navigate(['/login']);
          return false;
        }
      }
    }

    // Vérifier les query params
    if (route.queryParams) {
      for (const [key, value] of Object.entries(route.queryParams)) {
        if (typeof value === 'string' && this.containsMaliciousContent(value)) {
          console.warn('Security warning: Malicious content in query params', { key, value });
          this.router.navigate(['/login']);
          return false;
        }
      }
    }

    return true;
  }

  private isUrlSecure(url: string): boolean {
    // Vérifier que l'URL ne contient pas de contenu malveillant
    const maliciousPatterns = [
      /javascript:/i,
      /data:text\/html/i,
      /vbscript:/i,
      /<script/i,
      /<iframe/i,
      /on\w+\s*=/i,
      /expression\(/i,
      /eval\(/i
    ];

    return !maliciousPatterns.some(pattern => pattern.test(url));
  }

  private containsMaliciousContent(content: string): boolean {
    const maliciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/i,
      /javascript:/i,
      /data:text\/html/i,
      /vbscript:/i,
      /on\w+\s*=/i,
      /expression\(/i,
      /eval\(/i,
      /document\./i,
      /window\./i,
      /alert\(/i,
      /confirm\(/i,
      /prompt\(/i,
      /<object/i,
      /<embed/i,
      /<applet/i
    ];

    return maliciousPatterns.some(pattern => pattern.test(content));
  }
}

// Guard pour les routes sensibles
@Injectable({
  providedIn: 'root'
})
export class SensitiveRouteGuard implements CanActivate {
  constructor(
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Vérifier que l'utilisateur est authentifié
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    // Vérifier que le token n'est pas expiré
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (tokenData.exp && tokenData.exp < currentTime) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        this.router.navigate(['/login']);
        return false;
      }
    } catch (error) {
      console.warn('Security warning: Invalid token format');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
} 
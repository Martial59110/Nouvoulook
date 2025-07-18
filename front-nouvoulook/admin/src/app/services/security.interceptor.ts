import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable()
export class SecurityInterceptor implements HttpInterceptor {
  constructor(private sanitizer: DomSanitizer) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Sanitizer les données de sortie (requêtes)
    const sanitizedReq = this.sanitizeRequest(req);
    
    return next.handle(sanitizedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Log des erreurs de sécurité
        if (error.status === 403 || error.status === 401) {
          console.warn('Security warning: Unauthorized access attempt', error);
        }
        return throwError(() => error);
      })
    );
  }

  private sanitizeRequest(req: HttpRequest<any>): HttpRequest<any> {
    try {
      // Sanitizer les headers
      const sanitizedHeaders = this.sanitizeHeaders(req.headers);
      
      // Sanitizer le body si présent
      let sanitizedBody = req.body;
      if (req.body && typeof req.body === 'object') {
        sanitizedBody = this.sanitizeData(req.body);
      }

      return req.clone({
        headers: sanitizedHeaders,
        body: sanitizedBody
      });
    } catch (error) {
      console.warn('Security interceptor error:', error);
      // En cas d'erreur, retourner la requête originale
      return req;
    }
  }

  private sanitizeHeaders(headers: HttpHeaders): HttpHeaders {
    // Supprimer les headers potentiellement dangereux
    const dangerousHeaders = ['X-Forwarded-For', 'X-Real-IP', 'X-Forwarded-Host'];
    
    // Créer un nouvel objet HttpHeaders
    let sanitizedHeaders = new HttpHeaders();
    
    // Copier tous les headers existants sauf les dangereux
    headers.keys().forEach(key => {
      if (!dangerousHeaders.includes(key)) {
        const value = headers.get(key);
        if (value) {
          sanitizedHeaders = sanitizedHeaders.set(key, value);
        }
      }
    });

    return sanitizedHeaders;
  }

  private sanitizeData(data: any): any {
    try {
      if (typeof data === 'string') {
        return this.sanitizeString(data);
      } else if (Array.isArray(data)) {
        return data.map(item => this.sanitizeData(item));
      } else if (typeof data === 'object' && data !== null) {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(data)) {
          sanitized[key] = this.sanitizeData(value);
        }
        return sanitized;
      }
      return data;
    } catch (error) {
      console.warn('Data sanitization error:', error);
      return data; // Retourner les données originales en cas d'erreur
    }
  }

  private sanitizeString(str: string): string {
    if (!str) return str;
    
    // Supprimer les scripts et balises dangereuses
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/data:text\/html/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/expression\(/gi, '')
      .replace(/eval\(/gi, '')
      .replace(/document\./gi, '')
      .replace(/window\./gi, '')
      .replace(/alert\(/gi, '')
      .replace(/confirm\(/gi, '')
      .replace(/prompt\(/gi, '');
  }
}

// Service utilitaire pour la sécurité
@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  constructor(private sanitizer: DomSanitizer) {}

  // Sanitizer le HTML pour l'affichage sécurisé
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // Sanitizer les URLs
  sanitizeUrl(url: string): string {
    if (!url) return url;
    
    // Vérifier que l'URL est sécurisée
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    const urlObj = new URL(url, window.location.origin);
    
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return '';
    }
    
    return url;
  }

  // Valider les emails
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Valider les mots de passe
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Encoder les données pour éviter l'injection
  encodeData(data: string): string {
    return encodeURIComponent(data);
  }

  // Décoder les données de manière sécurisée
  decodeData(data: string): string {
    try {
      return decodeURIComponent(data);
    } catch {
      return '';
    }
  }
} 
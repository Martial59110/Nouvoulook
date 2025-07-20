import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UploadHttpService {
  private apiUrl = environment.apiUrl;

  constructor(
    private authService: AuthService
  ) {}

  uploadPicto(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = this.authService.getAccessToken();
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', `${this.apiUrl}/pictos/upload`, true);
      
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            resolve(xhr.responseText);
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(error);
          } catch (e) {
            reject({ status: xhr.status, message: xhr.statusText });
          }
        }
      };
      
      xhr.onerror = function() {
        reject({ status: xhr.status, message: xhr.statusText });
      };
      
      xhr.send(formData);
    });
  }
} 
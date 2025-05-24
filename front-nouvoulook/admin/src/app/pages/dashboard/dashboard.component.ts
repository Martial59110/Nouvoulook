import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLinkWithHref, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PermissionsService } from '../../services/permissions.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLinkWithHref, RouterLinkActive],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  firstname = '';
  lastname = '';
  userRole = '';
  permissionsLoaded = false;
  sidebarOpen = false;

  constructor(private auth: AuthService, private router: Router, private permissions: PermissionsService) {
    const user = this.auth.getUser();
    if (user) {
      this.firstname = user.firstname;
      this.lastname = user.lastname;
      this.userRole = user.role;
      this.permissionsLoaded = false;
      this.permissions.loadPermissionsForRole(user.role);
      this.permissions.getPermissions().subscribe(() => {
        this.permissionsLoaded = true;
      });
    }
  }

  hasAccess(resource: string): boolean {
    return this.permissions.hasAccess(resource);
  }

  isUserRoute(): boolean {
    return this.router.url.includes('/admin/users');
  }

  logout() {
    this.permissions.clear();
    this.auth.logout();
    this.router.navigate(['/']);
  }
} 
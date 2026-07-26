import { Injectable, inject } from '@angular/core';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

import { LocalStorageService } from '@shared/services';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  private router = inject(Router);
  private store = inject(LocalStorageService);


  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean {
    const currentUser = this.store.get('currentUser') as { roles?: { name: string }[] } | null;
    if (currentUser) {
      const userRole = currentUser.roles?.[0]?.name; // Optional chaining to safely access the role

      // Check if the route requires a specific role and if the user's role matches
      if (userRole && route.data['role'] && route.data['role'].indexOf(userRole) === -1) {
        // If the role does not match, navigate to the signin page
        this.router.navigate(['/authentication/signin']);
        return false;
      }
    }

    // Authentication is bypassed: allow access even without a signed-in user
    // so the app lands directly on /admin/dashboard/main.
    return true;
  }
}

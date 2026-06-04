import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-reject',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './reject.html',
  styleUrl: './reject.css'
})
export class RejectComponent {
  constructor(private router: Router) {}

  goBack() {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        const role = userInfo.userType.toLowerCase();
        if (role === 'admin') {
          this.router.navigate(['/admin']);
          return;
        } else if (role === 'doctor') {
          this.router.navigate(['/doctor']);
          return;
        } else if (role === 'staff') {
          this.router.navigate(['/staff-portal']);
          return;
        } else if (role === 'patient') {
          this.router.navigate(['/patient']);
          return;
        }
      } catch (e) {
        // Fallback
      }
    }
    this.router.navigate(['/home']);
  }
}

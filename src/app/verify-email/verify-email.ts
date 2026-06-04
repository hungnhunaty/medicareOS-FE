import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../Services/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-email.html',
})
export class VerifyEmailComponent implements OnInit {
  loading: boolean = true;
  success: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const email = params['email'];

      if (token && email) {
        this.verify(email, token);
      } else {
        this.loading = false;
        this.success = false;
        this.errorMessage = 'Thông tin xác minh không đầy đủ hoặc không hợp lệ.';
      }
    });
  }

  verify(email: string, token: string): void {
    this.authService.verifyEmail(email, token).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.success = true;
      },
      error: (err: any) => {
        this.loading = false;
        this.success = false;
        this.errorMessage = err.error?.message || 'Có lỗi xảy ra trong quá trình kích hoạt email.';
      }
    });
  }
}

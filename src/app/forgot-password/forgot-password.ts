import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../Services/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm!: FormGroup;
  loading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const email = this.forgotForm.value.email;
    this.authService.forgotPassword(email).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.successMessage = res.message || 'Mã đặt lại mật khẩu đã được gửi về Gmail của bạn!';
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.';
      }
    });
  }
}

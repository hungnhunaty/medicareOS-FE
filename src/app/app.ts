import { Component, signal, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('FE');
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private checkInterval: any;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Thiết lập bộ đếm thời gian chạy ngầm mỗi 5 giây
      this.checkInterval = setInterval(() => {
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
          try {
            const userInfo = JSON.parse(userInfoStr);
            if (userInfo && userInfo.token) {
              if (this.isTokenExpired(userInfo.token)) {
                console.warn('Token đã hết hạn. Đang tự động đăng xuất...');
                localStorage.removeItem('userInfo');
                this.router.navigate(['/login']);
              }
            }
          } catch (e) {
            // Bỏ qua lỗi parse
          }
        }
      }, 5000); // 5 giây kiểm tra 1 lần
    }
  }

  ngOnDestroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  private isTokenExpired(token: string): boolean {
    if (!token) return true;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(payloadBase64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      if (!payload || !payload.exp) return false;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return currentTime >= payload.exp;
    } catch (e) {
      return true; // Trả về đã hết hạn nếu token lỗi cấu trúc
    }
  }
}

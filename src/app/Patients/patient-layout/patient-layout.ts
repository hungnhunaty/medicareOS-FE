import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../Services/search.service';

@Component({
  selector: 'app-patient-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './patient-layout.html',
  styleUrl: './patient-layout.css',
})
export class PatientLayout implements OnInit {
  showProfileMenu: boolean = false;
  showNotificationMenu: boolean = false;
  isMobileMenuOpen: boolean = false;
  private _searchKeyword: string = '';

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  fullName: string = 'Bệnh nhân';
  patientCode: string = 'BN-00000';

  ngOnInit(): void {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        this.fullName = userInfo.fullName || userInfo.FullName || 'Bệnh nhân';
        const userId = userInfo.userId || userInfo.UserId || 0;
        this.patientCode = `BN-${userId.toString().padStart(5, '0')}`;
      } catch (e) {
        console.error('Lỗi phân tích userInfo:', e);
      }
    }
  }

  get searchKeyword(): string {
    return this._searchKeyword;
  }

  set searchKeyword(value: string) {
    this._searchKeyword = value;
    this.searchService.updateSearchKeyword(value);
  }

  notifications = [
    { id: 1, title: 'Lịch khám sắp tới', desc: 'Nhắc hẹn: Bạn có lịch khám vào 09:00 sáng mai.', time: '1 giờ trước', unread: true },
    { id: 2, title: 'Kết quả mới', desc: 'Bác sĩ đã cập nhật kết luận cho ca khám ngày 12/05.', time: '3 giờ trước', unread: true }
  ];

  constructor(private router: Router, private searchService: SearchService) {}

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) this.showNotificationMenu = false;
  }

  toggleNotificationMenu(): void {
    this.showNotificationMenu = !this.showNotificationMenu;
    if (this.showNotificationMenu) this.showProfileMenu = false;
  }

  logout(): void {
    if (confirm('Đăng xuất khỏi Cổng thông tin Bệnh nhân?')) {
      this.router.navigate(['/login']);
    }
  }
}

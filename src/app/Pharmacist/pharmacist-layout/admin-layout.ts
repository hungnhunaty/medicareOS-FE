import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../Services/search.service';

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
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

  get searchKeyword(): string {
    return this._searchKeyword;
  }

  set searchKeyword(value: string) {
    this._searchKeyword = value;
    this.searchService.updateSearchKeyword(value);
  }

  notifications = [
    { id: 1, title: 'Ca khám mới', desc: 'Bệnh nhân Nguyễn Văn A vừa đăng ký khám Nội.', time: '5 phút trước', unread: true },
    { id: 2, title: 'Cảnh báo kho dược', desc: 'Thuốc Amoxicillin 250mg sắp hết (còn 120 viên).', time: '1 giờ trước', unread: true },
    { id: 3, title: 'Báo cáo doanh thu', desc: 'Hệ thống đã tổng hợp doanh thu ngày hôm qua.', time: '3 giờ trước', unread: false }
  ];

  constructor(private router: Router, private searchService: SearchService) {}

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) {
      this.showNotificationMenu = false;
    }
  }

  toggleNotificationMenu(): void {
    this.showNotificationMenu = !this.showNotificationMenu;
    if (this.showNotificationMenu) {
      this.showProfileMenu = false;
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.unread = false);
  }

  get unreadCount(): number {
    return this.notifications.filter(n => n.unread).length;
  }

  logout(): void {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị?')) {
      this.router.navigate(['/login']);
    }
  }
}

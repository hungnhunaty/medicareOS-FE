import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../Services/search.service';
import { FormsModule } from '@angular/forms';
import { ProfileEditDialogComponent } from '../../Shared/profile-edit-dialog/profile-edit-dialog';

@Component({
  selector: 'app-staff-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule, ProfileEditDialogComponent],
  templateUrl: './staff-layout.html',
  styleUrl: './staff-layout.css',
})
export class StaffLayout {
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
    { id: 1, title: 'Yêu cầu thanh toán', desc: 'Bệnh nhân Lê Hoàng C đã hoàn thành khám, chờ thanh toán.', time: '2 phút trước', unread: true },
    { id: 2, title: 'Hàng đợi quá tải', desc: 'Phòng Nội tổng quát đang có hơn 10 người chờ.', time: '15 phút trước', unread: true }
  ];

  constructor(private router: Router, private searchService: SearchService) { }

  showProfileEditModal: boolean = false;
  
  currentUserProfile = {
    fullName: 'Nhân viên Lễ tân',
    email: 'staff@medicare.vn',
    phone: '',
    gender: 'Nữ',
    dob: '',
    address: ''
  };

  openProfileEdit(): void {
    this.showProfileEditModal = true;
    this.showProfileMenu = false;
  }

  onProfileUpdated(updatedData: any): void {
    this.currentUserProfile = { ...updatedData };
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) this.showNotificationMenu = false;
  }

  toggleNotificationMenu(): void {
    this.showNotificationMenu = !this.showNotificationMenu;
    if (this.showNotificationMenu) this.showProfileMenu = false;
  }

  logout(): void {
    if (confirm('Đăng xuất khỏi Cổng thông tin Nhân viên?')) {
      this.router.navigate(['/login']);
    }
  }
}

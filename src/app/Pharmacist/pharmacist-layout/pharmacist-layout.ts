import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../Services/search.service';
import { ProfileEditDialogComponent } from '../../Shared/profile-edit-dialog/profile-edit-dialog';

@Component({
  selector: 'app-pharmacist-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule, ProfileEditDialogComponent],
  templateUrl: './pharmacist-layout.html',
  styleUrl: './pharmacist-layout.css',
})
export class PharmacistLayout {
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
    { id: 1, title: 'Cảnh báo kho dược', desc: 'Thuốc Amoxicillin 250mg sắp hết (còn 120 viên).', time: '1 giờ trước', unread: true },
    { id: 2, title: 'Phiếu nhập kho mới', desc: 'Đã hoàn tất nhập 5000 vỉ Paracetamol.', time: 'Hôm qua', unread: false }
  ];

  constructor(private router: Router, private searchService: SearchService) {}

  showProfileEditModal: boolean = false;
  
  currentUserProfile = {
    fullName: 'QL Kho Dược',
    email: 'pharmacist@medicare.vn',
    phone: '',
    gender: 'Nam',
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

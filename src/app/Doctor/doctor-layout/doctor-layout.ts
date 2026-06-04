import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../Services/search.service';
import { FormsModule } from '@angular/forms';
import { DoctorPortalService } from '../../Services/Doctor/doctor-portal.service';
import { SignalRService } from '../../Services/signalr.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-doctor-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './doctor-layout.html',
  styleUrl: './doctor-layout.css',
})
export class DoctorLayout implements OnInit, OnDestroy {
  showProfileMenu: boolean = false;
  showNotificationMenu: boolean = false;
  isMobileMenuOpen: boolean = false;
  private _searchKeyword: string = '';
  private signalrSub?: Subscription;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  doctorId: number = 0;
  doctorInfo: any = null;
  showUpdateModal: boolean = false;

  updateData = {
    fullName: '',
    email: '',
    phone: '',
    specialty: ''
  };

  get searchKeyword(): string {
    return this._searchKeyword;
  }

  set searchKeyword(value: string) {
    this._searchKeyword = value;
    this.searchService.updateSearchKeyword(value);
  }

  notifications = [
    { id: 1, title: 'Ca khám cấp cứu mới', desc: 'Bệnh nhân vừa được chuyển vào hàng đợi ưu tiên.', time: 'Vừa xong', unread: true },
    { id: 2, title: 'Kết quả xét nghiệm', desc: 'Đã có kết quả sinh hóa máu của bệnh nhân Nguyễn Văn A.', time: '10 phút trước', unread: true },
    { id: 3, title: 'Lịch họp chuyên môn', desc: 'Họp giao ban toàn viện lúc 14:00 chiều nay.', time: '1 giờ trước', unread: false }
  ];

  constructor(
    private router: Router,
    private searchService: SearchService,
    private doctorService: DoctorPortalService,
    private signalrService: SignalRService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      this.doctorId = userInfo.userID;
      this.loadDoctorInfo();
    }

    this.signalrSub = this.signalrService.queueUpdated$.subscribe(() => {
      console.log('🔄 Layout Bác sĩ nhận tín hiệu QueueUpdated, tiến hành load lại thông tin...');
      this.loadDoctorInfo();
    });
  }

  ngOnDestroy(): void {
    if (this.signalrSub) {
      this.signalrSub.unsubscribe();
    }
  }

  loadDoctorInfo() {
    if (this.doctorId > 0) {
      this.doctorService.getDoctorInformation(this.doctorId).subscribe({
        next: (data) => {
          this.doctorInfo = data;
          this.cd.detectChanges();
        },
        error: (err) => console.error('Lỗi tải thông tin bác sĩ:', err)
      });
    }
  }

  openUpdateModal() {
    this.updateData = {
      fullName: this.doctorInfo?.fullName || '',
      email: this.doctorInfo?.email || '',
      phone: this.doctorInfo?.phone || '',
      specialty: this.doctorInfo?.specialty || ''
    };
    this.showUpdateModal = true;
    this.showProfileMenu = false;
  }

  closeUpdateModal() {
    this.showUpdateModal = false;
  }

  saveUpdate() {
    this.doctorService.updateDoctorInformation(this.doctorId, this.updateData).subscribe({
      next: (res) => {
        alert(res.message);
        this.loadDoctorInfo();
        this.closeUpdateModal();
      },
      error: (err) => {
        alert(err.error?.message || 'Lỗi cập nhật');
      }
    });
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) this.showNotificationMenu = false;
  }

  toggleNotificationMenu(): void {
    this.showNotificationMenu = !this.showNotificationMenu;
    if (this.showNotificationMenu) this.showProfileMenu = false;
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.unread = false);
  }

  get unreadCount(): number {
    return this.notifications.filter(n => n.unread).length;
  }

  logout(): void {
    if (confirm('Đăng xuất khỏi Cổng thông tin Bác sĩ?')) {
      localStorage.removeItem('userInfo');
      this.router.navigate(['/login']);
    }
  }
}

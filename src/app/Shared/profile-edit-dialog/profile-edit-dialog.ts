import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../Services/auth-service';

@Component({
  selector: 'app-profile-edit-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-edit-dialog.html',
  styleUrl: './profile-edit-dialog.css'
})
export class ProfileEditDialogComponent {
  @Input() showModal: boolean = false;
  // Truyền thông tin hiện tại vào
  @Input() currentUser: any = {
    fullName: '',
    email: '',
    phone: '',
    gender: 'Nam',
    dob: '',
    address: ''
  };

  @Output() close = new EventEmitter<void>();
  @Output() profileUpdated = new EventEmitter<any>();

  constructor(private authService: AuthService) {}

  closeModal() {
    this.close.emit();
  }

  saveProfile() {
    if (!this.currentUser.fullName || !this.currentUser.email) {
      alert("Tên và Email không được để trống.");
      return;
    }

    this.authService.updateProfile(this.currentUser).subscribe({
      next: (res: any) => {
        alert(res.message || "Cập nhật thành công!");
        this.profileUpdated.emit(this.currentUser);
        this.closeModal();
      },
      error: (err) => {
        alert("Lỗi cập nhật: " + (err.error?.message || "Không xác định"));
      }
    });
  }
}

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminStaffService } from '../../Services/Admin/admin-staff.service';
import { SearchService } from '../../Services/search.service';
import { Subscription } from 'rxjs';

interface StaffMember {
  userId?: number;
  userName?: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: string;
  specialty?: string;
  password?: string;
}

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff.html',
  styleUrl: './staff.css',
})
export class Staff implements OnInit, OnDestroy {
  // Bộ lọc
  searchKeyword: string = '';
  selectedDepartment: string = 'Tất cả phòng ban';
  private searchSub?: Subscription;

  // State Modal
  showModal: boolean = false;
  modalMode: 'add' | 'edit' = 'add';
  currentStaff: StaffMember = this.getInitialStaff();

  // Danh sách nhân sự thực tế
  staffList: StaffMember[] = [];

  constructor(
    private adminStaffService: AdminStaffService,
    private searchService: SearchService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    console.log('Staff Component được khởi tạo (ngOnInit)');
    this.loadStaff();
    this.searchSub = this.searchService.currentSearchKeyword.subscribe(keyword => {
      this.searchKeyword = keyword;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.searchSub) this.searchSub.unsubscribe();
  }

  loadStaff(): void {
    this.adminStaffService.getAllStaff().subscribe({
      next: (data: any[]) => {
        console.log('Dữ liệu nhân viên nhận được từ API:', data);
        // Map thuộc tính 'id' từ API thành 'code' cho Frontend
        this.staffList = data.map(s => ({
          ...s,
          code: s.id || s.code || 'N/A'
        }));
        this.cd.detectChanges();
      },
      error: (err) => console.error('Lỗi tải danh sách nhân sự:', err)
    });
  }

  getInitialStaff(): StaffMember {
    return {
      userName: '',
      code: '',
      name: '',
      email: '',
      phone: '',
      role: 'Bác sĩ',
      department: 'Khoa Nội Tổng Hợp',
      status: 'Hoạt động',
      specialty: '',
      password: 'staff123'
    };
  }

  // Danh sách nhân sự sau khi áp dụng bộ lọc
  get filteredStaffList(): StaffMember[] {
    return this.staffList.filter(staff => {
      const name = staff.name || '';
      const code = staff.code || '';
      const email = staff.email || '';

      const matchKeyword = name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        code.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        email.toLowerCase().includes(this.searchKeyword.toLowerCase());

      const matchDept = this.selectedDepartment === 'Tất cả phòng ban' ||
        (staff.department || '').toLowerCase() === this.selectedDepartment.toLowerCase();

      return matchKeyword && matchDept;
    });
  }

  // Mở modal thêm mới
  openAddModal(): void {
    this.modalMode = 'add';
    this.currentStaff = this.getInitialStaff();
    this.currentStaff.code = 'Tự động tạo';
    this.showModal = true;
  }

  // Mở modal chỉnh sửa
  openEditModal(staff: StaffMember): void {
    this.modalMode = 'edit';
    this.currentStaff = { ...staff };
    this.showModal = true;
  }

  // Đóng modal
  closeModal(): void {
    this.showModal = false;
  }

  // Lưu thông tin nhân sự (Thêm mới hoặc Cập nhật)
  saveStaff(): void {
    if (!this.currentStaff.name.trim() || !this.currentStaff.email.trim()) {
      alert('Vui lòng điền đầy đủ Tên và Email nhân sự!');
      return;
    }

    if (this.modalMode === 'add') {
      if (!this.currentStaff.userName?.trim()) {
        alert('Vui lòng nhập Tên đăng nhập!');
        return;
      }

      const createDto = {
        userName: this.currentStaff.userName.trim(),
        fullName: this.currentStaff.name,
        email: this.currentStaff.email,
        phone: this.currentStaff.phone,
        role: this.currentStaff.role,
        department: this.currentStaff.department,
        status: this.currentStaff.status,
        baseSalary: 15000000,
        specialty: this.currentStaff.role.includes('Bác sĩ') ? 'Đa khoa' : '',
        password: this.currentStaff.password
      };

      this.adminStaffService.createStaff(createDto).subscribe({
        next: () => {
          this.loadStaff();
          this.closeModal();
        },
        error: (err) => alert('Lỗi khi thêm nhân sự: ' + (err.error?.message || 'Không rõ nguyên nhân'))
      });
    } else {
      if (this.currentStaff.userId) {
        const updateDto = {
          fullName: this.currentStaff.name,
          email: this.currentStaff.email,
          phone: this.currentStaff.phone,
          department: this.currentStaff.department,
          status: this.currentStaff.status,
          baseSalary: 0, // 0 nghĩa là không cập nhật lương
          specialty: this.currentStaff.specialty,
          password: this.currentStaff.password
        };

        this.adminStaffService.updateStaff(this.currentStaff.userId, updateDto).subscribe({
          next: () => {
            this.loadStaff();
            this.closeModal();
          },
          error: (err) => alert('Lỗi khi cập nhật nhân sự: ' + (err.error?.message || 'Không rõ nguyên nhân'))
        });
      }
    }
  }

  // Đổi trạng thái nhanh
  toggleStatus(staff: StaffMember): void {
    if (!staff.userId) return;

    let nextStatus = '';
    if (staff.status === 'Hoạt động') nextStatus = 'Nghỉ phép';
    else if (staff.status === 'Nghỉ phép') nextStatus = 'Đã khóa';
    else nextStatus = 'Hoạt động';

    const updateDto = {
      fullName: staff.name,
      email: staff.email,
      phone: staff.phone,
      department: staff.department,
      status: nextStatus,
      baseSalary: 0,
      specialty: staff.specialty
    };

    this.adminStaffService.updateStaff(staff.userId, updateDto).subscribe({
      next: () => this.loadStaff(),
      error: (err) => console.error('Lỗi đổi trạng thái:', err)
    });
  }

  // Xóa/Khóa nhân viên
  deleteStaff(staff: StaffMember): void {
    if (confirm(`Bạn có chắc chắn muốn khóa nhân viên ${staff.name} (${staff.code})?`)) {
      if (staff.userId) {
        this.adminStaffService.deleteStaff(staff.userId).subscribe({
          next: () => this.loadStaff(),
          error: (err) => alert('Lỗi khi khóa nhân viên: ' + (err.error?.message || 'Không rõ nguyên nhân'))
        });
      }
    }
  }
}


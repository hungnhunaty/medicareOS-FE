import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminRoomService } from '../../Services/Admin/admin-room.service';
import { SearchService } from '../../Services/search.service';
import { Subscription } from 'rxjs';

interface Room {
  roomId: number;
  roomName: string;
  departmentId: number;
  departmentName: string;
  isActive: boolean;
  status: string;
  assignedDoctorId?: number;
  assignedDoctorName?: string;
  assignedDoctorDepartment?: string;
}

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rooms.html',
  styleUrl: './rooms.css',
})
export class Rooms implements OnInit, OnDestroy {
  // Bộ lọc
  searchKeyword: string = '';
  selectedDepartment: string = 'Tất cả khoa';
  selectedStatus: string = 'Tất cả trạng thái';
  private searchSub?: Subscription;

  // State Modal
  showModal: boolean = false;
  modalMode: 'add' | 'edit' = 'add';
  currentRoom: Room = this.getInitialRoom();

  // Danh sách phòng khám
  roomList: Room[] = [];
  // Danh sách khoa (departments)
  departmentList: { departmentId: number; name: string }[] = [];

  constructor(
    private adminRoomService: AdminRoomService,
    private searchService: SearchService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadRooms();
    this.loadDepartments();
    this.searchSub = this.searchService.currentSearchKeyword.subscribe(keyword => {
      this.searchKeyword = keyword;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.searchSub) this.searchSub.unsubscribe();
  }

  loadRooms(): void {
    this.adminRoomService.getAllRooms().subscribe({
      next: (data: any[]) => {
        this.roomList = data.map(r => ({
          roomId: r.roomId,
          roomName: r.roomName || '',
          departmentId: r.departmentId,
          departmentName: r.departmentName || '',
          isActive: r.isActive,
          status: r.status || (r.isActive ? 'Trống' : 'Ngưng hoạt động'),
          assignedDoctorId: r.assignedDoctorId || null,
          assignedDoctorName: r.assignedDoctorName || '',
          assignedDoctorDepartment: r.assignedDoctorDepartment || ''
        }));
        this.cd.detectChanges();
      },
      error: (err) => console.error('Lỗi tải danh sách phòng khám:', err)
    });
  }

  loadDepartments(): void {
    this.adminRoomService.getAllDepartments().subscribe({
      next: (data: any[]) => {
        this.departmentList = data.map(d => ({
          departmentId: d.departmentId,
          name: d.name
        }));
        this.cd.detectChanges();
      },
      error: (err) => console.error('Lỗi tải danh sách khoa:', err)
    });
  }

  getInitialRoom(): Room {
    return {
      roomId: 0,
      roomName: '',
      departmentId: 1,
      departmentName: '',
      isActive: true,
      status: 'Trống',
      assignedDoctorId: undefined,
      assignedDoctorName: '',
      assignedDoctorDepartment: ''
    };
  }

  // Danh sách phòng sau khi áp dụng bộ lọc
  get filteredRoomList(): Room[] {
    return this.roomList.filter(room => {
      const name = room.roomName || '';
      const doctor = room.assignedDoctorName || '';
      const dept = room.departmentName || '';

      const matchKeyword = name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        doctor.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        dept.toLowerCase().includes(this.searchKeyword.toLowerCase());

      const matchDept = this.selectedDepartment === 'Tất cả khoa' ||
        room.departmentName === this.selectedDepartment;

      const matchStatus = this.selectedStatus === 'Tất cả trạng thái' ||
        room.status === this.selectedStatus;

      return matchKeyword && matchDept && matchStatus;
    });
  }

  // Thống kê
  get totalRooms(): number { return this.roomList.length; }
  get availableRooms(): number { return this.roomList.filter(r => r.status === 'Trống').length; }
  get occupiedRooms(): number { return this.roomList.filter(r => r.status === 'Đang sử dụng').length; }
  get inactiveRooms(): number { return this.roomList.filter(r => r.status === 'Ngưng hoạt động').length; }

  // Danh sách khoa duy nhất từ room
  get uniqueDepartments(): string[] {
    return [...new Set(this.roomList.map(r => r.departmentName).filter(d => d))];
  }

  // Mở modal thêm mới
  openAddModal(): void {
    this.modalMode = 'add';
    this.currentRoom = this.getInitialRoom();
    if (this.departmentList.length > 0) {
      this.currentRoom.departmentId = this.departmentList[0].departmentId;
    }
    this.showModal = true;
  }

  // Mở modal chỉnh sửa
  openEditModal(room: Room): void {
    this.modalMode = 'edit';
    this.currentRoom = { ...room };
    this.showModal = true;
  }

  // Đóng modal
  closeModal(): void {
    this.showModal = false;
  }

  // Lưu thông tin phòng (Thêm mới hoặc Cập nhật)
  saveRoom(): void {
    if (!this.currentRoom.roomName.trim()) {
      alert('Vui lòng nhập tên phòng khám!');
      return;
    }

    if (this.modalMode === 'add') {
      const createDto = {
        roomName: this.currentRoom.roomName.trim(),
        departmentId: this.currentRoom.departmentId
      };

      this.adminRoomService.createRoom(createDto).subscribe({
        next: () => {
          this.loadRooms();
          this.closeModal();
        },
        error: (err) => alert('Lỗi khi thêm phòng: ' + (err.error?.message || 'Không rõ nguyên nhân'))
      });
    } else {
      const updateDto = {
        roomName: this.currentRoom.roomName.trim(),
        departmentId: this.currentRoom.departmentId,
        isActive: this.currentRoom.isActive
      };

      this.adminRoomService.updateRoom(this.currentRoom.roomId, updateDto).subscribe({
        next: () => {
          this.loadRooms();
          this.closeModal();
        },
        error: (err) => alert('Lỗi khi cập nhật phòng: ' + (err.error?.message || 'Không rõ nguyên nhân'))
      });
    }
  }

  // Đổi trạng thái nhanh (Active/Inactive)
  toggleActive(room: Room): void {
    const updateDto = {
      roomName: room.roomName,
      departmentId: room.departmentId,
      isActive: !room.isActive
    };

    this.adminRoomService.updateRoom(room.roomId, updateDto).subscribe({
      next: () => this.loadRooms(),
      error: (err) => console.error('Lỗi đổi trạng thái:', err)
    });
  }

  // Xóa phòng
  deleteRoom(room: Room): void {
    if (confirm(`Bạn có chắc chắn muốn xóa phòng "${room.roomName}"?`)) {
      this.adminRoomService.deleteRoom(room.roomId).subscribe({
        next: () => this.loadRooms(),
        error: (err) => alert('Lỗi khi xóa phòng: ' + (err.error?.message || 'Không rõ nguyên nhân'))
      });
    }
  }

  // Reset bộ lọc
  clearFilters(): void {
    this.searchKeyword = '';
    this.selectedDepartment = 'Tất cả khoa';
    this.selectedStatus = 'Tất cả trạng thái';
  }

  get hasActiveFilters(): boolean {
    return !!this.searchKeyword ||
      this.selectedDepartment !== 'Tất cả khoa' ||
      this.selectedStatus !== 'Tất cả trạng thái';
  }
}

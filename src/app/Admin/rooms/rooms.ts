import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminRoomService } from '../../Services/Admin/admin-room.service';
import { AdminStaffService } from '../../Services/Admin/admin-staff.service';
import { SearchService } from '../../Services/search.service';
import { Subscription } from 'rxjs';

interface Room {
  roomId: number;
  roomName: string;
  roomType: string;
  floor: number;
  status: string;
  description: string;
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
  selectedFloor: string = 'Tất cả tầng';
  selectedType: string = 'Tất cả loại phòng';
  selectedStatus: string = 'Tất cả trạng thái';
  private searchSub?: Subscription;

  // State Modal
  showModal: boolean = false;
  modalMode: 'add' | 'edit' = 'add';
  currentRoom: Room = this.getInitialRoom();

  // Danh sách phòng khám
  roomList: Room[] = [];
  // Danh sách bác sĩ (để gán phòng)
  doctorList: any[] = [];

  constructor(
    private adminRoomService: AdminRoomService,
    private adminStaffService: AdminStaffService,
    private searchService: SearchService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadRooms();
    this.loadDoctors();
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
          roomType: r.roomType || 'Phòng khám',
          floor: r.floor || 1,
          status: r.status || 'Trống',
          description: r.description || '',
          assignedDoctorId: r.assignedDoctorId || null,
          assignedDoctorName: r.assignedDoctorName || '',
          assignedDoctorDepartment: r.assignedDoctorDepartment || ''
        }));
        this.cd.detectChanges();
      },
      error: (err) => console.error('Lỗi tải danh sách phòng khám:', err)
    });
  }

  loadDoctors(): void {
    this.adminStaffService.getAllStaff().subscribe({
      next: (data: any[]) => {
        this.doctorList = data.filter(s => s.role === 'Bác sĩ' && s.status === 'Hoạt động');
        this.cd.detectChanges();
      },
      error: (err) => console.error('Lỗi tải danh sách bác sĩ:', err)
    });
  }

  getInitialRoom(): Room {
    return {
      roomId: 0,
      roomName: '',
      roomType: 'Phòng khám',
      floor: 1,
      status: 'Trống',
      description: '',
      assignedDoctorId: undefined,
      assignedDoctorName: '',
      assignedDoctorDepartment: ''
    };
  }

  // Lấy danh sách tầng duy nhất
  get uniqueFloors(): number[] {
    const floors = this.roomList.map(r => r.floor);
    return [...new Set(floors)].sort((a, b) => a - b);
  }

  // Danh sách phòng sau khi áp dụng bộ lọc
  get filteredRoomList(): Room[] {
    return this.roomList.filter(room => {
      const name = room.roomName || '';
      const doctor = room.assignedDoctorName || '';
      const desc = room.description || '';

      const matchKeyword = name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        doctor.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        desc.toLowerCase().includes(this.searchKeyword.toLowerCase());

      const matchFloor = this.selectedFloor === 'Tất cả tầng' ||
        room.floor === parseInt(this.selectedFloor);

      const matchType = this.selectedType === 'Tất cả loại phòng' ||
        room.roomType === this.selectedType;

      const matchStatus = this.selectedStatus === 'Tất cả trạng thái' ||
        room.status === this.selectedStatus;

      return matchKeyword && matchFloor && matchType && matchStatus;
    });
  }

  // Thống kê
  get totalRooms(): number { return this.roomList.length; }
  get availableRooms(): number { return this.roomList.filter(r => r.status === 'Trống').length; }
  get occupiedRooms(): number { return this.roomList.filter(r => r.status === 'Đang sử dụng').length; }
  get maintenanceRooms(): number { return this.roomList.filter(r => r.status === 'Bảo trì').length; }

  // Mở modal thêm mới
  openAddModal(): void {
    this.modalMode = 'add';
    this.currentRoom = this.getInitialRoom();
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

    const roomDto = {
      roomName: this.currentRoom.roomName.trim(),
      roomType: this.currentRoom.roomType,
      floor: this.currentRoom.floor,
      status: this.currentRoom.status,
      description: this.currentRoom.description,
      assignedDoctorId: this.currentRoom.assignedDoctorId || null
    };

    if (this.modalMode === 'add') {
      this.adminRoomService.createRoom(roomDto).subscribe({
        next: () => {
          this.loadRooms();
          this.closeModal();
        },
        error: (err) => alert('Lỗi khi thêm phòng: ' + (err.error?.message || 'Không rõ nguyên nhân'))
      });
    } else {
      this.adminRoomService.updateRoom(this.currentRoom.roomId, roomDto).subscribe({
        next: () => {
          this.loadRooms();
          this.closeModal();
        },
        error: (err) => alert('Lỗi khi cập nhật phòng: ' + (err.error?.message || 'Không rõ nguyên nhân'))
      });
    }
  }

  // Đổi trạng thái nhanh
  toggleStatus(room: Room): void {
    let nextStatus = '';
    if (room.status === 'Trống') nextStatus = 'Đang sử dụng';
    else if (room.status === 'Đang sử dụng') nextStatus = 'Bảo trì';
    else nextStatus = 'Trống';

    const updateDto = {
      roomName: room.roomName,
      roomType: room.roomType,
      floor: room.floor,
      status: nextStatus,
      description: room.description,
      assignedDoctorId: room.assignedDoctorId || null
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

  // Helper: lấy tên bác sĩ theo ID
  getDoctorName(doctorId: number | undefined): string {
    if (!doctorId) return '';
    const doc = this.doctorList.find(d => d.userId === doctorId);
    return doc ? doc.name : '';
  }

  // Helper: icon trạng thái
  getStatusIcon(status: string): string {
    switch (status) {
      case 'Trống': return '🟢';
      case 'Đang sử dụng': return '🔵';
      case 'Bảo trì': return '🟡';
      default: return '⚪';
    }
  }

  // Helper: icon loại phòng
  getRoomTypeIcon(type: string): string {
    switch (type) {
      case 'Phòng khám': return '🩺';
      case 'Phòng thủ thuật': return '💉';
      case 'Phòng xét nghiệm': return '🧪';
      case 'Phòng chẩn đoán hình ảnh': return '📷';
      case 'Phòng cấp cứu': return '🚨';
      default: return '🏥';
    }
  }

  // Reset bộ lọc
  clearFilters(): void {
    this.searchKeyword = '';
    this.selectedFloor = 'Tất cả tầng';
    this.selectedType = 'Tất cả loại phòng';
    this.selectedStatus = 'Tất cả trạng thái';
  }

  get hasActiveFilters(): boolean {
    return !!this.searchKeyword ||
      this.selectedFloor !== 'Tất cả tầng' ||
      this.selectedType !== 'Tất cả loại phòng' ||
      this.selectedStatus !== 'Tất cả trạng thái';
  }
}

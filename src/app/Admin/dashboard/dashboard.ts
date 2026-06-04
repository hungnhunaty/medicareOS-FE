import { CommonModule } from '@angular/common';
import { AdminDashboardService } from '../../Services/Admin/admin-dashboard.service';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { SignalRService } from '../../Services/signalr.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  today: Date = new Date();

  // Thống kê tổng quan trong ngày
  public todayStats = {
    totalPatients: 0,
    waitingQueues: 0,
    completedExaminations: 0,
    todayRevenue: 0
  };

  // Trạng thái modal
  showAddQueueModal: boolean = false;
  newQueue = {
    patientName: '',
    phone: '',
    symptoms: '',
    department: 'Khoa Cấp Cứu',
    status: 'Ưu tiên cao'
  };

  // Danh sách hàng đợi trực tiếp (Real-time Queues)
  public activeQueues: any[] = [];
  public selectedDepartment: string = 'Tất cả Khoa';

  // Danh sách phân bổ khoa phòng
  public departmentStats: any[] = [];

  // Vật tư sắp hết
  public lowStocks: any[] = [];

  private signalrSub!: Subscription;

  constructor(
    private adminDashboardService: AdminDashboardService,
    private signalrService: SignalRService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadStats();
    this.loadQueues();

    this.signalrSub = this.signalrService.queueUpdated$.subscribe(() => {
      console.log('🔄 Admin Dashboard nhận tín hiệu QueueUpdated, tiến hành load lại...');
      this.loadStats();
      this.loadQueues();
    });
  }

  ngOnDestroy(): void {
    if (this.signalrSub) {
      this.signalrSub.unsubscribe();
    }
  }

  loadStats(): void {
    this.adminDashboardService.getStats().subscribe({
      next: (data: any) => {
        this.todayStats = {
          totalPatients: data.totalPatients || 0,
          waitingQueues: data.waitingExams || 0,
          completedExaminations: data.completedExamsToday || 0,
          todayRevenue: data.totalRevenueToday || 0
        };
        this.departmentStats = (data.departmentStats || []).map((d: any) => ({
          name: d.name,
          patientsCount: d.count,
          capacity: d.capacity,
          clinics: d.clinics
        }));
        this.lowStocks = (data.lowStockAlerts || []).map((m: any) => ({
          name: m.name,
          quantity: m.quantity
        }));
        this.cd.detectChanges();
      },
      error: (err) => console.error('Lỗi tải thống kê Dashboard:', err)
    });
  }

  loadQueues(): void {
    this.adminDashboardService.getActiveQueues().subscribe({
      next: (data) => {
        this.activeQueues = data;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Lỗi tải hàng đợi:', err)
    });
  }

  get filteredQueues(): any[] {
    if (this.selectedDepartment === 'Tất cả Khoa') {
      return this.activeQueues;
    }
    return this.activeQueues.filter(q => q.department === this.selectedDepartment);
  }

  // Format tiền tệ VNĐ
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  openAddQueueModal(): void {
    this.newQueue = {
      patientName: '',
      phone: '',
      symptoms: '',
      department: 'Khoa Cấp Cứu',
      status: 'Ưu tiên cao'
    };
    this.showAddQueueModal = true;
  }

  closeAddQueueModal(): void {
    this.showAddQueueModal = false;
  }

  saveNewQueue(): void {
    if (!this.newQueue.patientName.trim() || !this.newQueue.phone.trim()) {
      alert('Vui lòng nhập tên và số điện thoại bệnh nhân cấp cứu!');
      return;
    }

    this.adminDashboardService.createEmergencyExam(
      this.newQueue.patientName.trim(),
      this.newQueue.phone.trim(),
      this.newQueue.symptoms
    ).subscribe({
      next: () => {
        this.loadQueues();
        this.loadStats();
        this.closeAddQueueModal();
      },
      error: (err) => alert('Lỗi khi tạo ca cấp cứu: ' + (err.error?.message || 'Không rõ nguyên nhân'))
    });
  }

  exportReport(): void {
    alert('Đang xuất báo cáo tổng quan ngày hôm nay ra file Excel/PDF...');
  }

  updateQueueStatus(queue: any, newStatus: string): void {
    if (queue.examinationId) {
      this.adminDashboardService.updateQueueStatus(queue.examinationId, newStatus).subscribe({
        next: () => {
          this.loadQueues();
          this.loadStats();
        },
        error: (err) => alert('Lỗi cập nhật trạng thái: ' + (err.error?.message || 'Không rõ nguyên nhân'))
      });
    }
  }
}


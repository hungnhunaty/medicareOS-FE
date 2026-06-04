import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminServiceService } from '../../Services/Admin/admin-service.service';
import { SearchService } from '../../Services/search.service';
import { Subscription } from 'rxjs';

interface MedicalService {
  serviceId?: number;
  code: string;
  name: string;
  category: string;
  price: number;
  status: string;
  description: string;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './services.html',
  styleUrl: './services.css',
})
export class Services implements OnInit, OnDestroy {
  // Lọc & tra cứu
  searchKeyword: string = '';
  selectedCategory: string = 'Tất cả nhóm dịch vụ';
  private searchSub?: Subscription;

  // State Modal
  showModal: boolean = false;
  modalMode: 'add' | 'edit' = 'add';
  currentService: MedicalService = this.getInitialService();

  // Danh sách dịch vụ thực tế
  servicesList: MedicalService[] = [];

  constructor(
    private adminServiceService: AdminServiceService, 
    private searchService: SearchService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadServices();
    this.searchSub = this.searchService.currentSearchKeyword.subscribe(keyword => {
      this.searchKeyword = keyword;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.searchSub) this.searchSub.unsubscribe();
  }

  loadServices(): void {
    this.adminServiceService.getAllServices().subscribe({
      next: (data) => {
        this.servicesList = data.map(s => ({
          serviceId: s.serviceId,
          code: s.id,
          name: s.name,
          category: s.category,
          price: s.price,
          status: s.status,
          description: s.description
        }));
        this.cd.detectChanges();
      },
      error: (err) => console.error('Lỗi tải danh sách dịch vụ:', err)
    });
  }

  getInitialService(): MedicalService {
    return {
      code: '',
      name: '',
      category: 'Khám bệnh',
      price: 150000,
      status: 'Đang áp dụng',
      description: ''
    };
  }

  // Lấy danh sách đã lọc
  get filteredServices(): MedicalService[] {
    return this.servicesList.filter(s => {
      const name = s.name || '';
      const code = s.code || '';
      
      const matchKeyword = name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        code.toLowerCase().includes(this.searchKeyword.toLowerCase());
      const matchCat = this.selectedCategory === 'Tất cả nhóm dịch vụ' || s.category === this.selectedCategory;
      return matchKeyword && matchCat;
    });
  }

  // Mở modal thêm mới
  openAddModal(): void {
    this.modalMode = 'add';
    this.currentService = this.getInitialService();
    this.currentService.code = 'Tự động tạo';
    this.showModal = true;
  }

  // Mở modal sửa
  openEditModal(service: MedicalService): void {
    this.modalMode = 'edit';
    this.currentService = { ...service };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  // Lưu dịch vụ
  saveService(): void {
    if (!this.currentService.name.trim() || this.currentService.price <= 0) {
      alert('Vui lòng điền tên dịch vụ và giá trị đơn giá hợp lệ!');
      return;
    }

    if (this.modalMode === 'add') {
      this.adminServiceService.createService(this.currentService).subscribe({
        next: () => {
          this.loadServices();
          this.closeModal();
        },
        error: (err) => alert('Lỗi khi thêm dịch vụ: ' + (err.error?.message || 'Không rõ nguyên nhân'))
      });
    } else {
      if (this.currentService.serviceId) {
        this.adminServiceService.updateService(this.currentService.serviceId, this.currentService).subscribe({
          next: () => {
            this.loadServices();
            this.closeModal();
          },
          error: (err) => alert('Lỗi khi cập nhật dịch vụ: ' + (err.error?.message || 'Không rõ nguyên nhân'))
        });
      }
    }
  }

  // Đổi trạng thái trực tiếp
  toggleStatus(service: MedicalService): void {
    if (service.serviceId) {
      const nextStatus = service.status === 'Đang áp dụng' ? 'Tạm ngưng' : 'Đang áp dụng';
      const updatedData = { ...service, status: nextStatus };
      this.adminServiceService.updateService(service.serviceId, updatedData).subscribe({
        next: () => this.loadServices(),
        error: (err) => console.error('Lỗi đổi trạng thái:', err)
      });
    }
  }

  // Xóa dịch vụ
  deleteService(service: MedicalService): void {
    if (confirm(`Bạn có chắc chắn muốn gỡ bỏ dịch vụ ${service.code} khỏi bảng giá niêm yết?`)) {
      if (service.serviceId) {
        this.adminServiceService.deleteService(service.serviceId).subscribe({
          next: () => {
            this.loadServices();
          },
          error: (err) => {
            alert(err.error?.message || 'Không thể xóa dịch vụ này.');
          }
        });
      }
    }
  }
}



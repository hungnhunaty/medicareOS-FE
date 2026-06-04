import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { AdminMedicationService } from '../../Services/Admin/admin-medication.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../Services/search.service';
import { Subscription } from 'rxjs';

interface MedicationItem {
  medicationId?: number;
  code: string;
  name: string;
  ingredient: string;
  unit: string;
  price: number;
  quantity: number;
  status: string;
}

@Component({
  selector: 'app-medications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medications.html',
  styleUrl: './medications.css',
})
export class Medications implements OnInit, OnDestroy {
  // Tìm kiếm & Lọc
  searchKeyword: string = '';
  filterStatus: string = 'Tất cả trạng thái';
  private searchSub?: Subscription;

  // State Modal Thêm/Sửa Thuốc
  showModal: boolean = false;
  modalMode: 'add' | 'edit' = 'add';
  currentMedication: MedicationItem = this.getInitialMedication();

  // State Modal Nhập Kho
  showStockModal: boolean = false;
  selectedMedForStock: MedicationItem | null = null;
  addedQuantity: number = 500;

  // Danh sách thuốc thực tế
  medicationsList: MedicationItem[] = [];

  constructor(
    private adminMedicationService: AdminMedicationService, 
    private searchService: SearchService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadMedications();
    this.searchSub = this.searchService.currentSearchKeyword.subscribe(keyword => {
      this.searchKeyword = keyword;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.searchSub) this.searchSub.unsubscribe();
  }

  loadMedications(): void {
    this.adminMedicationService.getAllMedications().subscribe({
      next: (data: any[]) => {
        console.log('Dữ liệu thuốc từ API:', data);
        this.medicationsList = data.map(m => ({
          medicationId: m.medicationId,
          code: m.id, // Backend trả về 'id' cho mã MED-xxx
          name: m.name,
          ingredient: m.activeIngredient || 'N/A', // Backend trả về 'activeIngredient'
          unit: m.unit || 'Viên',
          price: m.unitPrice || 0, // Backend trả về 'unitPrice'
          quantity: m.stock !== undefined ? m.stock : 0, // Backend trả về 'stock'
          status: (m.stock !== undefined ? m.stock : 0) < 300 ? 'Sắp hết' : 'Ổn định'
        }));
        this.cd.detectChanges();
      },
      error: (err) => console.error('Lỗi tải danh sách thuốc:', err)
    });
  }

  getInitialMedication(): MedicationItem {
    return {
      code: '',
      name: '',
      ingredient: '',
      unit: 'Viên',
      price: 1000,
      quantity: 1000,
      status: 'Ổn định'
    };
  }

  // Lọc danh sách
  get filteredMedications(): MedicationItem[] {
    return this.medicationsList.filter(m => {
      const name = m.name || '';
      const ingredient = m.ingredient || '';
      const code = m.code || '';
      
      const matchKey = name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        ingredient.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        code.toLowerCase().includes(this.searchKeyword.toLowerCase());

      const matchStat = this.filterStatus === 'Tất cả trạng thái' || m.status === this.filterStatus;

      return matchKey && matchStat;
    });
  }

  // Mở modal thêm thuốc
  openAddModal(): void {
    this.modalMode = 'add';
    this.currentMedication = this.getInitialMedication();
    this.currentMedication.code = 'Tự động tạo';
    this.showModal = true;
  }

  // Mở modal sửa thuốc
  openEditModal(med: MedicationItem): void {
    this.modalMode = 'edit';
    this.currentMedication = { ...med };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveMedication(): void {
    if (!this.currentMedication.name.trim() || !this.currentMedication.ingredient.trim()) {
      alert('Vui lòng điền Tên thuốc và Hoạt chất thành phần!');
      return;
    }

    if (this.modalMode === 'add') {
      const createDto = {
        name: this.currentMedication.name,
        activeIngredient: this.currentMedication.ingredient,
        unit: this.currentMedication.unit,
        unitPrice: this.currentMedication.price,
        stock: this.currentMedication.quantity
      };

      this.adminMedicationService.createMedication(createDto).subscribe({
        next: () => {
          this.loadMedications();
          this.closeModal();
        },
        error: (err) => alert('Lỗi khi thêm thuốc: ' + (err.error?.message || 'Không rõ nguyên nhân'))
      });
    } else {
      if (this.currentMedication.medicationId) {
        const updateDto = {
          name: this.currentMedication.name,
          activeIngredient: this.currentMedication.ingredient,
          unit: this.currentMedication.unit,
          unitPrice: this.currentMedication.price,
          stock: this.currentMedication.quantity
        };

        this.adminMedicationService.updateMedication(this.currentMedication.medicationId, updateDto).subscribe({
          next: () => {
            this.loadMedications();
            this.closeModal();
          },
          error: (err) => alert('Lỗi khi cập nhật thuốc: ' + (err.error?.message || 'Không rõ nguyên nhân'))
        });
      }
    }
  }

  // Mở modal nhập kho
  openStockModal(med: MedicationItem): void {
    this.selectedMedForStock = med;
    this.addedQuantity = 500;
    this.showStockModal = true;
  }

  closeStockModal(): void {
    this.showStockModal = false;
    this.selectedMedForStock = null;
  }

  submitStockIntake(): void {
    if (this.selectedMedForStock && this.addedQuantity > 0) {
      if (this.selectedMedForStock.medicationId) {
        this.adminMedicationService.addStock(this.selectedMedForStock.medicationId, this.addedQuantity).subscribe({
          next: () => {
            this.loadMedications();
            this.closeStockModal();
          },
          error: (err) => alert('Lỗi khi nhập kho: ' + (err.error?.message || 'Không rõ nguyên nhân'))
        });
      }
    } else {
      alert('Số lượng nhập kho phải lớn hơn 0!');
    }
  }

  // Gỡ thuốc khỏi kho
  deleteMedication(med: MedicationItem): void {
    if (confirm(`Bạn có chắc muốn gỡ bỏ thuốc ${med.name} (${med.code}) khỏi hệ thống?`)) {
      if (med.medicationId) {
        this.adminMedicationService.deleteMedication(med.medicationId).subscribe({
          next: () => {
            this.loadMedications();
          },
          error: (err) => {
            alert(err.error?.message || 'Không thể xóa thuốc này.');
          }
        });
      }
    }
  }
}


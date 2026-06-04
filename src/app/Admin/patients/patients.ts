import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminPatientService } from '../../Services/Admin/admin-patient.service';
import { SearchService } from '../../Services/search.service';
import { Subscription } from 'rxjs';

interface PatientHistory {
  visitDate: string;
  department: string;
  diagnosis: string;
  doctor: string;
  medications: string;
}

interface Patient {
  userId?: number;
  code: string;
  name: string;
  phone: string;
  dob?: string;
  gender: string;
  address: string;
  bloodType?: string;
  allergies?: string;
  lastVisit: string;
  history: PatientHistory[];
  userName?: string;
  password?: string;
}

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patients.html',
  styleUrl: './patients.css',
})
export class Patients implements OnInit, OnDestroy {
  // Tìm kiếm
  searchKeyword: string = '';
  private searchSub?: Subscription;

  // State Modal Thêm bệnh nhân
  showAddModal: boolean = false;
  newPatient: Patient = this.getInitialPatient();

  // State Modal Lịch sử khám
  showHistoryModal: boolean = false;
  selectedPatient: Patient | null = null;

  // State mô phỏng quét thẻ
  showNfcSimModal: boolean = false;

  patientList: Patient[] = [];

  constructor(
    private adminPatientService: AdminPatientService, 
    private searchService: SearchService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadPatients();
    this.searchSub = this.searchService.currentSearchKeyword.subscribe(keyword => {
      this.searchKeyword = keyword;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.searchSub) this.searchSub.unsubscribe();
  }

  loadPatients(): void {
    this.adminPatientService.getAllPatients().subscribe({
      next: (data) => {
        this.patientList = data.map(p => ({
          userId: p.userId,
          code: p.id,
          name: p.name,
          userName: p.userName,
          phone: p.phone,
          gender: p.gender,
          address: p.address,
          bloodType: p.bloodType,
          allergies: p.allergies,
          lastVisit: p.history && p.history.length > 0 ? p.history[0].date : 'Chưa khám',
          history: (p.history || []).map((h: any) => ({
            visitDate: h.date,
            department: h.department,
            diagnosis: h.diagnosis,
            doctor: h.doctor,
            medications: (h.prescription || []).map((m: any) => m.name).join(', ')
          }))
        }));
        this.cd.detectChanges();
      },
      error: (err) => console.error('Lỗi tải danh sách bệnh nhân:', err)
    });
  }

  getInitialPatient(): Patient {
    return {
      code: '',
      name: '',
      phone: '',
      dob: '',
      gender: 'Nam',
      address: '',
      bloodType: 'O+',
      allergies: 'Không có',
      lastVisit: 'Hôm nay',
      history: [],
      userName: '',
      password: ''
    };
  }

  // Lọc bệnh nhân
  get filteredPatients(): Patient[] {
    return this.patientList.filter(p => {
      const name = p.name || '';
      const phone = p.phone || '';
      const code = p.code || '';
      
      return name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        phone.includes(this.searchKeyword) ||
        code.toLowerCase().includes(this.searchKeyword.toLowerCase());
    });
  }

  // Mở modal thêm bệnh nhân
  openAddModal(): void {
    this.newPatient = this.getInitialPatient();
    this.newPatient.code = 'Tự động tạo';
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  savePatient(): void {
    if (!this.newPatient.name.trim() || !this.newPatient.phone.trim()) {
      alert('Vui lòng nhập Tên và Số điện thoại bệnh nhân!');
      return;
    }

    const createDto = {
      fullName: this.newPatient.name,
      phone: this.newPatient.phone,
      address: this.newPatient.address,
      gender: this.newPatient.gender,
      bloodType: this.newPatient.bloodType,
      allergies: this.newPatient.allergies,
      userName: this.newPatient.userName,
      password: this.newPatient.password
    };

    this.adminPatientService.createPatient(createDto).subscribe({
      next: () => {
        this.loadPatients();
        this.closeAddModal();
      },
      error: (err) => alert('Lỗi khi lưu bệnh nhân: ' + (err.error?.message || 'Không rõ nguyên nhân'))
    });
  }

  // Mở modal lịch sử khám
  openHistoryModal(patient: Patient): void {
    this.selectedPatient = patient;
    this.showHistoryModal = true;
  }

  closeHistoryModal(): void {
    this.showHistoryModal = false;
    this.selectedPatient = null;
  }

  // Xóa/Vô hiệu hóa bệnh nhân (Nếu DB hỗ trợ IsActive)
  deletePatient(patient: Patient): void {
    if (confirm(`Xác nhận xóa hồ sơ bệnh nhân ${patient.name}?`)) {
      // API hiện tại chưa có delete, có thể thêm sau
      alert('Chức năng xóa hồ sơ bệnh nhân cần được cấu hình thêm ở Backend.');
    }
  }
}


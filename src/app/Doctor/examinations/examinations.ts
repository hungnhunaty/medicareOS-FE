import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DoctorPortalService } from '../../Services/Doctor/doctor-portal.service';
import { AdminMedicationService } from '../../Services/Admin/admin-medication.service';
import { SearchService } from '../../Services/search.service';
import { Subscription } from 'rxjs';

import { SignalRService } from '../../Services/signalr.service';

interface Examination {
  examinationId: number;
  patientCode: string;
  patientName: string;
  gender: string;
  dob: string;
  visitDate: string;
  symptoms: string;
  allergies?: string;
  bloodType?: string;
  familyMedicalHistory?: string;
  diagnosis: string;
  treatmentPlan: string;
  status: number;
  callCount?: number;
  medications: any[];
}

@Component({
  selector: 'app-doctor-examinations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './examinations.html',
  styleUrl: './examinations.css'
})
export class DoctorExaminations implements OnInit, OnDestroy {
  examinations: Examination[] = [];
  allMedications: any[] = [];
  searchKeyword: string = '';
  activeTab: number = 0; // 0: Chờ khám, 1: Đang khám, 2: Hoàn thành
  private searchSub?: Subscription;
  private signalrSub?: Subscription;

  // Modal State
  showDiagnosisModal: boolean = false;
  selectedExam: Examination | null = null;

  // Form State
  diagnosis: string = '';
  treatmentPlan: string = '';
  selectedMeds: any[] = [];

  // AI Safety warnings
  safetyResult: { isSafe: boolean; warnings: string[] } | null = null;
  isCheckingSafety: boolean = false;

  // UI State
  isCallingPatient: boolean = false;
  doctorId: number = 0;

  constructor(
    private doctorService: DoctorPortalService,
    private medService: AdminMedicationService,
    private searchService: SearchService,
    private signalrService: SignalRService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      this.doctorId = userInfo.userId || userInfo.userID || 0;
    }
    this.loadExaminations();
    this.loadMedications();
    this.searchSub = this.searchService.currentSearchKeyword.subscribe(keyword => {
      this.searchKeyword = keyword;
      this.cd.detectChanges();
    });

    this.signalrSub = this.signalrService.queueUpdated$.subscribe(() => {
      console.log('🔄 Bác sĩ nhận tín hiệu QueueUpdated, tiến hành load lại...');
      this.loadExaminations();
    });
  }

  ngOnDestroy(): void {
    if (this.searchSub) this.searchSub.unsubscribe();
    if (this.signalrSub) this.signalrSub.unsubscribe();
  }

  getAllergiesList(allergies: string | undefined): string[] {
    if (!allergies || allergies.trim() === '' || allergies.toLowerCase() === 'không có' || allergies.toLowerCase() === 'không') {
      return [];
    }
    const items = allergies.split(/[,;]+/).map(item => item.trim()).filter(item => item.length > 0);
    return Array.from(new Set(items));
  }

  getMedicalHistoryList(history: string | undefined): string[] {
    if (!history || history.trim() === '' || history.toLowerCase() === 'không có bệnh lý nền' || history.toLowerCase() === 'không có' || history.toLowerCase() === 'không') {
      return [];
    }
    const items = history.split(/[,;]+/).map(item => item.trim()).filter(item => item.length > 0);
    return Array.from(new Set(items));
  }

  loadExaminations(): void {
    this.doctorService.getExaminations(this.doctorId).subscribe({
      next: (data) => {
        this.examinations = data;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Lỗi tải danh sách ca khám:', err)
    });
  }

  loadMedications(): void {
    this.medService.getAllMedications().subscribe({
      next: (data) => {
        this.allMedications = data;
        this.cd.detectChanges();
      }
    });
  }

  get filteredExaminations(): Examination[] {
    return this.examinations.filter(e => {
      const name = e.patientName || '';
      const code = e.patientCode || '';
      const matchSearch = name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        code.toLowerCase().includes(this.searchKeyword.toLowerCase());
      const matchStatus = e.status === this.activeTab;
      return matchSearch && matchStatus;
    });
  }

  get primaryWaitingExaminations(): Examination[] {
    return this.examinations.filter(e => {
      const name = e.patientName || '';
      const code = e.patientCode || '';
      const matchSearch = name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        code.toLowerCase().includes(this.searchKeyword.toLowerCase());
      return matchSearch && e.status === 0;
    });
  }

  get secondaryWaitingExaminations(): Examination[] {
    return this.examinations.filter(e => {
      const name = e.patientName || '';
      const code = e.patientCode || '';
      const matchSearch = name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        code.toLowerCase().includes(this.searchKeyword.toLowerCase());
      return matchSearch && e.status === 3;
    });
  }

  callNext(): void {
    this.isCallingPatient = true;
    this.doctorService.callNextPatient(this.doctorId).subscribe({
      next: (res: any) => {
        this.isCallingPatient = false;
        if (res.examinationId) {
          alert(`Đang gọi bệnh nhân: ${res.patientName} (${res.patientCode})`);
          this.loadExaminations();
        } else {
          alert(res.message || 'Không có bệnh nhân trong hàng chờ.');
        }
      },
      error: () => {
        this.isCallingPatient = false;
        alert('Lỗi khi gọi bệnh nhân tiếp theo.');
      }
    });
  }

  recallPatient(exam: Examination): void {
    this.doctorService.recallPatient(exam.examinationId).subscribe({
      next: (res: any) => {
        alert(`Đang gọi lại bệnh nhân: ${exam.patientName}`);
        this.loadExaminations();
      },
      error: () => {
        alert('Lỗi khi gọi lại bệnh nhân.');
      }
    });
  }

  skipPatient(exam: Examination): void {
    this.doctorService.skipPatient(exam.examinationId).subscribe({
      next: (res: any) => {
        alert(`Đã đưa bệnh nhân ${exam.patientName} vào hàng chờ phụ.`);
        this.loadExaminations();
      },
      error: () => {
        alert('Lỗi khi đưa bệnh nhân vào hàng chờ phụ.');
      }
    });
  }

  openDiagnosis(exam: any): void {
    if (!exam) return;
    this.selectedExam = exam;
    this.diagnosis = exam.diagnosis;
    this.treatmentPlan = exam.treatmentPlan;
    this.selectedMeds = [...exam.medications];
    this.safetyResult = null;
    this.isCheckingSafety = false;
    this.showDiagnosisModal = true;

    // Chuyển trạng thái sang Đang khám nếu đang ở trạng thái Chờ
    if (exam.status === 0) {
      this.doctorService.startExamination(exam.examinationId).subscribe({
        next: () => {
          exam.status = 1;
          this.activeTab = 1; // Chuyển sang tab Đang khám (tab thứ 2)
          // Có thể load lại list nếu cần thiết, nhưng update local là đủ để UI reflect
        },
        error: (err) => console.error('Lỗi khi cập nhật trạng thái đang khám:', err)
      });
    }
  }

  closeDiagnosis(): void {
    this.showDiagnosisModal = false;
    this.selectedExam = null;
    this.safetyResult = null;
    this.isCheckingSafety = false;
  }

  addMedication(med: any): void {
    if (!med) return;
    if (this.selectedMeds.find(m => m.medicationId === med.medicationId)) return;
    this.selectedMeds.push({
      medicationId: med.medicationId,
      name: med.name,
      quantity: 1,
      instructions: 'Ngày uống 2 lần, sau ăn'
    });
  }

  onMedicationSelect(event: any): void {
    const medName = event.target.value;
    const med = this.allMedications.find(m => m.name === medName);
    if (med) {
      this.addMedication(med);
      event.target.value = ''; // clear input after selection
    }
  }

  removeMedication(index: number): void {
    this.selectedMeds.splice(index, 1);
  }

  checkPrescriptionSafety(): void {
    if (!this.selectedExam) return;
    if (this.selectedMeds.length === 0) {
      this.safetyResult = { isSafe: true, warnings: [] };
      return;
    }

    this.isCheckingSafety = true;
    this.doctorService.checkPrescriptionSafety(this.selectedExam.examinationId, this.selectedMeds).subscribe({
      next: (res) => {
        this.safetyResult = res;
        this.isCheckingSafety = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi kiểm tra an toàn đơn thuốc:', err);
        this.isCheckingSafety = false;
        this.cd.detectChanges();
      }
    });
  }

  saveDiagnosis(): void {
    if (!this.selectedExam) return;

    const data = {
      diagnosis: this.diagnosis,
      treatmentPlan: this.treatmentPlan,
      status: 2, // Đã hoàn thành
      medications: this.selectedMeds.map(m => ({
        medicationId: m.medicationId,
        quantity: m.quantity,
        instructions: m.instructions
      }))
    };

    this.doctorService.updateDiagnosis(this.selectedExam.examinationId, data).subscribe({
      next: () => {
        alert('Lưu kết quả khám thành công!');
        this.loadExaminations();
        this.closeDiagnosis();
      },
      error: (err) => alert('Lỗi khi lưu kết quả: ' + err.error?.message)
    });
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 0: return 'bg-amber-50 text-amber-700 border-amber-100';
      case 1: return 'bg-teal-50 text-teal-700 border-teal-100';
      case 2: return 'bg-slate-50 text-slate-500 border-slate-100';
      case 3: return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50';
    }
  }

  getStatusText(status: number): string {
    switch (status) {
      case 0: return 'Chờ khám';
      case 1: return 'Đang khám';
      case 2: return 'Hoàn thành';
      case 3: return 'Hàng chờ phụ';
      default: return 'Không rõ';
    }
  }
}

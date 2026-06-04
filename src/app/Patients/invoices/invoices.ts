import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PatientPortalService } from '../../Services/Patient/patient-portal.service';

@Component({
  selector: 'app-patient-invoices',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoices.html',
  styleUrl: './invoices.css'
})
export class PatientInvoices implements OnInit {
  invoices: any[] = [];
  filteredInvoices: any[] = [];
  invoiceFilter: 'all' | 'paid' | 'unpaid' = 'all';
  userId?: number;
  isLoading = true;

  constructor(private patientService: PatientPortalService) {}

  ngOnInit(): void {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        this.userId = userInfo.userID || userInfo.UserId || userInfo.id;
      } catch (e) {
        console.error('Lỗi phân tích userInfo:', e);
      }
    }
    this.loadData();
  }

  loadData(): void {
    if (!this.userId) return;
    
    this.patientService.getDashboardData(this.userId).subscribe({
      next: (data) => {
        this.invoices = data.invoices || [];
        this.filterInvoices();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi tải hóa đơn:', err);
        this.isLoading = false;
      }
    });
  }

  setInvoiceFilter(filter: 'all' | 'paid' | 'unpaid'): void {
    this.invoiceFilter = filter;
    this.filterInvoices();
  }

  filterInvoices(): void {
    if (this.invoiceFilter === 'all') {
      this.filteredInvoices = [...this.invoices];
    } else if (this.invoiceFilter === 'paid') {
      this.filteredInvoices = this.invoices.filter(i => i.status === 'Đã thanh toán');
    } else {
      this.filteredInvoices = this.invoices.filter(i => i.status === 'Chờ thanh toán');
    }
  }
}

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminFinanceService } from '../../Services/Admin/admin-finance.service';
import { SearchService } from '../../Services/search.service';
import { Subscription } from 'rxjs';
import { AdminServiceService } from '../../Services/Admin/admin-service.service';

interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

interface Invoice {
  id?: number;
  invoiceId: string;
  patientName: string;
  patientCode: string;
  date: string;
  items: InvoiceItem[];
  total: number;
  method: string;
  status: string;
}

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finance.html',
  styleUrl: './finance.css',
})
export class Finance implements OnInit, OnDestroy {
  // Tìm kiếm & Lọc
  searchKeyword: string = '';
  filterStatus: string = 'Tất cả trạng thái';
  private searchSub?: Subscription;

  // State Modal Tạo Hóa Đơn
  showCreateModal: boolean = false;
  newInvoice: any = this.getInitialNewInvoice();

  // State Modal In/Xem Biên Lai
  showReceiptModal: boolean = false;
  selectedInvoice: Invoice | null = null;

  // Danh sách hóa đơn thực tế
  invoiceList: Invoice[] = [];

  // Danh sách dịch vụ y tế hệ thống dùng để dự đoán/auto-complete khi nhập
  availableServices: any[] = [];

  constructor(
    private adminFinanceService: AdminFinanceService, 
    private adminServiceService: AdminServiceService,
    private searchService: SearchService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadInvoices();
    this.loadAvailableServices();
    this.searchSub = this.searchService.currentSearchKeyword.subscribe(keyword => {
      this.searchKeyword = keyword;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.searchSub) this.searchSub.unsubscribe();
  }

  loadInvoices(): void {
    this.adminFinanceService.getAllInvoices().subscribe({
      next: (data: any[]) => {
        console.log('Dữ liệu tài chính từ API:', data);
        this.invoiceList = data.map(inv => ({
          id: inv.realId, // Lấy ID thực để thực hiện confirm/cancel
          invoiceId: inv.invoiceId, // Mã hiển thị (HD-xxx)
          patientName: inv.patientName,
          patientCode: inv.patientCode,
          date: inv.date,
          items: (inv.items || []).map((i: any) => ({
            name: i.name,
            quantity: i.quantity,
            unitPrice: i.unitPrice
          })),
          total: inv.total, // Backend trả về 'total'
          method: inv.method || 'Chưa chọn',
          status: inv.status
        }));
        this.cd.detectChanges();
      },
      error: (err) => console.error('Lỗi tải danh sách hóa đơn:', err)
    });
  }

  // Lấy giá trị khởi tạo cho form mới
  getInitialNewInvoice() {
    return {
      patientName: '',
      patientCode: '',
      method: 'Tiền mặt',
      status: 'Đã thanh toán',
      items: [
        { name: 'Khám dịch vụ y tế', quantity: 1, unitPrice: 150000 }
      ]
    };
  }

  // Danh sách hóa đơn đã lọc
  get filteredInvoices(): Invoice[] {
    return this.invoiceList.filter(inv => {
      const name = inv.patientName || '';
      const invoiceId = inv.invoiceId || '';
      const patientCode = inv.patientCode || '';
      
      const matchKeyword = name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        invoiceId.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        patientCode.toLowerCase().includes(this.searchKeyword.toLowerCase());

      const matchStatus = this.filterStatus === 'Tất cả trạng thái' || inv.status === this.filterStatus;
      return matchKeyword && matchStatus;
    });
  }

  // Thống kê tổng doanh thu thu được (Đã thanh toán)
  get totalRevenue(): number {
    return this.invoiceList
      .filter(i => i.status === 'Đã thanh toán')
      .reduce((acc, curr) => acc + curr.total, 0);
  }

  // Thống kê tổng công nợ cần thu
  get pendingAmount(): number {
    return this.invoiceList
      .filter(i => i.status === 'Chờ thanh toán')
      .reduce((acc, curr) => acc + curr.total, 0);
  }

  // Mở modal tạo hóa đơn
  openCreateModal(): void {
    this.newInvoice = this.getInitialNewInvoice();
    this.newInvoice.items = []; // Để trống để bắt đầu tra cứu tự động
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  // Tự động tra cứu viện phí của bệnh nhân theo Mã bệnh nhân
  lookupPatientFees(): void {
    const code = this.newInvoice.patientCode.trim();
    if (!code) {
      alert('Vui lòng nhập Mã bệnh nhân để tra cứu!');
      return;
    }

    this.adminFinanceService.getPatientFees(code).subscribe({
      next: (data: any) => {
        // Tự động điền Tên bệnh nhân và Mã bệnh nhân chuẩn từ DB
        this.newInvoice.patientName = data.patientName;
        this.newInvoice.patientCode = data.patientCode;
        
        // Ánh xạ các mục chi phí (dịch vụ & đơn thuốc chưa thanh toán)
        this.newInvoice.items = data.items.map((i: any) => ({
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice
        }));
        this.cd.detectChanges();
      },
      error: (err) => {
        alert(err.error?.message || 'Không tìm thấy bệnh nhân hoặc bệnh nhân không có viện phí chưa thanh toán.');
      }
    });
  }

  loadAvailableServices(): void {
    this.adminServiceService.getAllServices().subscribe({
      next: (data: any[]) => {
        this.availableServices = data.map(s => ({
          serviceId: s.serviceId,
          name: s.name,
          currentPrice: s.currentPrice
        }));
        this.cd.detectChanges();
      },
      error: (err) => console.error('Lỗi tải danh mục dịch vụ:', err)
    });
  }

  // Tự động điền đơn giá khi chọn dịch vụ từ Datalist gợi ý
  onServiceInputChange(index: number): void {
    const inputName = this.newInvoice.items[index].name.trim();
    const foundService = this.availableServices.find(
      s => s.name.toLowerCase() === inputName.toLowerCase()
    );
    if (foundService) {
      this.newInvoice.items[index].unitPrice = foundService.currentPrice;
      this.cd.detectChanges();
    }
  }

  // Thêm mục chi phí trong form tạo hóa đơn
  addItemRow(): void {
    this.newInvoice.items.push({ name: '', quantity: 1, unitPrice: 0 });
  }

  // Xóa mục chi phí trong form tạo hóa đơn
  removeItemRow(index: number): void {
    if (this.newInvoice.items.length > 1) {
      this.newInvoice.items.splice(index, 1);
    }
  }

  // Tính tổng tạm tính cho form
  get newInvoiceTotalCalc(): number {
    return this.newInvoice.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
  }

  // Lưu hóa đơn mới
  saveNewInvoice(): void {
    if (!this.newInvoice.patientName.trim()) {
      alert('Vui lòng nhập Tên bệnh nhân thanh toán!');
      return;
    }

    const validItems = this.newInvoice.items.filter((i: any) => i.name.trim() !== '' && i.unitPrice > 0);
    if (validItems.length === 0) {
      alert('Vui lòng thêm ít nhất 1 khoản chi phí hợp lệ!');
      return;
    }

    const createDto = {
      patientName: this.newInvoice.patientName,
      patientCode: this.newInvoice.patientCode,
      method: this.newInvoice.method,
      status: this.newInvoice.status,
      items: validItems.map((i: any) => ({
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice
      }))
    };

    this.adminFinanceService.createInvoice(createDto).subscribe({
      next: () => {
        this.loadInvoices();
        this.closeCreateModal();
      },
      error: (err) => alert('Lỗi khi tạo hóa đơn: ' + (err.error?.message || 'Không rõ nguyên nhân'))
    });
  }

  // Chuyển sang trạng thái đã thanh toán
  confirmPayment(invoice: Invoice, method: string): void {
    if (invoice.id) {
      this.adminFinanceService.confirmPayment(invoice.id, method).subscribe({
        next: () => this.loadInvoices(),
        error: (err) => alert('Lỗi xác nhận thanh toán: ' + (err.error?.message || 'Không rõ nguyên nhân'))
      });
    }
  }

  // Hủy hóa đơn
  cancelInvoice(invoice: Invoice): void {
    if (confirm(`Xác nhận hủy hóa đơn ${invoice.invoiceId} của bệnh nhân ${invoice.patientName}?`)) {
      if (invoice.id) {
        this.adminFinanceService.cancelInvoice(invoice.id).subscribe({
          next: () => this.loadInvoices(),
          error: (err) => alert('Lỗi hủy hóa đơn: ' + (err.error?.message || 'Không rõ nguyên nhân'))
        });
      }
    }
  }

  // Mở modal xem và in biên lai
  openReceiptModal(invoice: Invoice): void {
    this.selectedInvoice = invoice;
    this.showReceiptModal = true;
  }

  closeReceiptModal(): void {
    this.showReceiptModal = false;
    this.selectedInvoice = null;
  }

  // In biên lai mô phỏng
  printReceipt(): void {
    window.print();
  }
}


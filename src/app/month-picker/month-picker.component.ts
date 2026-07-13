import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-month-picker',
  templateUrl: './month-picker.component.html',
  styleUrls: ['./month-picker.component.css']
})
export class MonthPickerComponent {
  @Input() currentMonthKey = '';
  @Input() monthLabels: string[] = [];
  @Input() months: any[] = [];
  @Input() currentYear = new Date().getFullYear();
  @Input() currentMonth = new Date().getMonth() + 1;

  @Output() switch = new EventEmitter<string>();

  pickerYear = Number(this.currentMonthKey.split('-')[0]) || new Date().getFullYear();
  selectedYear = Number(this.currentMonthKey.split('-')[0]) || this.pickerYear;
  selectedMonth = Number(this.currentMonthKey.split('-')[1]) || this.currentMonth;

  ngOnChanges(): void {
    if (this.currentMonthKey) {
      const parts = this.currentMonthKey.split('-');
      this.pickerYear = Number(parts[0]);
      this.selectedYear = Number(parts[0]);
      this.selectedMonth = Number(parts[1]);
    }
  }

  open = false;

  toggle() { this.open = !this.open; }
  openPicker() { this.open = true; }
  closePicker() { this.open = false; }

  selectMonth(month: number) {
    const monthKey = `${this.pickerYear}-${String(month).padStart(2, '0')}`;
    this.selectedYear = this.pickerYear;
    this.selectedMonth = month;
    this.switch.emit(monthKey);
    this.closePicker();
  }

  setPickerYear(delta: number) { this.pickerYear += delta; }

  prevMonth() {
    const [y, m] = this.currentMonthKey.split('-').map(Number);
    const d = new Date(y, m - 1, 1);
    d.setMonth(d.getMonth() - 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    this.switch.emit(key);
  }

  nextMonth() {
    const [y, m] = this.currentMonthKey.split('-').map(Number);
    const d = new Date(y, m - 1, 1);
    d.setMonth(d.getMonth() + 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    this.switch.emit(key);
  }

  backdropClick(e: Event) {
    if (e.target === e.currentTarget) this.closePicker();
  }
}

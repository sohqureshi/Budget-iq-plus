import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';

interface Row {
  desc: string;
  amount: number;
}

@Component({
  selector: 'app-monthly-expenses',
  templateUrl: './monthly-expenses.component.html',
  styleUrls: ['./monthly-expenses.component.css']
  ,encapsulation: ViewEncapsulation.None
})
export class MonthlyExpensesComponent implements OnInit, OnDestroy {
  storageKey = 'monthlyBudgetData_v2';
  defaultMonthKey = this.getCurrentMonthKey();
  currentMonthKey = this.defaultMonthKey;
  pickerYear = Number(this.defaultMonthKey.split('-')[0]);

  months = Array.from({ length: 12 }, (_, i) => new Date(2026, i, 1));

  monthLabels: string[] = this.months.map(d => d.toLocaleDateString('en-IN', { month: 'short' }));
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth() + 1;
  selectedYear = Number(this.currentMonthKey.split('-')[0]);
  selectedMonth = Number(this.currentMonthKey.split('-')[1]);

  incomes: Row[] = [];
  expenses: Row[] = [];

  deferredInstallPrompt: any = null;

  constructor() {}

  ngOnInit(): void {
    this.loadData(this.currentMonthKey);
    this.registerServiceWorker();
    window.addEventListener('beforeinstallprompt', this.beforeInstallHandler);
    window.addEventListener('appinstalled', this.appInstalledHandler);
    document.addEventListener('keydown', this.keydownHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeinstallprompt', this.beforeInstallHandler);
    window.removeEventListener('appinstalled', this.appInstalledHandler);
    document.removeEventListener('keydown', this.keydownHandler);
  }

  beforeInstallHandler = (event: any) => {
    event.preventDefault();
    this.deferredInstallPrompt = event;
    this.updateInstallButton();
  };

  appInstalledHandler = () => {
    this.deferredInstallPrompt = null;
    this.updateInstallButton();
  };

  keydownHandler = (event: KeyboardEvent) => {
    if (event.key === 'Escape') this.closeCalendarPicker();
  };

  getCurrentMonthKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  formatCurrency(value: number) {
    return `Rs. ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value || 0)}`;
  }

  parseAmountValue(value: string | number) {
    const numericValue = String(value ?? '').replace(/,/g, '').replace(/[^\d.-]/g, '');
    return Number(numericValue) || 0;
  }

  formatAmountValue(value: number) {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
  }

  updateInstallButton() {
    const installBtn = document.getElementById('installAppButton');
    if (!installBtn) return;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window as any).navigator.standalone === true;
    installBtn.classList.toggle('hidden', !this.deferredInstallPrompt || isStandalone);
  }

  registerServiceWorker() {
    const canRegisterServiceWorker = 'serviceWorker' in navigator && ['http:', 'https:'].includes(window.location.protocol);
    if (canRegisterServiceWorker) {
      window.addEventListener('load', () => {
        const swUrl = new URL('assets/monthly-expense-sw.js', document.baseURI).toString();
        navigator.serviceWorker.register(swUrl).catch(err => console.warn('Service worker registration failed', err));
      });
    }
  }

  saveData() {
    const data = { income: this.incomes.map(i => ({ desc: i.desc, amount: i.amount })), expenses: this.expenses.map(e => ({ desc: e.desc, amount: e.amount })) };
    try {
      const saved = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      const storageData = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
      storageData[this.currentMonthKey] = data;
      localStorage.setItem(this.storageKey, JSON.stringify(storageData));
      this.setSaveStatus('Saved automatically');
    } catch (e) {
      this.setSaveStatus('Save failed');
    }
  }

  setSaveStatus(msg: string) {
    const el = document.getElementById('saveStatus');
    if (el) el.textContent = msg;
  }

  createDefaultRows(monthKey: string) {
    const hasNoSavedData = monthKey === this.defaultMonthKey && !localStorage.getItem(this.storageKey);
    if (hasNoSavedData) {
      this.incomes = [{ desc: 'Salary', amount: 100000 }];
      this.expenses = [
        { desc: 'Home Loan', amount: 30000 },
        { desc: 'Car Loan', amount: 12400 },
        { desc: 'Loan from family', amount: 12000 },
        { desc: 'Grocery and Maintenance', amount: 10000 },
        { desc: 'Electricity bill', amount: 10000 },
        { desc: 'Medical expenses', amount: 10000 },
        { desc: 'Miscellaneous', amount: 10000 }
      ];
      return;
    }

    if (!this.incomes.length) this.incomes = [{ desc: '', amount: 0 }];
    if (!this.expenses.length) this.expenses = [{ desc: '', amount: 0 }];
  }

  loadData(monthKey = this.currentMonthKey) {
    const saved = localStorage.getItem(this.storageKey);
    this.currentMonthKey = monthKey;
    this.selectedYear = Number(this.currentMonthKey.split('-')[0]);
    this.selectedMonth = Number(this.currentMonthKey.split('-')[1]);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const monthData = data[monthKey] || { income: [], expenses: [] };
        this.incomes = monthData.income.map((i: any) => ({ desc: i.desc, amount: this.parseAmountValue(i.amount) }));
        this.expenses = monthData.expenses.map((e: any) => ({ desc: e.desc, amount: this.parseAmountValue(e.amount) }));
      } catch (e) {
        console.error(e);
      }
    } else {
      this.incomes = [];
      this.expenses = [];
    }
    this.updateMonthLabels(this.currentMonthKey);
    this.pickerYear = Number(this.currentMonthKey.split('-')[0]);
    this.createDefaultRows(this.currentMonthKey);
    this.calculate();
  }

  switchMonth(monthKey: string) {
    this.saveData();
    this.loadData(monthKey);
  }

  addIncome() {
    this.incomes.push({ desc: '', amount: 0 });
    this.saveData();
  }

  addExpense() {
    this.expenses.push({ desc: '', amount: 0 });
    this.saveData();
  }

  removeIncome(index: number) {
    if (this.incomes.length === 1) {
      this.incomes[0] = { desc: '', amount: 0 };
    } else {
      this.incomes.splice(index, 1);
    }
    this.calculate();
    this.saveData();
  }

  removeExpense(index: number) {
    if (this.expenses.length === 1) {
      this.expenses[0] = { desc: '', amount: 0 };
    } else {
      this.expenses.splice(index, 1);
    }
    this.calculate();
    this.saveData();
  }

  focusLastRow(selector: 'income' | 'expense') {
    // left intentionally minimal; DOM focus can be done if needed
  }

  sum(items: Row[]) {
    return items.reduce((t, r) => t + this.parseAmountValue(r.amount), 0);
  }

  sumItems(items: any[] = []) {
    const safe = Array.isArray(items) ? items : [];
    return safe.reduce((total, item) => total + this.parseAmountValue(item.amount), 0);
  }

  getSavedBudgetData() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    } catch (e) {
      return {};
    }
  }

  updateAllMonthsRemaining(currentBalance: number) {
    const savedData = this.getSavedBudgetData();
    let totalRemaining = currentBalance;
    Object.entries(savedData).forEach(([monthKey, monthData]: any) => {
      if (monthKey === this.currentMonthKey) return;
      const income = this.sumItems(monthData.income);
      const expense = this.sumItems(monthData.expenses);
      totalRemaining += income - expense;
    });
    const totalEl = document.getElementById('allMonthsRemaining');
    if (totalEl) {
      totalEl.textContent = `Total remaining: ${this.formatCurrency(totalRemaining)}`;
      totalEl.classList.toggle('negative', totalRemaining < 0);
    }
  }

  filledRowCount(items: Row[]) {
    return items.filter(item => (item.desc && item.desc.trim()) || this.parseAmountValue(item.amount) > 0).length;
  }

  calculate() {
    const income = this.sum(this.incomes);
    const expense = this.sum(this.expenses);
    const balance = income - expense;
    const spentPercent = income > 0 ? Math.round((expense / income) * 100) : 0;
    const progressPercent = Math.min(spentPercent, 100);

    const incomeRows = this.filledRowCount(this.incomes);
    const expenseRows = this.filledRowCount(this.expenses);

    const incomeTotal = document.getElementById('incomeTotal');
    const expenseTotal = document.getElementById('expenseTotal');
    const incomeSectionTotal = document.getElementById('incomeSectionTotal');
    const expenseSectionTotal = document.getElementById('expenseSectionTotal');
    const incomeCount = document.getElementById('incomeCount');
    const expenseCount = document.getElementById('expenseCount');
    const rowCount = document.getElementById('rowCount');

    if (incomeTotal) incomeTotal.textContent = this.formatCurrency(income);
    if (expenseTotal) expenseTotal.textContent = this.formatCurrency(expense);
    if (incomeSectionTotal) incomeSectionTotal.textContent = this.formatCurrency(income);
    if (expenseSectionTotal) expenseSectionTotal.textContent = this.formatCurrency(expense);
    if (incomeCount) incomeCount.textContent = `${incomeRows} ${incomeRows === 1 ? 'source' : 'sources'}`;
    if (expenseCount) expenseCount.textContent = `${expenseRows} ${expenseRows === 1 ? 'item' : 'items'}`;
    if (rowCount) rowCount.textContent = `${incomeRows + expenseRows} entries`;

    const balanceEl = document.getElementById('balance');
    if (balanceEl) {
      balanceEl.textContent = this.formatCurrency(balance);
      balanceEl.className = `metric-value ${balance >= 0 ? 'income-text' : 'negative'}`;
    }
    const balanceNote = document.getElementById('balanceNote');
    if (balanceNote) balanceNote.textContent = balance >= 0 ? 'Available after expenses' : 'Expenses exceed income';

    const spentRate = document.getElementById('spentRate');
    if (spentRate) {
      spentRate.textContent = `${spentPercent}%`;
      spentRate.className = `metric-value ${spentPercent > 100 ? 'negative' : ''}`;
    }
    const progressLabel = document.getElementById('progressLabel');
    if (progressLabel) progressLabel.textContent = `${spentPercent}% used`;

    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
      progressFill.style.width = `${progressPercent}%`;
      progressFill.classList.toggle('over', spentPercent > 100);
    }
    this.updateAllMonthsRemaining(balance);
  }

  updateMonthLabels(monthKey: string) {
    const [year, month] = monthKey.split('-');
    const label = new Date(Number(year), Number(month) - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    const active = document.getElementById('activeMonth');
    const picker = document.getElementById('monthPickerLabel');
    if (active) active.textContent = label;
    if (picker) picker.textContent = label;
  }

  openCalendarPicker() {
    this.pickerYear = Number(this.currentMonthKey.split('-')[0]);
    const backdrop = document.getElementById('calendarBackdrop');
    if (backdrop) backdrop.classList.add('open');
    document.body.classList.add('calendar-open');
    if (backdrop) backdrop.setAttribute('aria-hidden', 'false');
    const btn = document.getElementById('monthPickerButton');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }

  closeCalendarPicker() {
    const backdrop = document.getElementById('calendarBackdrop');
    if (backdrop) backdrop.classList.remove('open');
    document.body.classList.remove('calendar-open');
    if (backdrop) backdrop.setAttribute('aria-hidden', 'true');
    const btn = document.getElementById('monthPickerButton');
    if (btn) {
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  }

  selectMonth(month: number) {
    const monthKey = `${this.pickerYear}-${String(month).padStart(2, '0')}`;
    this.switchMonth(monthKey);
    this.closeCalendarPicker();
  }

  setPickerYear(delta: number) {
    this.pickerYear += delta;
  }

  prevMonth() {
    const [year, month] = this.currentMonthKey.split('-').map(Number);
    const d = new Date(year, month - 1, 1);
    d.setMonth(d.getMonth() - 1);
    const newKey = this.getCurrentMonthKey(d);
    this.switchMonth(newKey);
  }

  nextMonth() {
    const [year, month] = this.currentMonthKey.split('-').map(Number);
    const d = new Date(year, month - 1, 1);
    d.setMonth(d.getMonth() + 1);
    const newKey = this.getCurrentMonthKey(d);
    this.switchMonth(newKey);
  }

  backdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeCalendarPicker();
    }
  }

  handleExpenseAmountChange(event: { index: number; value: string }) {
    const { index, value } = event;
    if (!this.expenses || index < 0 || index >= this.expenses.length) return;

    this.expenses[index].amount = this.parseAmountValue(value);
    this.calculate();
    this.saveData();
  }

  handleIncomeAmountChange(event: { index: number; value: string }) {
    const { index, value } = event;
    if (!this.incomes || index < 0 || index >= this.incomes.length) return;

    this.incomes[index].amount = this.parseAmountValue(value);
    this.calculate();
    this.saveData();
  }

  onAmountInput(value: string, row: Row) {
    row.amount = this.parseAmountValue(value);
    this.calculate();
    this.saveData();
  }

  onDescInput() {
    this.saveData();
  }
}


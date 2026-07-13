import { Component, EventEmitter, Input, Output } from '@angular/core';

interface Row { desc: string; amount: number }

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.css']
})
export class ExpenseListComponent {
  @Input() expenses: Row[] = [];
  @Output() add = new EventEmitter<void>();
  @Output() remove = new EventEmitter<number>();
  @Output() amountChange = new EventEmitter<{ index: number; value: string }>();
  @Output() descChange = new EventEmitter<void>();

  sumExpenses(): number {
    if (!Array.isArray(this.expenses)) return 0;
    return this.expenses.reduce((total, r) => total + (Number(r?.amount) || 0), 0);
  }
}


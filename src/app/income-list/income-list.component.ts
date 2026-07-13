import { Component, EventEmitter, Input, Output } from '@angular/core';

interface Row { desc: string; amount: number }

@Component({
  selector: 'app-income-list',
  templateUrl: './income-list.component.html',
  styleUrls: ['./income-list.component.css']
})
export class IncomeListComponent {
  @Input() incomes: Row[] = [];
  @Output() add = new EventEmitter<void>();
  @Output() remove = new EventEmitter<number>();
  @Output() amountChange = new EventEmitter<{ index: number; value: string }>();
  @Output() descChange = new EventEmitter<void>();

  sumIncomes(): number {
    if (!Array.isArray(this.incomes)) return 0;
    return this.incomes.reduce((total, r) => total + (Number(r?.amount) || 0), 0);
  }
}


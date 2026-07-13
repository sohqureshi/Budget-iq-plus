import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { MonthlyExpensesComponent } from './monthly-expenses/monthly-expenses.component';
import { FormsModule } from '@angular/forms';
import { IncomeListComponent } from './income-list/income-list.component';
import { ExpenseListComponent } from './expense-list/expense-list.component';
import { MonthPickerComponent } from './month-picker/month-picker.component';


@NgModule({
  declarations: [AppComponent, MonthlyExpensesComponent, IncomeListComponent, ExpenseListComponent, MonthPickerComponent],
  imports: [BrowserModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

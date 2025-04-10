import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoanPage } from './model/LoanPage';
import { Loan } from './model/loan';
import { LoanSearchDto } from './model/loan-search.dto'; // Asegúrate de tener este modelo

@Injectable({
  providedIn: 'root'
})
export class LoanService {

  private baseUrl = 'http://localhost:8080/loan';

  constructor(private http: HttpClient) {}

  getLoans(search: LoanSearchDto): Observable<LoanPage> {
    
    return this.http.post<LoanPage>(this.baseUrl, search);
  }

  deleteLoan(idLoan: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${idLoan}`);
  }

  saveLoan(loan: Loan): Observable<void> {
    const loanDto = {
      ...loan,
      startDate: this.formatDate(loan.startDate), 
      endDate: this.formatDate(loan.endDate),  
      game: loan.game,
      client: loan.client
    };

    return this.http.put<void>(this.baseUrl, loanDto);
  }

  public formatDate(date: Date): string | null {
    if (!date) return null;
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  getAllLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.baseUrl}/all`); // Cambia la URL para ajustarse a la que devuelva todos los préstamos
  }
}

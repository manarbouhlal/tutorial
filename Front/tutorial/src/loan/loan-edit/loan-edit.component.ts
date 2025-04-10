import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Loan } from '../model/loan';
import { Client } from '../../client/model/Client';
import { Game } from '../../game/model/Game';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { LoanService } from '../loan.service';
import { ClientService } from '../../client/client.service';
import { GameService } from '../../game/game.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loan-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
  ],
  templateUrl: './loan-edit.component.html',
  styleUrls: ['./loan-edit.component.scss'],
})
export class LoanEditComponent implements OnInit {
  loan: Loan;
  clients: Client[] = [];
  games: Game[] = [];
  existingLoans: Loan[] = [];

  @ViewChild('dateStartPicker') dateStartPicker: MatDatepicker<Date>;
  @ViewChild('dateEndPicker') dateEndPicker: MatDatepicker<Date>;

  form: FormGroup;
  dateStartControl: AbstractControl;
  dateEndControl: AbstractControl;

  constructor(
    private dialogRef: MatDialogRef<LoanEditComponent>,
    private loanService: LoanService,
    private clientService: ClientService,
    private gameService: GameService,
    @Inject(MAT_DIALOG_DATA) public data: Loan
  ) {}

  ngOnInit(): void {
    this.loan = this.data ? { ...this.data } : new Loan();
  
    this.loanService.getAllLoans().subscribe(loans => {
      this.existingLoans = loans; 
    });
  
    this.form = new FormGroup({
      dateStart: new FormControl(this.loan.startDate, [Validators.required]),
      dateEnd: new FormControl(this.loan.endDate, [Validators.required]),
      client: new FormControl(this.loan.client, [Validators.required]),
      game: new FormControl(this.loan.game, [Validators.required])
    });
  
    this.dateStartControl = this.form.get('dateStart');
    this.dateEndControl = this.form.get('dateEnd');
  
    this.form.get('dateStart').valueChanges.subscribe(value => this.loan.startDate = value);
    this.form.get('dateEnd').valueChanges.subscribe(value => this.loan.endDate = value);
    this.form.get('client').valueChanges.subscribe(value => this.loan.client = value);
    this.form.get('game').valueChanges.subscribe(value => this.loan.game = value);
  
    this.clientService.getClients().subscribe(clients => this.clients = clients);
    this.gameService.getGames().subscribe(games => this.games = games);
  }
  
  

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); 
      return;
    }
  
    const dateStart = this.form.value.dateStart;
    const dateEnd = this.form.value.dateEnd;
  
    this.dateStartControl.setErrors(null);
    this.dateEndControl.setErrors(null);
  
    
    const diffDays = (dateEnd.getTime() - dateStart.getTime()) / (1000 * 3600 * 24);
  
    if (dateEnd < dateStart) {
      this.dateStartControl.setErrors({ rangeOrder: true });
      this.dateEndControl.setErrors({ rangeOrder: true });
      return;
    }
  
    if (diffDays >= 14) {
      this.dateStartControl.setErrors({ tooLong: true });
      this.dateEndControl.setErrors({ tooLong: true });
      return;
    }
  
    
    const gameAlreadyLoaned = this.checkGameLoan(this.form.value.game.id, dateStart, dateEnd);
    if (gameAlreadyLoaned) {
      this.dateStartControl.setErrors({ gameLoanConflict: true });
      this.dateEndControl.setErrors({ gameLoanConflict: true });
      return;
    }
  
    
    const clientLoanCount = this.checkClientLoans(this.form.value.client.id, dateStart, dateEnd);
    if (clientLoanCount >= 2) {
      this.dateStartControl.setErrors({ clientLoanLimit: true });
      this.dateEndControl.setErrors({ clientLoanLimit: true });
      return;
    }
  
    
    this.loanService.saveLoan(this.loan).subscribe({
      next: () => this.dialogRef.close(),
      error: (err) => {
        if (err.status === 409 && err.error?.message) {
          alert(err.error.message); 
        } else {
          alert('Error guardando el préstamo');
        }
      }
    });
  }
  
  checkGameLoan(gameId: number, startDate: Date, endDate: Date): boolean {
    for (let loan of this.existingLoans) {
      if (loan.game.id === gameId && 
        ((startDate >= loan.startDate && startDate <= loan.endDate) || 
         (endDate >= loan.startDate && endDate <= loan.endDate))) {
        return true;
      }
    }
    return false;
  }
  
  checkClientLoans(clientId: number, startDate: Date, endDate: Date): number {
    
    let count = 0;
    for (let loan of this.existingLoans) {
      if (loan.client.id === clientId &&
        ((startDate >= loan.startDate && startDate <= loan.endDate) || 
         (endDate >= loan.startDate && endDate <= loan.endDate))) {
        count++;
      }
    }
    return count; 
  }
  
  

  onClose(): void {
    this.dialogRef.close();
  }

  
  trackByClientId(index: number, client: Client): number {
    return client.id;
  }

  trackByGameId(index: number, game: Game): number {
    return game.id;
  }

  compareById(a: any, b: any): boolean {
    return a && b && a.id === b.id;
  }
  
}
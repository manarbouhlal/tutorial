import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Loan } from '../model/loan';
import { LoanService } from '../loan.service';
import { MatDialog } from '@angular/material/dialog';
import { Pageable } from '../../app/core/model/page/Pageable';
import { DialogConfirmationComponent } from '../../app/core/dialog-confirmation/dialog-confirmation.component';
import { LoanEditComponent } from '../loan-edit/loan-edit.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Game } from '../../game/model/Game';
import { Client } from '../../client/model/Client';
import { GameService } from '../../game/game.service';
import { ClientService } from '../../client/client.service';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';


@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatDialogModule, 
    MatNativeDateModule, 
  ],
  templateUrl: './loan-list.component.html',
  styleUrls: ['./loan-list.component.scss']
})
export class LoanListComponent implements OnInit {
  pageNumber: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  games: Game[];
  filterGame: Game;
  clients: Client[];
  filterClient: Client;
  filterDate: Date;

  @ViewChild('dateFilterPicker') dateFilterPicker: MatDatepicker<Date>;

  dataSource = new MatTableDataSource<Loan>();
  displayedColumns: string[] = ['id', 'game', 'client', 'startDate', 'endDate', 'action'];


  constructor(
    private loanService: LoanService, 
    private gameService: GameService,
    private clientService: ClientService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPage();

    this.gameService.getGames().subscribe(games => {
      this.games = games;
    });

    this.clientService.getClients().subscribe(clients => {
      this.clients = clients;
    })
  }

  loadPage(event?: PageEvent) {
    const pageable: Pageable = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      sort: [
        {
          property: 'id',
          direction: 'ASC'
        }
      ]
    };
  
    if (event != null) {
      pageable.pageSize = event.pageSize;
      pageable.pageNumber = event.pageIndex;
    }
  
    const searchDto = {
      pageable: pageable,
      clientId: this.filterClient?.id,
      gameId: this.filterGame?.id,
      date: this.filterDate ? this.loanService.formatDate(this.filterDate) : undefined
    };
  
    this.loanService.getLoans(searchDto).subscribe(data => {
      this.dataSource.data = data.content;
      this.pageNumber = data.pageable.pageNumber;
      this.pageSize = data.pageable.pageSize;
      this.totalElements = data.totalElements;
    });
  }
  

  deleteLoan(loan: Loan) {
    const dialogRef = this.dialog.open(DialogConfirmationComponent, {
      data: {
        title: 'Eliminar Préstamo',
        description: 'Atención si borra el préstamo se perderán sus datos.<br> ¿Desea eliminar el préstamo?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loanService.deleteLoan(loan.id).subscribe(() => {
          this.loadPage();
        })
      }
    })
  }

  createLoan() {
    const dialogRef = this.dialog.open(LoanEditComponent);

    dialogRef.afterClosed().subscribe(() => {
      this.ngOnInit();
    })
  }

  onCleanFilter() {
    this.filterGame = null;
    this.filterClient = null;
    this.filterDate = null;
    this.onSearch();
  }

  onSearch() {
    this.loadPage();
  }

  trackByClientId(index: number, client: Client): number {
    return client.id;
  }
  
  trackByGameId(index: number, game: Game): number {
    return game.id;
  }
  
}
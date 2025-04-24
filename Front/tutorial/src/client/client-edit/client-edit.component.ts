import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ClientService } from '../client.service';
import { Client } from '../model/Client';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-client-edit',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule, 
        MatFormFieldModule, 
        MatInputModule, 
        MatButtonModule,
        MatDialogModule
    ],
    templateUrl: './client-edit.component.html',
    styleUrls: ['./client-edit.component.scss']
})
export class ClientEditComponent implements OnInit {
    client: Client;

    constructor(
        public dialogRef: MatDialogRef<ClientEditComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {client: Client},
        private clientService: ClientService
    ) {}

    ngOnInit(): void {
      this.client = this.data.client ? Object.assign({}, this.data.client) : new Client();
    }

    
    onSave() {
        if (!this.client.name || this.client.name.trim() === '') {
            alert('El nombre no puede estar vacío.');
            return;
        }
    
        this.clientService.saveClient(this.client).subscribe(() => {
            this.dialogRef.close();
        });
    }
    

    onClose() {
        this.dialogRef.close();
    }
}
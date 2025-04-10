import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CategoryService } from '../category.service';
import { Category } from '../model/category';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-category-edit',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule, 
        MatFormFieldModule, 
        MatInputModule, 
        MatButtonModule,
        MatDialogModule
    ],
    templateUrl: './category-edit.component.html',
    styleUrls: ['./category-edit.component.scss']
})
export class CategoryEditComponent implements OnInit {
    category: Category;

    constructor(
        public dialogRef: MatDialogRef<CategoryEditComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {category : Category},
        private categoryService: CategoryService
    ) {}

    ngOnInit(): void {
      this.category = this.data.category ? Object.assign({}, this.data.category) : new Category();
    }

    onSave() {
        this.categoryService.saveCategory(this.category).subscribe(() => {
            this.dialogRef.close();
        });
    }

    onClose() {
        this.dialogRef.close();
    }
}
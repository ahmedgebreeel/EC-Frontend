import { Component, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services';
import { ToastrService } from 'ngx-toastr';

interface ParentCategory {
  id: number;
  name: string;
}

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './add.html',
  styleUrls: ['../style.css']
})
export class Add implements OnInit {
  categoryForm: FormGroup;
  
  // Mock parent categories using signal
  // parentCategories = signal<ParentCategory[]>([
  //   { id: 1, name: 'Electronics' },
  //   { id: 3, name: 'Fashion' },
  //   { id: 6, name: 'Home & Kitchen' },
  //   { id: 7, name: 'Sports & Fitness' },
  //   { id: 8, name: 'Books & Media' },
  //   { id: 10, name: 'Beauty & Personal Care' }
  // ]);

  parentCategories = signal<ParentCategory[]>([]);

  descriptionLength = signal(0);
  
  // Computed signal for category path preview
  // categoryPath = computed(() => {
  //   const parentId = this.categoryForm?.get('parentCategoryId')?.value;
  //   const categoryName = this.categoryForm?.get('name')?.value || 'Your New Category';
    
  //   if (parentId) {
  //     const parent = this.parentCategories().find(p => p.id === +parentId);
  //     return parent ? `Root → ${parent.name} → ${categoryName}` : `Root → ${categoryName}`;
  //   }
  //   return `Root → ${categoryName}`;
  // });

  constructor(
    private fb: FormBuilder,
    private readonly router: Router,
    private readonly categoryService: CategoryService,
    private readonly toastr: ToastrService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', Validators.maxLength(1000)],
      parentCategoryId: ['']
    });

    // Track description length using effect
    effect(() => {
      const desc = this.categoryForm.get('description')?.value || '';
      this.descriptionLength.set(desc.length);
    });
  }

  ngOnInit(){
    if(this.categoryService.categories().length === 0) {
      this.categoryService.getAllCategories().subscribe({
        next: (res) => {
          console.log("categories", res);
          this.categoryService.categories.set(res);
          this.parentCategories.set(this.categoryService.categories().filter(cat => cat.parentId === null));
        },
        error: (err) => {
          console.log(err);
        }
      })
    }
    
    this.parentCategories.set(this.categoryService.categories().filter(cat => cat.parentId === null));
  }

  onDescriptionChange(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.descriptionLength.set(textarea.value.length);
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      console.log('Category Data:', this.categoryForm.value);
      // Here you would call your API service
      this.categoryService.AddCategory({
        name: this.categoryForm.get('name')?.value,
        description: this.categoryForm.get('description')?.value,
        parentId: this.categoryForm.get('parentCategoryId')?.value ? +this.categoryForm.get('parentCategoryId')?.value : null
      }).subscribe({
        next: (res) => {
          console.log("addded", res);
          this.toastr.success('Category added successfully!');
          this.router.navigate(['/admin/categories']);
          
        },
        error: (err) => {
          console.log(err);
          this.toastr.error(err.error);
        }
      })
    } else {
      this.toastr.error('Please fill in all required fields.');
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/categories']);
  }
}

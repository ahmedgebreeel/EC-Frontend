import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services';
import { ToastrService } from 'ngx-toastr';

interface ParentCategory {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
}

interface CategoryData {
  id: number;
  name: string;
  description: string;
  parentCategoryId: number | null;
  subcategories: Subcategory[];
  createdDate: string;
  updatedDate: string;
}

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './edit.html',
  styleUrls: ['../style.css']
})
export class Edit implements OnInit {
  categoryForm: FormGroup;
  currentCategory = signal({} as any);
  parentCategories = signal<ParentCategory[]>([]);
  descriptionLength = signal(0);
  subcategories = signal<Subcategory[]>([]); 

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private toastr: ToastrService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', Validators.maxLength(1000)],
      parentCategoryId: ['']
    });
  }

  ngOnInit(): void {
    
    if(this.categoryService.categories().length === 0) {
      this.categoryService.getAllCategories().subscribe({
        next: (res) => {
          console.log("categories", res);
          this.categoryService.categories.set(res);
          this.parentCategories.set(this.categoryService.categories().filter(cat => cat.parentId === null));
          // Get category ID from route
          this.route.params.subscribe(params => {
            const id = +params['id'];
            this.loadCategory(id);
          });
        },
        error: (err) => {
          console.log(err);
        }
      })
    }else{
      this.parentCategories.set(this.categoryService.categories().filter(cat => cat.parentId === null));
  
      // Get category ID from route
      this.route.params.subscribe(params => {
        const id = +params['id'];
        this.loadCategory(id);
      });
    }
    
  }

  loadCategory(id: number): void {
    // In a real application, you would fetch from API
    const category = this.categoryService.categories().find(cat => cat.id === id);
    this.currentCategory.set(category);
    console.log(this.currentCategory());
    this.subcategories.set(this.categoryService.categories().filter(cat => cat.parentId === category.id));
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description, 
      parentCategoryId: category.parentId || ''
    });

    this.descriptionLength.set(category.description?.length || 0);
  }

  onDescriptionChange(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.descriptionLength.set(textarea.value.length);
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      console.log('Updated Category Data:', this.categoryForm.value);
      this.categoryService.UpdateCategory(this.currentCategory().id.toString(),this.categoryForm.value).subscribe({
        next: (res) => {
          console.log("updated", res);
          this.toastr.success('Category updated successfully!');
          this.router.navigate(['/admin/categories']);
        },
        error: (err) => {
          console.log(err);
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

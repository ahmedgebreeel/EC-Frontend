import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CategoryService, ProductService } from '../../../core/services';

interface Category {
  id: number;
  name: string;
}

interface ImagePreview {
  url: string;
  file: File;
}

@Component({
  selector: 'app-product-add',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './add.html',
  styleUrls: ['../style.css']
})
export class ProductAddComponent implements OnInit {
  // Reactive form
  productForm: FormGroup;

  // Mock categories data
  categories = signal<Category[]>([]);

  // Image previews signal
  imagePreviews = signal<ImagePreview[]>([]);

  // Description length tracking
  descriptionLength = signal<number>(0);
  maxDescriptionLength = 2000;

  // Computed signal for character count display
  characterCountDisplay = computed(() => 
    `${this.descriptionLength()} / ${this.maxDescriptionLength} characters`
  );

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private categoryService: CategoryService,
    private productService: ProductService,
    private toastr: ToastrService
  ) {
    // Initialize reactive form with validators
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(this.maxDescriptionLength)]],
      categoryId: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0.01), Validators.max(999999)]],
      stock: ['', [Validators.required, Validators.min(0), Validators.max(999999)]]
    });

    // Subscribe to description changes to update character count
    this.productForm.get('description')?.valueChanges.subscribe(value => {
      this.descriptionLength.set(value?.length || 0);
    });
  }
  ngOnInit() {

    if(this.categoryService.categories().length === 0) {
      this.categoryService.getAllCategories().subscribe({
        next: (res) => {
          console.log("categories", res);
          this.categoryService.categories.set(res);
          this.categories.set(this.categoryService.categories());
        },
        error: (err) => {
          console.log(err);
        }
      })
    }
    
    this.categories.set(this.categoryService.categories());

  }

  // Handle file selection for images
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (!input.files || input.files.length === 0) {
      return;
    }

    const files = Array.from(input.files);
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    files.forEach(file => {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        this.toastr.error(`File "${file.name}" is not a valid image. Only PNG, JPG, and JPEG are allowed.`);
        return;
      }

      // Validate file size
      if (file.size > maxFileSize) {
        this.toastr.error(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return;
      }

      // Read and preview image
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        this.imagePreviews.update(previews => [
          ...previews,
          { url, file }
        ]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input to allow selecting the same file again
    input.value = '';
  }

  // Remove image preview
  removeImage(index: number): void {
    this.imagePreviews.update(previews => 
      previews.filter((_, i) => i !== index)
    );
  }

  // Submit form
  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      this.toastr.error('Please fill in all required fields correctly.');
      return;
    }

    // Validate that at least one image is selected
    if (this.imagePreviews().length === 0) {
      this.toastr.error('At least one image must be added.');
      return;
    }

    // Create FormData for file upload
    const formData = new FormData();
    
    // Append form fields
    // formData.append('name', this.productForm.get('name')?.value);
    // formData.append('description', this.productForm.get('description')?.value || '');
    // formData.append('categoryId', this.productForm.get('categoryId')?.value);
    // formData.append('price', this.productForm.get('price')?.value);
    // formData.append('stock', this.productForm.get('stock')?.value);
    
    // Append images
    this.imagePreviews().forEach((preview, index) => {
      formData.append('Files', preview.file, preview.file.name);

    });

    console.log('Product Data to Submit:', {
      ...this.productForm.value,
      imageCount: this.imagePreviews().length
    });
    
    this.productService.addProduct({...this.productForm.value, brandId: 1, stockQuantity: this.productForm.value.stock }).subscribe({
      next: (response) => {
        console.log("Response", response);

        this.productService.uploadImages(response.createdProductId, formData).subscribe({
          next: (response) => {
            console.log("Response", response);
            this.toastr.success('Product added successfully!');
            this.router.navigate(['/admin/products']);
          },
          error: () => {
            this.productService.deleteProduct(response.createdProductId).subscribe({
              next: (res) => {
                console.log("res", res);
                this.toastr.error('Failed to add product. Please try again.');
              },
              error: (err) => {
                console.log(err);
              }
            });
          }
        });
      },
      error: (error) => {
        this.toastr.error('Failed to add product. Please try again.');
        console.error('Error:', error);
      }
    });

    // Simulate successful submission
    // this.toastr.success('Product added successfully!');
    // this.router.navigate(['/admin/products']);
  }

  // Cancel and navigate back
  onCancel(): void {
    const hasUnsavedChanges = this.productForm.dirty || this.imagePreviews().length > 0;
    
    if (hasUnsavedChanges) {
      if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
        this.router.navigate(['/admin/products']);
      }
    } else {
      this.router.navigate(['/admin/products']);
    }
  }

  // Mark all form fields as touched to show validation errors
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Check if a field has validation errors
  hasError(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Get error message for a field
  getErrorMessage(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    
    if (!field || !field.errors) {
      return '';
    }

    if (field.errors['required']) {
      return 'This field is required';
    }
    
    if (field.errors['minlength']) {
      const requiredLength = field.errors['minlength'].requiredLength;
      return `Minimum ${requiredLength} characters required`;
    }
    
    if (field.errors['maxlength']) {
      const requiredLength = field.errors['maxlength'].requiredLength;
      return `Maximum ${requiredLength} characters allowed`;
    }
    
    if (field.errors['min']) {
      return 'Value must be greater than 0';
    }
    
    if (field.errors['max']) {
      return 'Value exceeds maximum allowed';
    }

    return 'Invalid value';
  }
}

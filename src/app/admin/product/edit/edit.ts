import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CategoryService, ProductService } from '../../../core/services';
import Swal from 'sweetalert2';

interface Category {
  id: number;
  name: string;
}

interface ExistingImage {
  id: number;
  url: string;
  isExisting: true;
}

interface NewImage {
  url: string;
  file: File;
  isExisting: false;
}

type ImagePreview = ExistingImage | NewImage;

interface Product {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  price: number;
  stock: number;
  images: string[];
}

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './edit.html',
  styleUrls: ['../style.css']
})
export class ProductEditComponent implements OnInit {
  // Reactive form
  productForm: FormGroup;
  
  // Product signals
  productId = signal<number>(0);
  productName = signal<string>('');

  // categories data
  categories = signal<Category[]>([]);

  // Image previews signal
  imagePreviews = signal<ImagePreview[]>([]);

  // Description tracking
  descriptionLength = signal<number>(0);
  maxDescriptionLength = 2000;

  // Computed character count display
  characterCountDisplay = computed(() => 
    `${this.descriptionLength()} / ${this.maxDescriptionLength} characters`
  );

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private categoryService: CategoryService,
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

    // Subscribe to description changes
    this.productForm.get('description')?.valueChanges.subscribe(value => {
      this.descriptionLength.set(value?.length || 0);
    });
  }

  ngOnInit(): void {
    this.loadCategories();

    // Get product ID from route parameters
    const id = this.route.snapshot.paramMap.get('id');
    this.productId.set(+id!);
    this.loadProduct();
  }

  private loadProduct(): void {
    this.productService.getProductById(this.productId()).subscribe({
        next: (product)=>{
          console.log(product);
          
          // Update form with product data
          this.productForm.patchValue({
            name: product.name,
            description: product.description,
            categoryId: product.categoryId,
            price: product.price,
            stock: product.stockQuantity
          });
      
          // Set product name for display
          this.productName.set(product.name);
          
          // Set description length
          this.descriptionLength.set(product.description.length);
      
          // Load existing images
          const existingImages: ExistingImage[] = product.images.map((img:any) => ({
            id: img.id,
            url: img.imageUrl,
            isExisting: true as const
          }));
          
          this.imagePreviews.set(existingImages);
        },
        error: (err) => {
          console.log(err);
        }
    });

  }

  loadCategories() {
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
    });
    }
    else {
      this.categories.set(this.categoryService.categories());
    }
  }

  // Handle new file selection
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (!input.files || input.files.length === 0) {
      return;
    }

    const files = Array.from(input.files);
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    
    files.forEach(file => {
      // Validate file size and type
      if (file.size > maxFileSize) {
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert(`File "${file.name}" is not a valid image.`);
        return;
      }

      // Read and preview image
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const newImage: NewImage = {
          url,
          file,
          isExisting: false as const
        };
        
        this.imagePreviews.update(previews => [...previews, newImage]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    input.value = '';
  }

  // Remove image (existing or new)
  removeImage(index: number): void {
    const image = this.imagePreviews()[index]; 
    const imageType = image.isExisting ? 'existing' : 'new';
    const confirmMessage = `Are you sure you want to remove this ${imageType} image?`;

    Swal.fire({
      title: 'Remove Image',
      text: confirmMessage,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        if(image.isExisting) {
          this.productService.deleteImage(this.productId(), image.id).subscribe({
            next: (res) => {
              console.log(res);
              this.imagePreviews.update(previews => 
                previews.filter((_, i) => i !== index)
              );
            },
            error: (err) => {
              console.log(err);
              this.toastr.error(err.error);
            }
          })
        }else{
          this.imagePreviews.update(previews => 
            previews.filter((_, i) => i !== index)
          );
        }
      }
    })

  }

  // Submit form
  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      this.toastr.error('Please fill in all required fields correctly.');
      return;
    }

    const formData = {
      id: this.productId(),
      ...this.productForm.value,
      existingImages: this.imagePreviews()
        .filter((img): img is ExistingImage => img.isExisting)
        .map(img => img.url),
      newImages: this.imagePreviews()
        .filter((img): img is NewImage => !img.isExisting)
        .map(img => img.file)
    };

    console.log('Updated Product Data:', formData);
    let newImages = new FormData();

    formData.newImages.forEach((image:any) => {
      newImages.append('Files', image, image.name);
    })
    
    this.productService.updateProduct(this.productId(), {
      name: formData.name,
      description: formData.description,
      categoryId: formData.categoryId,
      brandId: 1,
      price: formData.price,
      stockQuantity: formData.stock,
    }).subscribe({
      next: (response) => {
        console.log("Response", response);

        if(formData.newImages.length > 0){
          this.productService.uploadImages(this.productId(), newImages).subscribe({
            next: (response) => {
              console.log("Response", response);
              this.toastr.success('Product updated successfully!');
              this.router.navigate(['/admin/products']);
            },
            error: (err) => {
              console.log(err);
              this.toastr.error(err.error);
              
            }
          })  
        }
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  // Cancel editing
  onCancel(): void {
    const hasUnsavedChanges = this.productForm.dirty;
    
    if (hasUnsavedChanges) {
      Swal.fire({
        title: 'Cancel Editing',
        text: 'Are you sure you want to cancel? All unsaved changes will be lost.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/admin/products']);
        }
      });
    } else {
      this.router.navigate(['/admin/products']);
    }
  }

  // Mark all form fields as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Check if field has validation errors
  hasError(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Get error message for field
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

  // Check if image is an existing image (for template)
  isExistingImage(image: ImagePreview): boolean {
    return image.isExisting;
  }
}

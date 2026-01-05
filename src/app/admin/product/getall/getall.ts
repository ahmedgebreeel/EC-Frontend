import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

interface Product {
  id: number;
  name: string;
  description: string;
  categoryBreadcrumb: string;
  price: number;
  stockQuantity: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  createdDate: string;
  thumbnailUrl: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './getall.html',
  styleUrls: ['../style.css']
})
export class ProductListComponent implements OnInit {
  // Search query signal
  searchQuery = signal<string>('');

  // Products data
  products = signal<Product[]>([]);

  // Pagination state
  currentPage = signal<number>(1);
  pageSize = signal<number>(20);
  totalCount = signal<number>(0);
  isLoading = signal<boolean>(false);
  hasMore = signal<boolean>(true);

  // Computed signal for filtered products based on search query
  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();

    if (!query) {
      return this.products();
    }

    return this.products().filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.categoryBreadcrumb.toLowerCase().includes(query) ||
      product.id.toString().includes(query)
    );
  });

  // Computed signal for product count
  productCount = computed(() => this.totalCount() || this.filteredProducts().length);

  constructor(
    private readonly productsService: ProductService,
    private toastr: ToastrService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(append: boolean = false): void {
    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);

    const filters = {
      pageNum: this.currentPage(),
      pageSize: this.pageSize()
    };

    this.productsService.getAllProducts(filters).subscribe({
      next: (res) => {
        console.log(res);

        if (append) {
          this.products.update(products => [...products, ...res.items]);
        } else {
          this.products.set(res.items);
        }

        this.totalCount.set(res.totalCount || res.items.length);

        // Check if there are more products to load
        const loadedCount = this.products().length;
        this.hasMore.set(loadedCount < this.totalCount());

        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.toastr.error(err.error);
        this.isLoading.set(false);
      }
    });
  }

  // Handle search input change
  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  // Clear search query
  clearSearch(): void {
    this.searchQuery.set('');
  }

  // Handle scroll event for infinite scroll
  onScroll(event: Event): void {
    
    const container = event.target as HTMLElement;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // Load more when scrolled to 80% of the container
    if (scrollTop + clientHeight >= scrollHeight * 0.8) {
      this.loadMore();
    }
  }

  // Load more products
  loadMore(): void {
    if (!this.hasMore() || this.isLoading() || this.searchQuery()) {
      return;
    }

    this.currentPage.update(page => page + 1);
    this.loadProducts(true);
  }

  // Delete product with confirmation
  deleteProduct(id: number): void {
    const product = this.products().find(p => p.id === id);

    if (product) {
      Swal.fire({
        title: 'Are you sure?',
        text: `You want to delete "${product.name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.productsService.deleteProduct(id).subscribe({
            next: (res) => {
              console.log("res", res);
              this.toastr.success('Product deleted successfully');
              this.products.update(products => products.filter(p => p.id !== id));
              this.totalCount.update(count => count - 1);
            },
            error: (err) => {
              console.log(err);
              this.toastr.error(err.error);
            }
          })
        }
      });
    }
  }

  // Get stock badge CSS class based on status
  getStockBadgeClass(status: string): string {
    switch (status) {
      case 'In Stock':
        return 'stock-in';
      case 'Low Stock':
        return 'stock-low';
      case 'Out of Stock':
        return 'stock-out';
      default:
        return '';
    }
  }
}

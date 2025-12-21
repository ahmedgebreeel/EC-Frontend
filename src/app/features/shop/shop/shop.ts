import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProductService } from '../../../core/services/product.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged, skip } from 'rxjs';
import { CategoryService } from '../../../core/services/category.service';
import { BrandService } from '../../../core/services/brand.service';
import { Category } from '../../../core/models/category.model';
import { Brand } from '../../../core/models/brand.model';
import { Product, ProductQueryParams } from '../../../core/models/product.model';
import { LoadingService } from '../../../core/services/loading.service';
import { RouterLink, ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-shop',
  imports: [FormsModule, CommonModule, ProductCard, NgxPaginationModule, RouterLink],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop {
  productService = inject(ProductService);
  categoryService = inject(CategoryService);
  brandService = inject(BrandService);
  loadingService = inject(LoadingService);
  activatedRoute = inject(ActivatedRoute);
  allProducts = signal<Product[]>([]);
  allCategories = signal<Category[]>([]);
  allBrands = signal<Brand[]>([]);
  selectedCategory = signal<number | null>(null);
  minValue: number = 0;
  maxValue: number = 5000;
  minPercent: number = 0;
  maxPercent: number = 100;
  viewType = signal<'grid' | 'list'>('grid');
  pageIndex = signal(1);
  pageSize = 9;
  totalPages = signal(0);
  search = signal('');

  selectedSort = signal('Sort By');
  selectedSortKey = signal<string | null>(null);
  selectedBrands = signal<number[]>([]);
  pendingSelectedBrands = signal<number[]>([]);
  brandSearch = signal('');
  appliedSearch = signal('');
  appliedPriceRange = signal({ min: 0, max: 5000 });
  private isManualSearchClear = false;

  filteredBrands = computed(() => {
    const search = this.brandSearch().toLowerCase();
    if (!search) return this.allBrands();
    return this.allBrands().filter(b => b.name.toLowerCase().includes(search));
  });


  activeFilters = computed(() => {
    const filters: { type: string; label: string; value: string; id?: number }[] = [];

    if (this.appliedSearch() && this.appliedSearch().trim() !== '') {
      filters.push({ type: 'search', label: 'Search', value: this.appliedSearch() });
    }

    if (this.selectedCategory()) {
      const cat = this.findCategoryById(this.selectedCategory()!);
      if (cat) {
        filters.push({ type: 'category', label: 'Category', value: cat.name });
      }
    }

    const price = this.appliedPriceRange();
    if (price.min > 0 || price.max < 5000) {
      const maxDisplay = price.max >= 5000 ? '5000+' : price.max.toString();
      filters.push({ type: 'price', label: 'Price', value: `${price.min}-${maxDisplay} EGP` });
    }

    this.selectedBrands().forEach(brandId => {
      const brand = this.allBrands().find(b => b.id === brandId);
      if (brand) {
        filters.push({ type: 'brand', label: 'Brand', value: brand.name, id: brandId });
      }
    });

    return filters;
  });

  search$ = toObservable(this.search).pipe(
    skip(1),
    debounceTime(500),
    distinctUntilChanged()
  );


  categoryTree = computed(() => this.allCategories());


  hasChildSelected(category: Category): boolean {
    const selected = this.selectedCategory();
    if (!selected || category.subcategories.length === 0) return false;

    const checkChildren = (subcategories: Category[]): boolean => {
      for (const child of subcategories) {
        if (child.id === selected) return true;
        if (child.subcategories.length > 0 && checkChildren(child.subcategories)) return true;
      }
      return false;
    };

    return checkChildren(category.subcategories);
  }

  constructor() {
    this.activatedRoute.queryParams.subscribe(params => {
      const catId = params['categoryId'];
      if (catId) {
        this.selectedCategory.set(Number(catId));
        this.pageIndex.set(1);
        this.loadProducts();
      }
    });

    this.search$.subscribe(() => {
      if (this.isManualSearchClear) {
        this.isManualSearchClear = false;
        return;
      }
      this.appliedSearch.set(this.search());
      this.pageIndex.set(1);
      this.loadProducts();
    });
    this.loadProducts();
    this.loadCategories();
    this.loadBrands();
  }

  loadProducts(scrollToTop: boolean = true) {
    const filters: ProductQueryParams = {
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize
    };

    // Add search filter
    if (this.appliedSearch() && this.appliedSearch().trim() !== '') {
      filters.search = this.appliedSearch().trim();
    }

    // Add category filter
    if (this.selectedCategory()) {
      filters.categoryId = this.selectedCategory()!;
    }

    // Add brand filter
    if (this.selectedBrands().length > 0) {
      filters.brandsIds = this.selectedBrands().join(',');
    }

    // Add price filter
    const priceRange = this.appliedPriceRange();
    if (priceRange.min > 0) {
      filters.minPrice = priceRange.min;
    }
    if (priceRange.max < 5000) {
      filters.maxPrice = priceRange.max;
    }

    // Add sort filter
    const sortKey = this.selectedSortKey();
    if (sortKey) {
      filters.sort = sortKey as ProductQueryParams['sort'];
    }

    // Set loading state and scroll to filter area if needed
    this.loadingService.show();
    if (scrollToTop) {
      const filterArea = document.getElementById('category-header');
      if (filterArea) {
        filterArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    this.productService.getAllProducts(filters).subscribe({
      next: (response) => {
        this.allProducts.set(response.items);
        this.totalPages.set(response.totalCount);
        this.loadingService.hide();
      },
      error: () => {
        this.allProducts.set([]);
        this.totalPages.set(0);
        this.loadingService.hide();
      }
    });
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.allCategories.set(categories);
      },
      error: () => {
        this.allCategories.set([]);
      }
    });
  }

  loadBrands() {
    this.brandService.getAllBrands().subscribe({
      next: (brands) => {
        this.allBrands.set(brands);
      },
      error: () => {
        this.allBrands.set([]);
      }
    });
  }

  onPageChange(page: number) {
    this.pageIndex.set(page);
    this.loadProducts();
  }

  setView(type: 'grid' | 'list') {
    this.viewType.set(type);
  }

  selectCategory(cat: any) {
    if (this.selectedCategory() === cat.id) {
      this.selectedCategory.set(null);
    } else {
      this.selectedCategory.set(cat.id);
      this.pageIndex.set(1);
    }
    this.loadProducts();
  }

  sortByCategory(cat: any) {
    this.selectCategory(cat);
  }
  updateMinSlider() {
    if (this.minValue > this.maxValue) {
      this.maxValue = this.minValue;
    }
    this.updateSliderPercents();
  }

  updateMaxSlider() {
    if (this.maxValue < this.minValue) {
      this.minValue = this.maxValue;
    }
    this.updateSliderPercents();
  }

  updateSliderPercents() {
    this.minPercent = (this.minValue / 5000) * 100;
    this.maxPercent = (this.maxValue / 5000) * 100;
  }

  priceFilter() {
    this.pageIndex.set(1);
    this.appliedPriceRange.set({ min: this.minValue, max: this.maxValue });
    this.loadProducts();
  }

  clearAllFilters() {
    this.search.set('');
    this.appliedSearch.set('');
    this.selectedCategory.set(null);
    this.selectedBrands.set([]);
    this.pendingSelectedBrands.set([]);
    this.selectedSort.set('Sort By');
    this.selectedSortKey.set(null);

    this.minValue = 0;
    this.maxValue = 5000;
    this.minPercent = 0;
    this.maxPercent = 100;
    this.appliedPriceRange.set({ min: 0, max: 5000 });

    this.loadProducts();
  }

  removeFilter(type: string, id?: number) {
    switch (type) {
      case 'search':
        this.isManualSearchClear = true;
        this.search.set('');
        this.appliedSearch.set('');
        break;
      case 'category':
        this.selectedCategory.set(null);
        break;
      case 'price':
        this.minValue = 0;
        this.maxValue = 5000;
        this.minPercent = 0;
        this.maxPercent = 100;
        this.appliedPriceRange.set({ min: 0, max: 5000 });
        break;
      case 'brand':
        let newBrands: number[] = [];
        if (id) {
          newBrands = this.selectedBrands().filter(b => b !== id);
        }
        this.selectedBrands.set(newBrands);
        this.pendingSelectedBrands.set(newBrands);
        break;
    }
    this.loadProducts();
  }

  toggleBrand(brandId: number) {
    const current = this.pendingSelectedBrands();
    if (current.includes(brandId)) {
      this.pendingSelectedBrands.set(current.filter(id => id !== brandId));
    } else {
      this.pendingSelectedBrands.set([...current, brandId]);
    }
  }

  applyBrandFilter() {
    this.selectedBrands.set(this.pendingSelectedBrands());
    this.pageIndex.set(1);
    this.loadProducts();
  }

  findCategoryById(id: number): Category | null {
    const searchInCategories = (categories: Category[]): Category | null => {
      for (const cat of categories) {
        if (cat.id === id) return cat;
        if (cat.subcategories?.length) {
          const found = searchInCategories(cat.subcategories);
          if (found) return found;
        }
      }
      return null;
    };
    return searchInCategories(this.allCategories());
  }

  setSort(sortKey: string, label: string) {
    this.selectedSort.set(label);
    this.selectedSortKey.set(sortKey);
    this.pageIndex.set(1);
    this.loadProducts();
  }


}

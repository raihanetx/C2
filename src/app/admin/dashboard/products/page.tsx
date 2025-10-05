'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  long_description?: string;
  image: string;
  category: string;
  category_slug: string;
  slug: string;
  pricing: Array<{
    duration: string;
    price: number;
  }>;
  stock_out?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  name: string;
  slug: string;
  icon: string;
}

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    long_description: '',
    image: '',
    category: '',
    pricing: [{ duration: '1 Month', price: 0 }],
    stock_out: false
  });

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    long_description: '',
    image: '',
    category: '',
    pricing: [{ duration: '1 Month', price: 0 }],
    stock_out: false
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, categoryFilter]);

  const loadData = () => {
    try {
      // Load products from localStorage (for now)
      const storedProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
      const storedCategories = JSON.parse(localStorage.getItem('adminCategories') || '[]');
      
      // If no products exist, create some default ones
      if (storedProducts.length === 0) {
        const defaultProducts = [
          {
            id: '1',
            name: 'Canva Pro',
            description: 'Professional design tool with premium templates',
            long_description: 'Canva Pro is a premium design tool that offers advanced features like brand kits, background remover, premium templates, and more.',
            image: 'https://via.placeholder.com/400x300.png?text=Canva+Pro',
            category: 'Design Tools',
            category_slug: 'design-tools',
            slug: 'canva-pro',
            pricing: [
              { duration: '1 Month', price: 5 },
              { duration: '3 Months', price: 12 },
              { duration: '6 Months', price: 20 },
              { duration: '1 Year', price: 35 }
            ],
            stock_out: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'ChatGPT Plus',
            description: 'Advanced AI assistant with GPT-4',
            long_description: 'ChatGPT Plus gives you access to GPT-4, faster response times, and access to new features.',
            image: 'https://via.placeholder.com/400x300.png?text=ChatGPT+Plus',
            category: 'Productivity',
            category_slug: 'productivity',
            slug: 'chatgpt-plus',
            pricing: [
              { duration: '1 Month', price: 20 },
              { duration: '3 Months', price: 55 },
              { duration: '6 Months', price: 100 },
              { duration: '1 Year', price: 180 }
            ],
            stock_out: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        localStorage.setItem('adminProducts', JSON.stringify(defaultProducts));
        setProducts(defaultProducts);
      } else {
        setProducts(storedProducts);
      }

      // If no categories exist, create default ones
      if (storedCategories.length === 0) {
        const defaultCategories = [
          { name: 'Design Tools', slug: 'design-tools', icon: 'fas fa-palette' },
          { name: 'Productivity', slug: 'productivity', icon: 'fas fa-tasks' },
          { name: 'Development', slug: 'development', icon: 'fas fa-code' },
          { name: 'Marketing', slug: 'marketing', icon: 'fas fa-bullhorn' },
          { name: 'Education', slug: 'education', icon: 'fas fa-graduation-cap' }
        ];
        localStorage.setItem('adminCategories', JSON.stringify(defaultCategories));
        setCategories(defaultCategories);
      } else {
        setCategories(storedCategories);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  };

  const slugify = (text: string): string => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleCreateProduct = () => {
    try {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: createForm.name,
        description: createForm.description,
        long_description: createForm.long_description,
        image: createForm.image,
        category: createForm.category,
        category_slug: slugify(createForm.category),
        slug: slugify(createForm.name),
        pricing: createForm.pricing,
        stock_out: createForm.stock_out,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      localStorage.setItem('adminProducts', JSON.stringify(updatedProducts));

      // Reset form
      setCreateForm({
        name: '',
        description: '',
        long_description: '',
        image: '',
        category: '',
        pricing: [{ duration: '1 Month', price: 0 }],
        stock_out: false
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleUpdateProduct = () => {
    if (!selectedProduct) return;

    try {
      const updatedProduct: Product = {
        ...selectedProduct,
        name: editForm.name,
        description: editForm.description,
        long_description: editForm.long_description,
        image: editForm.image,
        category: editForm.category,
        category_slug: slugify(editForm.category),
        slug: slugify(editForm.name),
        pricing: editForm.pricing,
        stock_out: editForm.stock_out,
        updatedAt: new Date().toISOString()
      };

      const updatedProducts = products.map(product =>
        product.id === selectedProduct.id ? updatedProduct : product
      );
      setProducts(updatedProducts);
      localStorage.setItem('adminProducts', JSON.stringify(updatedProducts));

      setIsEditDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const updatedProducts = products.filter(product => product.id !== productId);
        setProducts(updatedProducts);
        localStorage.setItem('adminProducts', JSON.stringify(updatedProducts));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name,
      description: product.description,
      long_description: product.long_description || '',
      image: product.image,
      category: product.category,
      pricing: product.pricing,
      stock_out: product.stock_out || false
    });
    setIsEditDialogOpen(true);
  };

  const addPricingOption = (isCreate: boolean = true) => {
    if (isCreate) {
      setCreateForm(prev => ({
        ...prev,
        pricing: [...prev.pricing, { duration: '', price: 0 }]
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        pricing: [...prev.pricing, { duration: '', price: 0 }]
      }));
    }
  };

  const updatePricingOption = (index: number, field: 'duration' | 'price', value: string | number, isCreate: boolean = true) => {
    if (isCreate) {
      setCreateForm(prev => ({
        ...prev,
        pricing: prev.pricing.map((option, i) =>
          i === index ? { ...option, [field]: value } : option
        )
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        pricing: prev.pricing.map((option, i) =>
          i === index ? { ...option, [field]: value } : option
        )
      }));
    }
  };

  const removePricingOption = (index: number, isCreate: boolean = true) => {
    if (isCreate) {
      setCreateForm(prev => ({
        ...prev,
        pricing: prev.pricing.filter((_, i) => i !== index)
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        pricing: prev.pricing.filter((_, i) => i !== index)
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
          <p className="text-gray-600 mt-2">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
          </Badge>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-plus mr-2"></i>
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={createForm.name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={createForm.category} onValueChange={(value) => setCreateForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.slug} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief product description"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="long_description">Long Description</Label>
                  <Textarea
                    id="long_description"
                    value={createForm.long_description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, long_description: e.target.value }))}
                    placeholder="Detailed product description"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={createForm.image}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <Label>Pricing Options</Label>
                  <div className="space-y-2">
                    {createForm.pricing.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option.duration}
                          onChange={(e) => updatePricingOption(index, 'duration', e.target.value, true)}
                          placeholder="Duration (e.g., 1 Month)"
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={option.price}
                          onChange={(e) => updatePricingOption(index, 'price', parseFloat(e.target.value) || 0, true)}
                          placeholder="Price"
                          className="w-24"
                        />
                        {createForm.pricing.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removePricingOption(index, true)}
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addPricingOption(true)}
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Add Pricing Option
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="stock_out"
                    checked={createForm.stock_out}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, stock_out: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="stock_out">Out of Stock</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateProduct} className="flex-1">
                    Create Product
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.slug} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-box text-6xl text-gray-300 mb-4"></i>
              <p className="text-xl text-gray-500 mb-2">No products found</p>
              <p className="text-gray-400">Get started by adding your first product</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price Range</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img 
                            src={product.image || 'https://via.placeholder.com/60x60.png?text=No+Image'} 
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          ${Math.min(...product.pricing.map(p => p.price)).toFixed(2)} - ${Math.max(...product.pricing.map(p => p.price)).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={product.stock_out ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                          {product.stock_out ? 'Out of Stock' : 'In Stock'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(product)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Product Name</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={editForm.category} onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.slug} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-description">Short Description</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief product description"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="edit-long_description">Long Description</Label>
                <Textarea
                  id="edit-long_description"
                  value={editForm.long_description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, long_description: e.target.value }))}
                  placeholder="Detailed product description"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="edit-image">Image URL</Label>
                <Input
                  id="edit-image"
                  value={editForm.image}
                  onChange={(e) => setEditForm(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label>Pricing Options</Label>
                <div className="space-y-2">
                  {editForm.pricing.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option.duration}
                        onChange={(e) => updatePricingOption(index, 'duration', e.target.value, false)}
                        placeholder="Duration (e.g., 1 Month)"
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={option.price}
                        onChange={(e) => updatePricingOption(index, 'price', parseFloat(e.target.value) || 0, false)}
                        placeholder="Price"
                        className="w-24"
                      />
                      {editForm.pricing.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removePricingOption(index, false)}
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addPricingOption(false)}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add Pricing Option
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-stock_out"
                  checked={editForm.stock_out}
                  onChange={(e) => setEditForm(prev => ({ ...prev, stock_out: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="edit-stock_out">Out of Stock</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUpdateProduct} className="flex-1">
                  Update Product
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockProducts, mockSiteConfig } from '@/lib/data';
import { formatPrice } from '@/lib/helpers';
import { Product, CartItem, Modal } from '@/types';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { categorySlug, productSlug } = params as { categorySlug: string; productSlug: string };
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedDurationIndex, setSelectedDurationIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currency, setCurrency] = useState<'USD' | 'BDT'>('USD');
  const [modal, setModal] = useState<Modal>({
    visible: false,
    type: 'info',
    title: '',
    message: ''
  });

  useEffect(() => {
    // Find the product based on slugs
    const product = mockProducts.find(p => p.category_slug === categorySlug && p.slug === productSlug);
    if (product) {
      setSelectedProduct(product);
    } else {
      // Product not found, redirect to home
      router.push('/');
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    
    // Load currency preference
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency === 'USD' || savedCurrency === 'BDT') {
      setCurrency(savedCurrency);
    }
  }, [categorySlug, productSlug, router]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'BDT' : 'USD');
    localStorage.setItem('currency', currency);
  };

  const addToCart = (productId: string, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === productId);
      if (existingItem) {
        return prevCart.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { productId, quantity }];
      }
    });
    
    // Show success modal
    if (selectedProduct) {
      setModal({
        visible: true,
        type: 'success',
        title: 'Added to Cart',
        message: `${selectedProduct.name} has been added to your cart.`
      });
    }
  };

  const addToCartAndGoToCheckout = (productId: string, quantity: number) => {
    addToCart(productId, quantity);
    // Navigate to checkout after a short delay to show the success message
    setTimeout(() => {
      window.location.href = '/checkout';
    }, 1000);
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, visible: false }));
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!selectedProduct) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
          <p className="text-xl text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  // Calculate selected price
  const selectedPrice = selectedProduct.pricing[selectedDurationIndex].price;
  const selectedPriceFormatted = formatPrice(selectedPrice, currency, mockSiteConfig.usd_to_bdt_rate);
  
  // Format long description with line breaks
  const formattedLongDescription = selectedProduct.long_description?.replace(/\n/g, '<br />') || '';

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="header flex justify-between items-center px-4 bg-white shadow-md sticky top-0 z-40 h-16 md:h-20">
        <div className="flex items-center justify-between w-full md:hidden gap-2">
          <Link href="/" className="logo flex-shrink-0">
            <img src="https://i.postimg.cc/gJRL0cdG/1758261543098.png" alt="Submonth Logo" className="h-8" />
          </Link>
          <div className="flex items-center gap-3">
            <Button onClick={toggleCurrency} variant="ghost" size="sm" className="flex items-center gap-1">
              <i className="fas fa-dollar-sign"></i>
              <span className="text-sm">{currency}</span>
            </Button>
            <Link href="/cart" className="relative">
              <i className="fas fa-shopping-bag text-xl text-gray-600"></i>
              {cartCount > 0 && <span className="notification-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>

        <div className="hidden md:flex items-center w-full gap-5">
          <Link href="/" className="logo flex-shrink-0 flex items-center text-gray-800 no-underline">
            <img src="https://i.postimg.cc/gJRL0cdG/1758261543098.png" alt="Submonth Logo" className="h-9" />
          </Link>
          <div className="flex-shrink-0 flex items-center gap-5 ml-auto">
            <Button onClick={toggleCurrency} variant="ghost" className="flex items-center gap-2">
              <i className="fas fa-dollar-sign text-xl"></i>
              <span>{currency}</span>
            </Button>
            <Link href="/products">
              <i className="fas fa-box-open text-xl text-gray-600"></i>
            </Link>
            <Link href="/cart" className="relative">
              <i className="fas fa-shopping-bag text-xl text-gray-600"></i>
              {cartCount > 0 && <span className="notification-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </header>

      {/* Custom Modal Popup */}
      {modal.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={closeModal}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl w-full max-w-sm text-center p-6">
            <div className="mb-4">
              <i className={`fas text-5xl ${
                modal.type === 'success' ? 'fa-check-circle text-green-500' :
                modal.type === 'error' ? 'fa-exclamation-circle text-red-500' :
                'fa-info-circle text-blue-500'
              }`}></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{modal.title}</h3>
            <p className="text-gray-600 mb-6">{modal.message}</p>
            <Button onClick={closeModal} className="w-full">
              OK
            </Button>
          </div>
        </div>
      )}

      <main className="flex-grow">
        <div className="bg-white min-h-screen">
          <div className="max-w-6xl mx-auto px-6 sm:px-20 lg:px-[110px] pt-6 pb-12">
            <div className="max-w-5xl mx-auto">
              <div className="product-detail-content">
                <div className="product-detail-image-container rounded-lg shadow-lg overflow-hidden border">
                  {isImageLoading && (
                    <div className="absolute inset-0 bg-gray-200 rounded-lg animate-pulse"></div>
                  )}
                  <img 
                    src={selectedProduct.image || 'https://via.placeholder.com/400x400.png?text=No+Image'} 
                    alt={selectedProduct.name} 
                    onLoad={() => setIsImageLoading(false)} 
                    onError={() => setIsImageLoading(false)}
                    className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : ''}`}
                  />
                </div>
                <div className="product-detail-info-container mt-6 md:mt-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h1 className="product-detail-title font-bold text-gray-800">{selectedProduct.name}</h1>
                    {!selectedProduct.stock_out && (
                      <Badge variant="secondary" className="text-green-600">In Stock</Badge>
                    )}
                    {selectedProduct.stock_out && (
                      <Badge variant="destructive">Stock Out</Badge>
                    )}
                  </div>
                  <p className="mt-2 text-gray-600 preserve-whitespace">{selectedProduct.description}</p>
                  <div className="mt-6">
                    <span className="text-3xl font-bold text-purple-600">{selectedPriceFormatted}</span>
                  </div>
                  <div className="mt-6" style={{ display: selectedProduct.pricing.length > 1 || selectedProduct.pricing[0].duration !== 'Default' ? 'block' : 'none' }}>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Select an option</label>
                    <div className="flex flex-wrap gap-3">
                      {selectedProduct.pricing.map((p, index) => (
                        <Button 
                          key={index}
                          type="button" 
                          variant={selectedDurationIndex === index ? "default" : "outline"}
                          onClick={() => setSelectedDurationIndex(index)} 
                          className={`relative py-2 px-4 border rounded-md text-sm flex items-center justify-center transition duration-button ${
                            selectedDurationIndex === index 
                              ? 'border-purple-600 text-white bg-purple-600' 
                              : 'border-gray-300 text-gray-700'
                          }`}
                        >
                          <span>{p.duration}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-8 flex">
                    <div className="flex w-full flex-row gap-4">
                      <Button 
                        onClick={() => addToCart(selectedProduct.id, 1)} 
                        variant="outline"
                        className="flex-1"
                      >
                        Add to Cart
                      </Button>
                      <Button 
                        disabled={selectedProduct.stock_out} 
                        className="flex-1"
                        onClick={() => addToCartAndGoToCheckout(selectedProduct.id, 1)}
                      >
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-12">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'description' | 'reviews')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="mt-6">
                    <div className="w-full max-w-4xl mx-auto">
                      <div 
                        className={`text-gray-700 leading-relaxed text-justify preserve-whitespace ${
                          !isDescriptionExpanded ? 'line-clamp-4' : ''
                        }`} 
                        dangerouslySetInnerHTML={{ __html: formattedLongDescription }}
                      />
                      {selectedProduct.long_description && selectedProduct.long_description.length > 300 && (
                        <Button 
                          variant="link" 
                          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} 
                          className="text-purple-600 font-bold mt-2"
                        >
                          {!isDescriptionExpanded ? 'See More' : 'See Less'}
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="reviews" className="mt-6">
                    <div className="w-full max-w-4xl mx-auto">
                      <div className="flex items-center gap-4 p-2 mb-6">
                        <i className="fas fa-user-circle text-4xl text-gray-400"></i>
                        <div className="flex">
                          <p>No reviews yet. Be the first to review this product!</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
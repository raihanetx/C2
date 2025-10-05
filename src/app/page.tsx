'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { mockCategories, mockProducts, mockHotDeals, mockSiteConfig } from '@/lib/data';
import { formatPrice } from '@/lib/helpers';
import { Product, CartItem, Modal, HotDeal } from '@/types';

export default function Home() {
  const [allCategories] = useState(mockCategories);
  const [allProductsFlat] = useState(mockProducts);
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({});
  const [siteConfig] = useState(mockSiteConfig);
  const [hotDeals] = useState(mockHotDeals);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currency, setCurrency] = useState<'USD' | 'BDT'>('USD');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<Modal>({
    visible: false,
    type: 'info',
    title: '',
    message: ''
  });
  
  // For product detail view
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedDurationIndex, setSelectedDurationIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  
  // For hero slider
  const [heroSlides, setHeroSlides] = useState({
    activeSlide: 0,
    hasImages: false,
    slides: [
      { url: '', text: 'Welcome to Submonth', bgColor: 'bg-gradient-to-r from-purple-500 to-indigo-600' },
      { url: '', text: 'Premium Digital Subscriptions', bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-600' },
      { url: '', text: 'Affordable Prices', bgColor: 'bg-gradient-to-r from-green-500 to-teal-600' }
    ]
  });
  
  // Refs
  const categoryScrollerRef = useRef<HTMLDivElement>(null);
  const heroSliderRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const infoContainerRef = useRef<HTMLDivElement>(null);
  
  // Initialize data
  useEffect(() => {
    // Group products by category
    const grouped: Record<string, Product[]> = {};
    allProductsFlat.forEach(product => {
      if (!grouped[product.category]) {
        grouped[product.category] = [];
      }
      grouped[product.category].push(product);
    });
    setProductsByCategory(grouped);
    
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
  }, [allProductsFlat]);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  
  // Save currency preference
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);
  
  // Hero slider auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlides(prev => ({
        ...prev,
        activeSlide: (prev.activeSlide + 1) % prev.slides.length
      }));
    }, siteConfig.hero_slider_interval);
    
    return () => clearInterval(interval);
  }, [siteConfig.hero_slider_interval]);
  
  // Functions
  const toggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'BDT' : 'USD');
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
    const product = allProductsFlat.find(p => p.id === productId);
    setModal({
      visible: true,
      type: 'success',
      title: 'Added to Cart',
      message: `${product?.name} has been added to your cart.`
    });
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
  
  const scrollCategories = (direction: number) => {
    if (categoryScrollerRef.current) {
      const scrollAmount = 200;
      categoryScrollerRef.current.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Prepare hot deals for rendering
  const hotDealsToRender = hotDeals.map(deal => {
    const product = allProductsFlat.find(p => p.id === deal.productId);
    if (!product) return null;
    
    return {
      href: `/${product.category_slug}/${product.slug}`,
      click_event: () => setSelectedProduct(product),
      image: product.image || 'https://via.placeholder.com/120x120.png?text=No+Image',
      name: deal.customTitle || product.name
    };
  }).filter(Boolean);
  
  // Duplicated deals for continuous scrolling
  const duplicatedDeals = [...hotDealsToRender, ...hotDealsToRender];
  
  // Calculate selected price
  const selectedPrice = selectedProduct ? selectedProduct.pricing[selectedDurationIndex].price : 0;
  const selectedPriceFormatted = formatPrice(selectedPrice, currency, siteConfig.usd_to_bdt_rate);
  
  // Format long description with line breaks
  const formattedLongDescription = selectedProduct?.long_description?.replace(/\n/g, '<br />') || '';
  
  return (
    <div className="bg-gray-50 flex flex-col min-h-screen">
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

      {/* Side Menu */}
      {isSideMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div onClick={() => setIsSideMenuOpen(false)} className="fixed inset-0 bg-black bg-opacity-50"></div>
          <div className="relative w-72 max-w-xs bg-white h-full shadow-xl p-6">
            <Button onClick={() => setIsSideMenuOpen(false)} variant="ghost" className="absolute top-4 right-4">
              <i className="fas fa-times text-xl"></i>
            </Button>
            <h2 className="text-2xl font-bold text-purple-600 mb-8">Menu</h2>
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-lg text-gray-700 hover:text-purple-600">Home</Link>
              <Link href="/about-us" className="text-lg text-gray-700 hover:text-purple-600">About Us</Link>
              <Link href="/privacy-policy" className="text-lg text-gray-700 hover:text-purple-600">Privacy Policy</Link>
              <Link href="/terms-and-conditions" className="text-lg text-gray-700 hover:text-purple-600">Terms & Conditions</Link>
              <Link href="/refund-policy" className="text-lg text-gray-700 hover:text-purple-600">Refund Policy</Link>
            </nav>
            <Separator className="my-6" />
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Categories</h3>
            <nav className="flex flex-col space-y-3">
              {allCategories.map(category => (
                <Link 
                  key={category.slug}
                  href={`/products/category/${category.slug}`} 
                  className="text-gray-600 hover:text-purple-600"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="header flex justify-between items-center px-4 bg-white shadow-md sticky top-0 z-40 h-16 md:h-20">
        {/* Mobile Header View */}
        <div className="flex items-center justify-between w-full md:hidden gap-2">
          <Link href="/" className="logo flex-shrink-0">
            <img src="https://i.postimg.cc/gJRL0cdG/1758261543098.png" alt="Submonth Logo" className="h-8" />
          </Link>
          <div className="relative flex-1 min-w-0">
            <Input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..." 
              className="w-full h-9 text-sm" 
            />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={toggleCurrency} variant="ghost" size="sm" className="flex items-center gap-1">
              <i className="fas fa-dollar-sign"></i>
              <span className="text-sm">{currency}</span>
            </Button>
            <Link href="/cart" className="relative">
              <i className="fas fa-shopping-bag text-xl text-gray-600"></i>
              {cartCount > 0 && <span className="notification-badge">{cartCount}</span>}
            </Link>
            <Button onClick={() => setIsSideMenuOpen(true)} variant="ghost" size="sm">
              <i className="fas fa-bars text-xl"></i>
            </Button>
          </div>
        </div>

        {/* Desktop Header View */}
        <div className="hidden md:flex items-center w-full gap-5">
          <Link href="/" className="logo flex-shrink-0 flex items-center text-gray-800 no-underline">
            <img src="https://i.postimg.cc/gJRL0cdG/1758261543098.png" alt="Submonth Logo" className="h-9" />
          </Link>
          <div className="relative flex-1">
            <Input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for premium subscriptions, courses, and more..." 
              className="w-full"
            />
          </div>
          <div className="flex-shrink-0 flex items-center gap-5">
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
            <Link href="/order-history">
              <i className="fas fa-receipt text-xl text-gray-600"></i>
            </Link>
            <Button onClick={() => setIsSideMenuOpen(true)} variant="ghost">
              <i className="fas fa-bars text-xl"></i>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="hero-section aspect-[2/1] md:aspect-[5/2] rounded-lg overflow-hidden" ref={heroSliderRef}>
          <div className="relative w-full h-full">
            {heroSlides.slides.map((slide, index) => (
              <div key={index} style={{ display: heroSlides.activeSlide === index ? 'flex' : 'none' }} className={`absolute inset-0 flex items-center justify-center h-full w-full ${slide.bgColor}`}>
                <span className="text-2xl md:text-4xl font-bold text-white/80 tracking-wider">{slide.text}</span>
              </div>
            ))}
          </div>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {heroSlides.slides.map((slide, index) => (
              <button 
                key={index}
                onClick={() => setHeroSlides(prev => ({ ...prev, activeSlide: index }))} 
                className={`w-2.5 h-2.5 rounded-full transition ${heroSlides.activeSlide === index ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </section>
        
        <section className="relative">
          <div className="text-center mt-6 mb-6 md:mt-8 md:mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Product Categories</h2>
          </div>
          <div className="max-w-7xl mx-auto">
            <div className="relative flex items-center justify-center gap-2 md:px-0">
              <Button onClick={() => scrollCategories(-1)} variant="ghost" className="hidden md:flex p-2">
                <i className="fas fa-chevron-left text-2xl text-gray-500"></i>
              </Button>
              <div className="overflow-hidden">
                <div className="horizontal-scroll smooth-scroll" ref={categoryScrollerRef}>
                  <div className="category-scroll-container">
                    {allCategories.map(category => (
                      <Link 
                        key={category.slug}
                        href={`/products/category/${category.slug}`} 
                        className="category-icon"
                      >
                        <i className={category.icon}></i>
                        <span>{category.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <Button onClick={() => scrollCategories(1)} variant="ghost" className="hidden md:flex p-2">
                <i className="fas fa-chevron-right text-2xl text-gray-500"></i>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Hot Deals Section */}
        {hotDealsToRender.length > 0 && (
          <section className="py-6 md:py-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl font-bold">Hot Deals</h2>
            </div>
            <div className="hot-deals-container">
              <div className="hot-deals-scroller" style={{ animationDuration: `${siteConfig.hot_deals_speed}s` }}>
                {duplicatedDeals.map((item, index) => (
                  <div 
                    key={index}
                    className="hot-deal-card cursor-pointer"
                    onClick={() => item.click_event()}
                  >
                    <div className="hot-deal-image-container">
                      <img src={item.image} alt={item.name} className="hot-deal-image" />
                    </div>
                    <span className="hot-deal-title">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {Object.entries(productsByCategory).map(([categoryName, products]) => (
          <section key={categoryName} className="py-6">
            <div className="flex justify-between items-center mb-4 px-4 md:px-6">
              <h2 className="text-2xl font-bold">{categoryName}</h2>
              <Link 
                href={`/products/category/${products[0].category_slug}`} 
                className="text-purple-600 font-bold hover:text-purple-700 flex items-center text-lg"
              >
                View all <span className="ml-2 text-2xl font-bold">&raquo;</span>
              </Link>
            </div>
            <div className="horizontal-scroll smooth-scroll">
              <div className="product-scroll-container">
                {products.map(product => (
                  <Card key={product.id} className="product-card" onClick={() => setSelectedProduct(product)}>
                    <CardContent className="p-0">
                      <div className="product-card-image-container relative">
                        <img src={product.image || 'https://via.placeholder.com/400x300.png?text=No+Image'} alt={product.name} className="product-image" />
                        {product.stock_out && (
                          <Badge variant="destructive" className="absolute top-2 right-2">
                            Stock Out
                          </Badge>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="font-bold text-sm md:text-base mb-1 line-clamp-1">{product.name}</h3>
                        <p className="text-gray-600 text-xs md:text-sm mb-2 line-clamp-2 preserve-whitespace">{product.description}</p>
                        <div className="text-purple-600 font-bold text-lg mb-2 mt-auto">{formatPrice(product.pricing[0].price, currency, siteConfig.usd_to_bdt_rate)}</div>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(product);
                          }}
                        >
                          View Details <i className="fas fa-arrow-up-right-from-square text-xs ml-2"></i>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        ))}

        <section className="why-choose-us px-4 py-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
            <Card className="feature-card p-4 text-center flex flex-col justify-center md:aspect-square">
              <div className="icon bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-dollar-sign text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-lg font-bold mb-1">Affordable Price</h3>
              <p className="text-sm text-gray-600 mt-2">Get top-tier content without breaking the bank. Quality education for everyone.</p>
            </Card>
            <Card className="feature-card p-4 text-center flex flex-col justify-center md:aspect-square">
              <div className="icon bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-award text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-lg font-bold mb-1">Premium Quality</h3>
              <p className="text-sm text-gray-600 mt-2">Expert-curated content to ensure the best learning experience and outcomes.</p>
            </Card>
            <Card className="feature-card p-4 text-center flex flex-col justify-center md:aspect-square">
              <div className="icon bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-shield-alt text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-lg font-bold mb-1">Trusted</h3>
              <p className="text-sm text-gray-600 mt-2">Join thousands of satisfied learners on our platform, building skills and careers.</p>
            </Card>
            <Card className="feature-card p-4 text-center flex flex-col justify-center md:aspect-square">
              <div className="icon bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-lock text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-lg font-bold mb-1">Secure Payment</h3>
              <p className="text-sm text-gray-600 mt-2">Your transactions are protected with encrypted payment gateways for peace of mind.</p>
            </Card>
          </div>
        </section>
      </main>

      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        {selectedProduct && (
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedProduct.name}</DialogTitle>
            </DialogHeader>
            <div className="product-detail-content">
              <div ref={imageContainerRef} className="product-detail-image-container rounded-lg overflow-hidden border">
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
              <div ref={infoContainerRef} className="product-detail-info-container mt-6 md:mt-0">
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
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
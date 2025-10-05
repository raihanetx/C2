import { NextRequest, NextResponse } from 'next/server';
import { mockProducts } from '@/lib/data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  
  let filteredProducts = mockProducts;
  
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category_slug === category);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.category.toLowerCase().includes(searchLower)
    );
  }
  
  return NextResponse.json(filteredProducts);
}
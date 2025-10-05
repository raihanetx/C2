import { NextResponse } from 'next/server';
import { mockCategories } from '@/lib/data';

export async function GET() {
  return NextResponse.json({
    categories: mockCategories,
    total: mockCategories.length
  });
}
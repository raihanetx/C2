import { NextResponse } from 'next/server';
import { mockSiteConfig } from '@/lib/data';

export async function GET() {
  return NextResponse.json({
    config: mockSiteConfig
  });
}
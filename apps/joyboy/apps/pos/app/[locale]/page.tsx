'use client';
import { redirect } from 'next/navigation';
import { defaultLocale } from '@castlery/config';

export default function RootPage() {
  return redirect(`/${defaultLocale}/products`);
}

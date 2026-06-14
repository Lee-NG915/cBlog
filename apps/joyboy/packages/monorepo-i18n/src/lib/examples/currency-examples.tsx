'use client';
import React from 'react';
import { useTranslation } from '../scripts/useTranslation.client';
import { LocalesNamespace } from '../types';

export default function Examples() {
  const { t } = useTranslation(LocalesNamespace.SHARED, { keyPrefix: 'AbbyDemos' });
  return (
    <div>
      <p>{t('title')}</p>
      {/* Variables */}
      <p>{t('variables.title')}</p>
      <p>{t('variables.description')}</p>
      <p>{t('variables.welcome', { customerName: 'John', appName: 'Castlery' })}</p>
      <br />
      {/* Numbers */}
      <p>{t('numbers.title')}</p>
      <p>{t('numbers.description')}</p>
      <p>{t('numbers.quantity', { count: 1234 })}</p>
      <p>{t('numbers.percentage', { percent: 0.15 })}</p>
      <p>{t('numbers.decimal', { rating: 4.5 })}</p>
      <br />
      {/* Currency */}
      <p>{t('currency.title')}</p>
      <p>{t('currency.description')}</p>
      <p>{t('currency.price', { value: 1999 })}</p>
      <p>{t('currency.price', { value: 1999.0 })}</p>
      <p>{t('currency.price', { value: 1999.9 })}</p>
      <p>{t('currency.price', { value: 1999.99 })}</p>
      <p>{t('currency.price', { value: 1999.999 })}</p>
      <p>{t('currency.total', { value: 1999.999 })}</p>
      <p>{t('currency.customCurrency', { value: 1999.999 })}</p>
      <br />
      {/* Date and Time */}
      <p>{t('dateTime.title')}</p>
      <p>{t('dateTime.description')}</p>
      <p>{t('dateTime.orderDate', { date: new Date() })}</p>
      <p>{t('dateTime.deliveryTime', { date: new Date() })}</p>
      <p>{t('dateTime.lastUpdated', { date: new Date() })}</p>
      <br />
      {/* Pluralization */}
      <p>{t('pluralization.title')}</p>
      <p>{t('pluralization.description')}</p>
      <p>{t('pluralization.itemCount', { count: 1 })}</p>
      <p>{t('pluralization.itemCount', { count: 3 })}</p>
      <p>{t('pluralization.productCount', { count: 0 })}</p>
      <br />
      {/* Conditional */}
      <p>{t('conditional.title')}</p>
      <p>{t('conditional.description')}</p>
      <p>{t('conditional.status', { status: 'pending' })}</p>
      <p>{t('conditional.notification', { type: 'success' })}</p>
      <p>{t('conditional.notification', { type: 'error' })}</p>
      <br />
      {/* Array */}
      <p>{t('array.title')}</p>
      <p>{t('array.description')}</p>
      <p>{t('array.features', { features: ['feature1', 'feature2', 'feature3'] })}</p>
      <p>{t('array.tags', { tags: ['tag1', 'tag2', 'tag3'] })}</p>
      <p>{t('array.list', { returnObjects: true }).map((item: string, index: number) => `=> ${index + 1} ${item} `)}</p>
      <br />
    </div>
  );
}

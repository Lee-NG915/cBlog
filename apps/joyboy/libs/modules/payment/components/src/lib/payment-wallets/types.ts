import { ReactNode } from 'react';

export interface PaymentIconConfig {
  key: string;
  url: string;
  width: number;
  height: number;
  alt?: string;
}

export interface PaymentMethodDisplayConfig {
  key: string;
  label: string;
  icons?: PaymentIconConfig[];
  instructionText?: string;
}

/**
 * Payment method adapter interface — defines the contract for future strategy pattern.
 * UI components remain agnostic of concrete adapter implementations.
 */
export interface IPaymentMethodAdapter {
  /** Execute the payment submission flow */
  submit(): Promise<void>;
  /** Render expanded content inside the method row (e.g. StripePaymentElement form) */
  renderContent?(): ReactNode;
  /** Render the payment action element (e.g. ExpressCheckoutElement button) */
  renderAction?(): ReactNode;
  /** Invoked when the adapter's ready-to-submit state changes */
  onReadyChange?(isReady: boolean): void;
  /** Invoked when the adapter encounters an error */
  onError?(message: string): void;
}

export interface IPaymentProcessingError {
  code: string;
  message: string;
}

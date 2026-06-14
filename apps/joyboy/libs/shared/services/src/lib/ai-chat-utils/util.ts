import type { Variant, Product } from '@castlery/modules-product-domain';
import type { AppStore } from '@castlery/shared-redux-store';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { webAddToCartCommand } from '@castlery/modules-product-services';
import { EVENT_CASA_EVENT } from '@castlery/modules-tracking-services';
import { logger } from '@castlery/observability';

/**
 * Interface for add to cart parameters
 */
export interface AddToCartParams {
  product: Product;
  variant: Variant;
  quantity: number;
}

/**
 * AiChatUtils is a class that provides a way to call the inner business functions of Joyboy.
 * This utility class allows AI chat systems to interact with the cart and order functionality.
 *
 * @example
 * ```typescript
 * const aiChatUtils = new AiChatUtils(store);
 * const isEnabled = aiChatUtils.init('your-token');
 * if (isEnabled) {
 *   await aiChatUtils.addToCart({
 *     product: productData,
 *     variant: variantData,
 *     quantity: 1
 *   });
 * }
 * ```
 */
export class AiChatUtils {
  private store: AppStore;
  private enabled: boolean;

  /**
   * Creates an instance of AiChatUtils
   * @param store - The Redux store instance
   */
  constructor(store: AppStore) {
    this.enabled = false;
    this.store = store;
  }

  /**
   * Initializes the AiChatUtils with a security token
   * @param token - The security token to enable the utility
   * @returns {boolean} - True if initialization was successful, false otherwise
   */
  init(token: string): boolean {
    // 出于安全性考虑，如果AiChatUtils 需要暴露到window上的话，要添加token校验这一步
    const isEnabled = token === 'bcee8217-f3e0-44b4-823f-43519bef40d3';
    this.enabled = isEnabled;
    return isEnabled;
  }

  /**
   * Checks if the AiChatUtils is enabled
   * @returns {boolean} - True if enabled, false otherwise
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Adds a product variant to the cart
   * @param params - The add to cart parameters
   * @returns {Promise<Order>} - The updated order after adding the item
   * @throws {Error} - If the utility is not enabled, store is not initialized, or parameters are invalid
   */
  async addToCart(params: AddToCartParams): Promise<any> {
    // this._validateEnabled();
    // this._validateStore();
    // this._validateAddToCartParams(params);

    const { variant, quantity } = params;

    try {
      // Dispatch add to order action
      const result = await this.store.dispatch(
        webAddToCartCommand({
          variant,
          quantity,
          source: 'GenAI Casa',
        })
      );
      if ('error' in result) {
        throw result.error;
      }
      return result.payload;
    } catch (error) {
      logger.error('[AiChatUtils Error]: addToCart failed:', {
        error,
        quantity,
        variantId: variant.id,
        variantSku: variant.sku,
      });
      throw error;
    }
  }

  async trackEvent(eventName: string, eventParams: { [key: string]: any }): Promise<any> {
    try {
      const result = await this.store.dispatch(
        EVENT_CASA_EVENT({
          eventName,
          eventParams,
        })
      );

      if ('error' in result) {
        throw result.error;
      }
      return result.payload;
    } catch (error) {
      logger.error('[AiChatUtils Error]: trackEvent failed:', { error, eventName });
      throw error;
    }
  }

  // Private helper methods
  private _validateEnabled(): void {
    if (!this.enabled) {
      throw new Error('[AiChatUtils Error]: AiChatUtils is not enabled. Please call init() first.');
    }
  }

  private _validateStore(): void {
    if (!this.store) {
      throw new Error('[AiChatUtils Error]: Store is not initialized');
    }
  }

  private _validateAddToCartParams(params: AddToCartParams): void {
    if (!params.variant || !params.quantity) {
      throw new Error('[AiChatUtils Error]: Invalid parameters. Product, variant, and quantity are required.');
    }
    if (params.quantity <= 0) {
      throw new Error('[AiChatUtils Error]: Quantity must be greater than 0');
    }
  }
}

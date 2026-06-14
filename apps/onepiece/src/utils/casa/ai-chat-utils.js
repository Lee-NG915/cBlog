import { add as addToCart } from 'redux/modules/cart';
import { EVENT_CASA_TRACK_EVENT } from 'utils/track/constants';
/*
 * AiChatUtils is a class that provides a way to call the inner biz functions of Onepiece.
 * @param {string} token - The token to use to enable the AiChatUtils.
 * @returns {AiChatUtils} - The AiChatUtils instance.
 */
export class AiChatUtils {
  constructor(store) {
    this.enabled = false;
    this.storeCopier = store;
  }

  init(token) {
    const isEnabled = token === 'bcee8217-f3e0-44b4-823f-43519bef40d3';
    this.enabled = isEnabled;
    return isEnabled;
    // 如果如果AiChatUtils不挂载到window上的话，this.enabled = true
    // this.enabled = true
  }

  isEnabled() {
    return this.enabled;
  }

  addToCart({ product, variant, quantity, ...rest }) {
    if (!this.enabled) return Promise.reject(new Error('[AiChatUtils Error]: AiChatUtils is not enabled'));
    if (!this.storeCopier) return Promise.reject(new Error('[AiChatUtils Error]: Store copier is not initialized'));
    if (!product || !variant || !quantity)
      return Promise.reject(new Error('[AiChatUtils Error]: Invalid product, variant, or quantity'));

    try {
      const promiseAddToCart = this.storeCopier.dispatch(
        addToCart({
          product,
          variant,
          quantity,
          atc_type: 'GenAI Casa',
          ...rest,
        })
      );
      return Promise.resolve(promiseAddToCart).catch((error) => {
        console.error('[AiChatUtils Error]: addToCart failed:', {
          error,
          quantity,
          variantId: variant.id,
          variantSku: variant.sku,
        });
        throw error;
      });
    } catch (error) {
      console.error('[AiChatUtils Error]: addToCart failed:', {
        error,
        quantity,
        variantId: variant.id,
        variantSku: variant.sku,
      });
      return Promise.reject(error);
    }
  }

  trackEvent(eventName, eventParams) {
    if (!this.enabled) return Promise.reject(new Error('[AiChatUtils Error]: AiChatUtils is not enabled'));
    if (!this.storeCopier) return Promise.reject(new Error('[AiChatUtils Error]: Store copier is not initialized'));
    if (!eventName) return Promise.reject(new Error('[AiChatUtils Error]: Invalid event name'));

    try {
      const promiseTrackEvent = this.storeCopier.dispatch({
        type: EVENT_CASA_TRACK_EVENT,
        result: {
          eventName,
          eventParams,
        },
      });
      return Promise.resolve(promiseTrackEvent).catch((error) => {
        console.error('[AiChatUtils Error]: trackEvent failed:', { error, eventName });
        throw error;
      });
    } catch (error) {
      console.error('[AiChatUtils Error]: trackEvent failed:', { error, eventName });
      return Promise.reject(error);
    }
  }
}

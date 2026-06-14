import {
  CHECKOUT_FEATURE_KEY,
  prePayCheck,
  addPayMethod,
  addServiceProduct,
  changeDeliveryDate,
  updateOrderForStripeLinkPay,
  updateOrderForPay,
  sendStripePaymentLink,
  setExchangeOrderNumber,
  setOrderComment,
  setAssemblyPreferences,
  confirmPayments,
  setTradePartnerId,
  removePayMethod,
  getStripeClientSecret,
  getStripeTerminalAffirmIntent,
  type AddServiceProductPayload,
  type UpdateOrderForStripeLinkPayRequest,
  completePay,
  changeAddressByOrderNumber,
  changeDeliveryOption,
} from '@castlery/modules-checkout-domain';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@castlery/shared-redux-store';
import { selectCurrentOrderNumber, selectOrderShipments, getOrderByOrderNumber } from '@castlery/modules-order-domain';
import { addPosPaymentMethod, confirmPosPayment, getPosOrderPayments } from '@castlery/modules-payment-domain';
import type { PosPaymentInitiatePayload } from '@castlery/types';
import { addAddressToUserByUid, getAddressesByUserId } from '@castlery/modules-user-domain';
//  TODO: @rickgao check this eslint rule
// eslint-disable-next-line @nx/enforce-module-boundaries
import { selectCheckoutAddress } from '@castlery/modules-composite-services';
import { handlePurchase } from '@castlery/modules-tracking-domain';
import { stripeUtil } from '@castlery/utils';
import { v4 as uuidV4 } from 'uuid';

const STRIPE_TERMINAL_AFFIRM_PAYMENT_TYPE = 'Stripe Terminal Affirm';
const COMPLETE_RETRY_STATUS = [409, 422];
const COMPLETE_MAX_RETRIES = 6;
const COMPLETE_RETRY_DELAY_MS = 2000;

const isStripeTerminalAffirm = (payType: string) => payType === STRIPE_TERMINAL_AFFIRM_PAYMENT_TYPE;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Add service product command
 * @description add disposal service or add carry-up service
 */
export const addServiceProductCommand = createAsyncThunk(
  'addServiceProductCommand',
  async (payload: AddServiceProductPayload & { type: string }, { dispatch, rejectWithValue, getState }) => {
    const rootState = getState() as RootState;
    const { type, ...rest } = payload;
    const targetShipment = selectOrderShipments(rootState)?.find((item) => item.id === rest.shipment_id);
    const selectedServices = targetShipment?.selected_service_products;

    const extraServices = selectedServices?.filter((item) => item.type !== type) || [];
    const finalExtraServices = extraServices.map((item) => {
      return item.type === 'disposal' ? { ...item, size: item.custom_attributes.disposal_item_size } : { ...item };
    });
    const services = [...finalExtraServices, ...rest.services];
    const result = {
      ...rest,
      services,
    } as AddServiceProductPayload;
    const res = await dispatch(addServiceProduct.initiate(result));
    if ('error' in res) {
      return rejectWithValue(res?.error);
    }
    return res.data;
  }
);

/**
 * Change delivery date command
 * @description change delivery date for re-schedule delivery
 */
export const changeDeliveryDateCommand = createAsyncThunk(
  'changeDeliveryDateCommand',
  async (payload: { number: string; shipmentId: number; deliveryDate: string }, { dispatch, rejectWithValue }) => {
    const res = await dispatch(changeDeliveryDate.initiate(payload));
    if ('error' in res) {
      return rejectWithValue(res?.error);
    }
    return res.data;
  }
);

/**
 * Add pay method to order command
 * @description add pay method to order
 */
export const addPayMethodToOrderCommand = createAsyncThunk(
  'addPayMethodToOrderCommand',
  async (
    payload: { orderNumber: string; id: number; name: string; payType: string; comment: string; amount: number },
    { dispatch, rejectWithValue }
  ) => {
    //Step1 :prepay check
    const checkRes = await dispatch(prePayCheck.initiate({ number: payload.orderNumber }));
    if ('error' in checkRes) {
      return rejectWithValue(checkRes?.error);
    }
    const params = {
      payments_attributes: {
        payment_method_id: payload.id,
        source_attributes: {
          payment_type: payload.payType,
          remarks: payload.comment,
        },
        amount: payload.amount,
      },
    };
    // Step2: add pay method
    const addRes = await dispatch(addPayMethod.initiate({ ...params, number: payload.orderNumber }));
    if ('error' in addRes) {
      return rejectWithValue(addRes?.error);
    }
    return addRes?.data;
  }
);

export const addStripePayMethodCommand = createAsyncThunk(
  'addStripePayMethodCommand',
  async (
    payload: {
      orderNumber: string;
      id: number;
      name: string;
      payType: string;
      comment: string;
      amount: number;
      stripeProcessingHandler: (status: 'pending' | 'success' | 'failed') => void;
    },

    { dispatch, rejectWithValue }
  ) => {
    //Prepare: check reader status
    const readerConnected = stripeUtil.checkConnectStatus();
    if (!readerConnected) {
      return rejectWithValue('Please connect reader first!');
    }
    //Step1: prepay check
    const checkRes = await dispatch(prePayCheck.initiate({ number: payload.orderNumber }));
    if ('error' in checkRes) {
      return rejectWithValue(checkRes?.error);
    }
    // Step2: get stripe client secret
    const params = {
      payments_attributes: {
        payment_method_id: payload.id,
        source_attributes: {
          payment_type: payload.payType,
          remarks: payload.comment,
        },
        amount: payload.amount,
      },
    };
    const isAffirmPayment = isStripeTerminalAffirm(payload.payType);
    const res = await dispatch(
      (isAffirmPayment ? getStripeTerminalAffirmIntent : getStripeClientSecret).initiate({
        amount: params.payments_attributes.amount,
        number: payload.orderNumber,
      })
    );
    if ('error' in res) {
      return rejectWithValue(res?.error);
    }
    // Step3: exec stripe sdk method: collect payment method
    const { client_secret } = res.data;
    const terminal = (window as any)?.terminal;
    if (!terminal) {
      return rejectWithValue('window.terminal not found');
    }
    if (!client_secret) {
      return rejectWithValue('client_secret not found');
    }
    payload.stripeProcessingHandler('pending');
    //https://docs.stripe.com/terminal/references/api/js-sdk#get-connection-status
    const { error, paymentIntent } = await terminal.collectPaymentMethod(client_secret);
    if (error) {
      payload.stripeProcessingHandler('failed'); //error.code => "payment_intent_invalid_parameter"
      return rejectWithValue(error.message);
    }
    // Step4: process payment
    if (paymentIntent) {
      const processResult = isAffirmPayment
        ? await terminal.processPayment(paymentIntent, { return_url: window.location.href })
        : await terminal.processPayment(paymentIntent);
      const { error: processError, paymentIntent: processPaymentIntent } = processResult;

      if (processError) {
        payload.stripeProcessingHandler('failed');
        return rejectWithValue(processError.message);
      }
      const charge = processPaymentIntent?.charges?.data?.[0];
      const cardDetail = charge?.payment_method_details?.card_present;
      // const numOfPaymentsBefore = getState().order?.order?.payments.data.length;
      const newParams = {
        payments_attributes: {
          ...params.payments_attributes,
          source_attributes: {
            ...params.payments_attributes.source_attributes,
            payment_intent_id: processPaymentIntent.id,
            ...(cardDetail
              ? {
                  card_brand: cardDetail.brand,
                  card_entry_method: cardDetail.read_method,
                  expiration_date: `${cardDetail.exp_month}/${cardDetail.exp_year}`,
                  masked_pan: `****${cardDetail.last4}`,
                }
              : {}),
            ...(charge?.id ? { external_reference: charge.id } : {}),
          },
        },
      };
      // Step5: add pay method
      const addRes = await dispatch(addPayMethod.initiate({ ...newParams, number: payload.orderNumber }));
      if ('error' in addRes) {
        payload.stripeProcessingHandler('failed');
        return rejectWithValue(addRes?.error);
      }
      payload.stripeProcessingHandler('success');
      return addRes?.data;
    }
    payload.stripeProcessingHandler('failed');
    return rejectWithValue('[addStripePayMethod]paymentIntent not found');
  }
);

/**
 * Stripe Terminal 支付命令 V1（新流程）
 * 根据新的时序图实现：
 * 1. 调用 initiate API 创建 PaymentIntent（无 paymentIntentId）
 * 2. 使用 client_secret 连接终端并处理支付
 * 3. 再次调用 initiate API 提交支付结果（包含 paymentIntentId）
 */
export const addStripePayMethodCommandV1 = createAsyncThunk(
  'addStripePayMethodCommandV1',
  async (
    payload: {
      orderNumber: string;
      orderId: string;
      provider: string;
      amount: string;
      description: string;
      remarks?: string;
      currency: string;
      stripeProcessingHandler: (status: 'pending' | 'success' | 'failed') => void;
    },
    { dispatch, rejectWithValue }
  ) => {
    // Prepare: check reader status
    const readerConnected = stripeUtil.checkConnectStatus();
    if (!readerConnected) {
      return rejectWithValue('Please connect reader first!');
    }

    const terminal = (window as any)?.terminal;
    if (!terminal) {
      return rejectWithValue('window.terminal not found');
    }

    try {
      // Step 1: 创建 PaymentIntent（调用 initiate API，无 paymentIntentId）
      const initiatePayload: PosPaymentInitiatePayload = {
        orderNumber: payload.orderNumber,
        orderId: payload.orderId,
        provider: payload.provider,
        amount: payload.amount,
        description: payload.description,
        remarks: payload.remarks,
        currency: payload.currency,
        idempotencyKey: uuidV4(),
        // 不包含 paymentIntentId，表示创建新的 PaymentIntent
      };

      const initiateRes = await dispatch(addPosPaymentMethod.initiate(initiatePayload));
      if ('error' in initiateRes) {
        return rejectWithValue(initiateRes?.error);
      }

      const initiateData = initiateRes.data;
      if (!initiateData?.paymentId) {
        return rejectWithValue('Failed to create PaymentIntent: no paymentId returned');
      }

      // 从 接口返回的 paymentResult.stripeResult 中提取 client_secret
      // 根据时序图，client_secret 在 metadata 中
      const clientSecret = (initiateData as any)?.paymentResult?.stripeResult?.clientSecret;

      if (!clientSecret) {
        return rejectWithValue('client_secret not found in initiate response');
      }

      // Step 2: 使用 client_secret 连接终端并处理支付
      payload.stripeProcessingHandler('pending');

      // 收集支付方式
      const { error, paymentIntent } = await terminal.collectPaymentMethod(clientSecret);
      if (error) {
        payload.stripeProcessingHandler('failed');
        return rejectWithValue(error.message);
      }

      if (!paymentIntent) {
        payload.stripeProcessingHandler('failed');
        return rejectWithValue('paymentIntent not found after collectPaymentMethod');
      }

      // 处理支付
      const { error: processError, paymentIntent: processPaymentIntent } = await terminal.processPayment(paymentIntent);
      if (processError) {
        payload.stripeProcessingHandler('failed');
        return rejectWithValue(processError.message);
      }

      if (!processPaymentIntent) {
        payload.stripeProcessingHandler('failed');
        return rejectWithValue('processPaymentIntent not found');
      }

      // 提取卡信息
      const cardDetail = processPaymentIntent.charges.data[0]?.payment_method_details?.card_present;
      if (!cardDetail) {
        payload.stripeProcessingHandler('failed');
        return rejectWithValue('card details not found in payment intent');
      }

      const externalReference = processPaymentIntent.charges.data[0]?.id;

      // Step 3: 提交支付结果（再次调用 initiate API，包含 paymentIntentId）
      // 后端会从 Stripe API 查询 PaymentIntent 获取卡信息
      const confirmPayload: any = {
        orderNumber: payload.orderNumber,
        orderId: payload.orderId,
        provider: payload.provider,
        paymentId: initiateData.paymentId,
        idempotencyKey: uuidV4(),
        confirmData: {
          provider: payload.provider,
          offlineData:
            payload.provider === 'stripe-terminal'
              ? {
                  paymentIntentId: processPaymentIntent.id,
                  externalReference: externalReference,
                }
              : undefined,
        },
        // amount: payload.amount,
        // description: payload.description,
        // remarks: payload.remarks,
        // currency: payload.currency,
        // paymentIntentId: processPaymentIntent.id, // 包含 paymentIntentId，后端会查询获取卡信息
        // externalReference: externalReference,
      };

      const confirmRes = await dispatch(confirmPosPayment.initiate(confirmPayload));

      if ('error' in confirmRes) {
        payload.stripeProcessingHandler('failed');
        return rejectWithValue(confirmRes?.error);
      }

      payload.stripeProcessingHandler('success');

      // Step 4: 刷新支付列表
      dispatch(getPosOrderPayments.initiate({ orderId: payload.orderId }, { forceRefetch: true }));

      return true;
    } catch (error) {
      payload.stripeProcessingHandler('failed');
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }
);

/**
 * Stripe Link Pay command
 * @description create stripe link pay command
 */
export const stripeLinkPayCommand = createAsyncThunk(
  'stripeLinkPayCommand',
  async (payload: { number: string }, { dispatch, getState, rejectWithValue }) => {
    if (!payload.number) {
      return rejectWithValue('Invalid order number');
    }
    // Step1 :change order
    const rootState = getState() as RootState;
    const { tradePartnerId, orderComment, exchangeOrderNumber, assemblyPreferences } = rootState[CHECKOUT_FEATURE_KEY];
    const params = {
      number: payload.number,
      special_instructions: orderComment ?? '',
      exchange_order_number: exchangeOrderNumber ?? '',
      assembly_preferences: assemblyPreferences ?? [],
      trade_partner_id: tradePartnerId ?? '',
    } as UpdateOrderForStripeLinkPayRequest;
    const res = await dispatch(updateOrderForStripeLinkPay.initiate(params));
    if ('error' in res) {
      return rejectWithValue(res?.error);
    }
    // Step2: add pay method
    const payRes = await dispatch(sendStripePaymentLink.initiate({ number: payload.number }));
    if ('error' in payRes) {
      // 失败时，刷新order
      await dispatch(getOrderByOrderNumber.initiate(payload.number));
      return rejectWithValue(payRes?.error);
    }
    return payRes.data;
  }
);

export const updateExchangeOrderNumber = createAsyncThunk(
  'updateExchangeOrderNumber',
  async (exchangeOrderNumber: string, { dispatch }) => {
    dispatch(setExchangeOrderNumber(exchangeOrderNumber));
  }
);

export const updateOrderComment = createAsyncThunk('updateOrderComment', async (orderComment: string, { dispatch }) => {
  dispatch(setOrderComment(orderComment));
});

//available_assembly_preferences
export const updateAssemblyPreferences = createAsyncThunk(
  'updateAssemblyPreferences',
  async (assemblyPreferences: string[], { dispatch }) => {
    dispatch(setAssemblyPreferences(assemblyPreferences));
  }
);
export const updateTradePartnerId = createAsyncThunk(
  'updateTradePartnerId',
  async (tradePartnerId: string, { dispatch }) => {
    dispatch(setTradePartnerId(tradePartnerId));
  }
);

/**
 * Confirm pay command
 */
export const confirmPayCommand = createAsyncThunk(
  'confirmPayCommand',
  async (orderNumber: string, { dispatch, getState, rejectWithValue }) => {
    if (!orderNumber || orderNumber === 'undefined') {
      return rejectWithValue('[confirmPayCommand]:order not found');
    }
    const rootState = getState() as RootState;

    // Step1: update order
    const { tradePartnerId, orderComment, exchangeOrderNumber, assemblyPreferences } = rootState[CHECKOUT_FEATURE_KEY];
    const params = {
      number: orderNumber,
      special_instructions: orderComment ?? '',
      exchange_order_number: exchangeOrderNumber ?? '',
      assembly_preferences: assemblyPreferences ?? [],
      trade_partner_id: tradePartnerId ?? '',
    } as UpdateOrderForStripeLinkPayRequest;

    const res = await dispatch(updateOrderForPay.initiate(params));
    if ('error' in res) {
      return rejectWithValue(res?.error);
    }

    //Step2 :prepay check
    const checkRes = await dispatch(prePayCheck.initiate({ number: orderNumber }));
    if ('error' in checkRes) {
      return rejectWithValue(checkRes?.error);
    }
    // Step3: confirm pay
    const payRes = await dispatch(confirmPayments.initiate({ number: orderNumber }));
    if ('error' in payRes) {
      await dispatch(getOrderByOrderNumber.initiate(orderNumber));
      return rejectWithValue(payRes?.error);
    }
    // Step4: complete pay
    let completeRes = await dispatch(completePay.initiate({ number: orderNumber }));
    let retryCount = 0;

    while ('error' in completeRes) {
      const status = Number((completeRes.error as { status?: number | string })?.status);
      const canRetry = COMPLETE_RETRY_STATUS.includes(status);
      const reachMaxRetry = retryCount >= COMPLETE_MAX_RETRIES;

      if (!canRetry || reachMaxRetry) {
        return rejectWithValue(completeRes?.error);
      }

      retryCount += 1;
      await sleep(COMPLETE_RETRY_DELAY_MS);
      completeRes = await dispatch(completePay.initiate({ number: orderNumber }));
    }
    await dispatch(handlePurchase());
    return completeRes.data;
  }
);

export const removePayMethodCommand = createAsyncThunk(
  'removePayMethodCommand',
  async (payload: { number: string; id: number }, { dispatch, rejectWithValue }) => {
    const res = await dispatch(removePayMethod.initiate(payload));
    if ('error' in res) {
      return rejectWithValue(res?.error);
    }
    return res.data;
  }
);

export const addAddressForNewCustomerCommand = createAsyncThunk(
  'checkout/addAddressForNewCustomerCommand',
  async ({ address, uid }: { uid: number; address: any }, { dispatch, rejectWithValue }) => {
    try {
      const { data: newAddresses } = await dispatch(
        addAddressToUserByUid.initiate({
          uid: uid,
          address: address,
        })
      );
      const newAddress = newAddresses[newAddresses.length - 1];
      if (!newAddress?.id) {
        throw new Error('Address id not found');
      }
      await dispatch(
        getAddressesByUserId.initiate(uid, {
          forceRefetch: true,
        })
      );
      return;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addAddressCommand = createAsyncThunk(
  'checkout/addAddressCommand',
  async (
    { address, uid, type }: { uid: number; address: any; type?: 'ship_address' | 'bill_address' },
    { dispatch, getState, rejectWithValue }
  ) => {
    try {
      const rootState = getState() as RootState;
      const { data: newAddresses } = await dispatch(
        addAddressToUserByUid.initiate({
          uid: uid,
          address: address,
        })
      );
      const newAddress = newAddresses[newAddresses.length - 1];
      if (!newAddress?.id) {
        throw new Error('Address id not found');
      }
      await dispatch(
        getAddressesByUserId.initiate(uid, {
          forceRefetch: true,
        })
      );
      const { billingAddress, shippingAddress } = selectCheckoutAddress(rootState);
      const orderNumber = selectCurrentOrderNumber(rootState);
      if (!orderNumber) {
        throw new Error('Order number not found');
      }

      if (!(billingAddress && shippingAddress)) {
        return await dispatch(
          changeAddressByOrderNumber.initiate({
            number: orderNumber,
            ship_address_attributes: newAddress,
            bill_address_attributes: newAddress,
          })
        ).unwrap();
      }

      if (type === 'bill_address') {
        await dispatch(
          changeAddressByOrderNumber.initiate({
            number: orderNumber,
            ship_address_attributes: shippingAddress,
            bill_address_attributes: newAddress,
          })
        ).unwrap();
      }

      if (type === 'ship_address') {
        await dispatch(
          changeAddressByOrderNumber.initiate({
            number: orderNumber,
            bill_address_attributes: billingAddress,
            ship_address_attributes: newAddress,
          })
        ).unwrap();
      }
      return;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const changeDeliveryOptionCommand = createAsyncThunk(
  'checkout/changeDeliveryOptionCommand',
  async (mode: 'lead_time' | 'all_together', { dispatch, rejectWithValue, getState }) => {
    const rootState = getState() as RootState;
    const number = selectCurrentOrderNumber(rootState);
    if (!number) {
      return rejectWithValue('Order number not found');
    }
    const res = await dispatch(changeDeliveryOption.initiate({ number, mode })).unwrap();
    if ('error' in res) {
      return rejectWithValue(res?.error);
    }
    return;
  }
);

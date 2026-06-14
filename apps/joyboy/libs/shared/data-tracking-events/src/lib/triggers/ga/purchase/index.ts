import { EnvHelper } from '../../../adapters';
import { transaction as posTransaction } from './offline-purchase.trigger';

export const transactionMap = new Map([['POS', posTransaction]]);
export const transaction = transactionMap.get(EnvHelper.client) || posTransaction;

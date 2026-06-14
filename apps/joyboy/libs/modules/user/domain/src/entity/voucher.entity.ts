import { Voucher as _Voucher } from '@castlery/types';

export interface VoucherResponse {
  data: {
    vouchers: Voucher[];
  };
  code: number;
  msg: string;
}

export type Voucher = _Voucher;

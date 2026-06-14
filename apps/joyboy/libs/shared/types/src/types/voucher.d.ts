export interface Voucher {
  version: string;
  name: string;
  voucherType: string;
  code: string;
  voucherTime: {
    startTime: string;
    endTime: string;
  };
  state: number; // 0: available, 1: unavailable, 2: expired, 3: used
  content: {
    usingRuleDescription: string;
    discountDescription: string;
    unavailableReason: string;
    upgradeDescription: string;
    usingRuleDetail: string; //using rule detail, split by \n
  };
}

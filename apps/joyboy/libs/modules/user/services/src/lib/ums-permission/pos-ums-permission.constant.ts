export const POS_UMS_PERMISSIONS = {
  /**
   * POS 按钮权限
   * Push to online按钮
   * Checkout按钮
   * 选择customer
   */
  posTransactionAccess: 'POS_transaction:access',
  /**
   * POS_pages:read
   * POS所有页面可访问，可操作（除了POS transaction和POS manual discount的）
   */
  posPagesRead: 'POS_pages:read',
  /**
   * POS_cart:discount
   * POS cart discount可操作(product和service)
   */
  posCartDiscount: 'POS_cart:discount',
} as const;

// 定义一个简单的选择器函数，直接从state中获取order
export const selectOrderFromAdapter = (state: any) => {
  // 假设order存储在state.order.order中
  // 这里的路径需要根据您的实际Redux状态结构调整
  return state.order?.order || null;
};

export const selectCartDataFromAdapter = (state: any) => {
  return state.cart?.cartRoot || null;
};

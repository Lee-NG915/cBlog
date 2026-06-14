import { ExtraArgument } from '@castlery/shared-redux-extra';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { UserSubscription, SubscriptionsGroups } from '@castlery/types';
import { updateUserSubscriptions, getUserSubscriptions, createUserSubscriptions } from '../api/user.api';

export const getCustomerId = createAsyncThunk('user/getCustomerId', async (_, { extra }) => {
  const { persistenceHandles } = extra as ExtraArgument;
  // TODO 后续去拿 Order 里的 customerID
  return persistenceHandles.customerId.getItem();
});

/**
 * 检查是否需要加载订阅数据
 * @param subscriptions 当前订阅状态
 * @returns 是否需要加载
 */
export function needLoadSubscriptions(subscriptions: UserSubscription | undefined): boolean {
  return !subscriptions;
}

/**
 * 创建更新后的消息组数据
 * @param currentSubscription 当前订阅数据
 * @param subscriptionData 要更新的订阅数据
 * @returns 更新后的消息组数组
 */
export function createUpdatedMessageGroups(
  currentSubscription: UserSubscription,
  subscriptionData: { email?: boolean; sms?: boolean }
): SubscriptionsGroups[] {
  // 查找 promotions 消息组
  const targetGroupIndex = currentSubscription.message_groups.findIndex((g) => g.name === 'promotions');

  if (targetGroupIndex === -1) {
    throw new Error('Promotions message group not found');
  }

  const targetGroup = currentSubscription.message_groups[targetGroupIndex];

  // 检查是否有变化
  const noChange = Object.keys(subscriptionData).every(
    (key) =>
      subscriptionData[key as keyof typeof subscriptionData] ===
      targetGroup.deliver_types[key as keyof typeof targetGroup.deliver_types]
  );

  // 完整的变化检查：值相同且键的数量也相同
  if (noChange && Object.keys(subscriptionData).length === Object.keys(targetGroup.deliver_types).length) {
    // 没有变化，返回原数据
    return currentSubscription.message_groups;
  }

  // 创建新的消息组数组
  const newMessageGroups: SubscriptionsGroups[] = currentSubscription.message_groups.slice();
  newMessageGroups.splice(targetGroupIndex, 1, {
    ...targetGroup,
    deliver_types: {
      ...targetGroup.deliver_types,
      ...subscriptionData,
    },
  });

  return newMessageGroups;
}

/**
 * 创建初始订阅（当用户没有订阅数据时）
 * 注意：这个函数需要根据实际的后端 API 来实现
 */
export const createInitialSubscription = createAsyncThunk(
  'user/createInitialSubscription',
  async (_email: string, { dispatch: _dispatch }) => {
    // 这里需要根据实际的 API 端点来实现
    // 原始代码中是 POST /subscriptions
    // 目前先抛出错误，提示需要实现
    throw new Error('createInitialSubscription needs to be implemented with actual API endpoint');

    // 实际实现应该类似：
    // const result = await dispatch(createSubscription.initiate({ email })).unwrap();
    // return result;
  }
);

/**
 * 更新用户订阅设置的 thunk
 * 使用方式：dispatch(updateMsgGroupsSubscription({ subscriptionData: { email: true, sms: false }, unsubscribeReason: '' }))
 */
export const updateMsgGroupsSubscription = createAsyncThunk(
  'user/updateMsgGroupsSubscription',
  async (
    {
      subscriptionData,
      unsubscribeReason = '',
    }: {
      subscriptionData: { email?: boolean; sms?: boolean };
      unsubscribeReason?: string;
    },
    { getState, dispatch }
  ) => {
    const state = getState() as any;
    const sub = state.user.subscriptions;
    const email = state.user.user.email;

    if (sub) {
      const targetGroupIndex = sub.message_groups.findIndex((g: any) => g.name === 'promotions');

      if (targetGroupIndex === -1) {
        return Promise.reject();
      }

      const targetGroup = sub.message_groups[targetGroupIndex];
      const noChange = Object.keys(subscriptionData).every(
        (key) =>
          subscriptionData[key as keyof typeof subscriptionData] ===
          targetGroup.deliver_types[key as keyof typeof targetGroup.deliver_types]
      );
      if (noChange && Object.keys(subscriptionData) === Object.keys(targetGroup.deliver_types)) {
        return Promise.resolve(sub);
      }

      const newMessageGroups = sub.message_groups.slice();
      newMessageGroups.splice(targetGroupIndex, 1, {
        ...targetGroup,
        deliver_types: {
          ...targetGroup.deliver_types,
          ...subscriptionData,
        },
      });
      return await dispatch(
        updateUserSubscriptions.initiate({
          unsubscribe_reason: unsubscribeReason,
          message_groups: newMessageGroups,
        })
      ).unwrap();
    }

    return await dispatch(createUserSubscriptions.initiate({ email: email })).unwrap();

    // if (!currentSubscription) {
    //   // 如果没有订阅数据，先创建订阅（与原始代码逻辑一致）
    //   // 原始代码逻辑：先创建订阅，然后递归调用更新
    //   const user = state.user.user; // 假设用户信息在 state.user.user 中
    //   if (!user?.email) {
    //     throw new Error('User email not found for creating subscription');
    //   }

    //   // 注意：这里需要实际的创建订阅 API
    //   // 原始代码中是 POST /subscriptions，目前先抛出提示
    //   throw new Error('No subscription data found. Please implement createInitialSubscription API first.');

    //   // 原始逻辑应该是：
    //   // await dispatch(createInitialSubscription(user.email));
    //   // return await dispatch(updateMsgGroupsSubscription({ subscriptionData, unsubscribeReason }));
    // }

    // // 创建更新后的消息组
    // const newMessageGroups = createUpdatedMessageGroups(currentSubscription, subscriptionData);
    // // 如果没有变化，直接返回当前数据
    // if (newMessageGroups === currentSubscription?.message_groups) {
    //   return currentSubscription;
    // }

    // // 调用 API 更新订阅
    // const result = await dispatch(
    //   updateUserSubscriptions.initiate({
    //     unsubscribe_reason: unsubscribeReason,
    //     message_groups: newMessageGroups,
    //   })
    // ).unwrap();

    // return result;
  }
);

/**
 * 如果需要的话加载订阅数据
 */
export const loadSubscriptionsIfNeeded = createAsyncThunk(
  'user/loadSubscriptionsIfNeeded',
  async (_, { getState, dispatch }) => {
    const state = getState() as any; // 避免循环依赖
    const currentSubscriptions = state.user.subscriptions;

    if (needLoadSubscriptions(currentSubscriptions)) {
      const result = await dispatch(getUserSubscriptions.initiate()).unwrap();
      return result;
    }

    return currentSubscriptions;
  }
);

/**
 * 更新单个订阅类型（email 或 sms）
 */
export const updateSingleSubscription = createAsyncThunk(
  'user/updateSingleSubscription',
  async (
    { subscriptionType, isSubscribed }: { subscriptionType: 'email' | 'sms'; isSubscribed: boolean },
    { dispatch }
  ) => {
    const subscriptionData = { [subscriptionType]: isSubscribed };

    return await dispatch(
      updateMsgGroupsSubscription({
        subscriptionData,
        unsubscribeReason: isSubscribed ? '' : 'User preference',
      })
    ).unwrap();
  }
);

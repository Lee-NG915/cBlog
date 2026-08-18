import type { ClaimedEvent } from "../events";

/**
 * 投递结果：
 * - delivered：runtime 链路（revalidation-webhook）即终态；
 * - awaiting_deploy：static 链路已触发构建，等部署 callback 收敛，
 *   externalId 为驱动侧批次标识（= publication_deployments.external_id）。
 */
export type DeliverOutcome =
  | { outcome: "delivered" }
  | { outcome: "awaiting_deploy"; externalId: string };

export interface DeliverOptions {
  /** Static worker 预先持久化的幂等批次 ID；runtime 驱动忽略。 */
  externalId?: string;
}

export type DeliverFn = (
  event: ClaimedEvent,
  options?: DeliverOptions
) => Promise<DeliverOutcome>;

import { EcEnv } from '@castlery/config';
import type { TransactionObservabilityContext } from './types';

function getDefaultServiceName(): string {
  const channel = EcEnv.NEXT_PUBLIC_CHANNEL?.toLowerCase() || 'web';
  return `joyboy-${channel}`;
}

export function createTransactionContext(context: TransactionObservabilityContext): TransactionObservabilityContext {
  return {
    region: EcEnv.NEXT_PUBLIC_COUNTRY?.toLowerCase(),
    locale: EcEnv.NEXT_PUBLIC_LOCALE,
    channel: EcEnv.NEXT_PUBLIC_CHANNEL?.toLowerCase(),
    env: EcEnv.NEXT_PUBLIC_APPLICATION_ENV,
    service: getDefaultServiceName(),
    version: process.env.NEXT_PUBLIC_VERSION,
    release: process.env.NEXT_PUBLIC_VERSION,
    ...context,
  };
}

export function withTransactionResult(
  context: TransactionObservabilityContext,
  result: TransactionObservabilityContext['result']
): TransactionObservabilityContext {
  return createTransactionContext({
    ...context,
    result,
  });
}

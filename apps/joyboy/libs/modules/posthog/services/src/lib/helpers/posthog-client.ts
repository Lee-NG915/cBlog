import { PostHog } from 'posthog-node';
import { EcEnv } from '@castlery/config';
import { logger } from '@castlery/observability/server';

const PUBLIC_POSTHOG_KEY = EcEnv.NEXT_PUBLIC_POSTHOG_KEY;
const PUBLIC_POSTHOG_HOST = EcEnv.NEXT_PUBLIC_POSTHOG_HOST;

export default function PostHogClient() {
  if (PUBLIC_POSTHOG_KEY === undefined) {
    logger.error('PostHog key is not defined');
    return;
  }
  const posthogClient = new PostHog(PUBLIC_POSTHOG_KEY, {
    host: PUBLIC_POSTHOG_HOST,
  });
  return posthogClient;
}

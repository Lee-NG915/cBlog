import { defaultRegion, EcEnv } from '@castlery/config';
// import { getStorySlug, getValidStorySlugs } from '@castlery/modules-cms-services';
// import { getKnightSuffix, getValidKnightSuffix } from '@castlery/utils';
import { createHmac } from 'crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { captureStructuredError, BUSINESS_DOMAIN } from '@castlery/observability/server';
import { sbContentTypes } from '@castlery/modules-cms-services';

const forwardRequest = async (url: string, body: any, headers: Headers) => {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });

  return response;
};

const otherCountries = ['sg', 'au', 'us', 'ca', 'uk'];

export async function POST(request: Request, response: Response) {
  const payload = await request.json();
  const payloadString = JSON.stringify(payload);
  const signature = request.headers.get('webhook-signature') as string | undefined;
  const generateSignature = getSignature(payloadString);
  const isValid = generateSignature === signature;
  if (isValid) {
    try {
      // this should be the actual path not a rewritten path
      // e.g. for "/blog/[slug]" this should be "/blog/post-1"
      const regexLayout = /^([a-z]{2})\/general-content-v2\/product-pages\/pla-layout\/([a-z0-9-]+)$/;
      const regexBlogPosts = /^([a-z]{2})\/general-content-v2\/ugc-pgc\/blog\/.*/;
      const regexCountry = /^([a-z]{2})\//;

      const layoutMatch = payload?.full_slug ? payload?.full_slug.match(regexLayout) : null;
      const countryMatch = payload?.full_slug ? payload?.full_slug.match(regexCountry) : null;
      const blogPostsMatch = payload?.full_slug ? payload?.full_slug.match(regexBlogPosts) : null;

      if (countryMatch) {
        const countryCode = countryMatch[1];
        if (countryCode?.toLocaleLowerCase() !== EcEnv.NEXT_PUBLIC_COUNTRY?.toLocaleLowerCase()) {
          if (otherCountries.includes(countryCode?.toLocaleLowerCase())) {
            // 触发别的国家
            const targetWebhookUrl = `${
              EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME
            }/${countryCode?.toLocaleLowerCase()}/api/storyblok`; // 目标国家的 webhook URL
            await forwardRequest(targetWebhookUrl, payload, request.headers); // 转发请求
            return new Response('Distributed to other countries successfully', { status: 200 });
          }
          return new Response('Wrong Country', { status: 500 });
        }
      }
      if (layoutMatch) {
        const countryCode = layoutMatch[1]; // 'sg'
        const layout = layoutMatch[2]; // 'pla-layout-a'
        revalidateTag(payload?.full_slug);
        revalidatePath(`/[device]/${countryCode.toLocaleLowerCase()}/${defaultRegion}/(pla)/pla/[slug]/${layout}`);
        return new Response('Layout revalidate successful', { status: 200 });
      }

      if (blogPostsMatch) {
        revalidateTag(`sb-${sbContentTypes.BlogPage}`);
        return new Response('Blog folder related info revalidate successful', { status: 200 });
      }

      revalidateTag(payload?.full_slug);
      return new Response(`${payload?.full_slug} info revalidate successful`, { status: 200 });
    } catch (err) {
      // If there was an error, Next.js will continue
      // to show the last successfully generated page
      captureStructuredError(err, { domain: BUSINESS_DOMAIN.CMS });
      return new Response('Error revalidating', { status: 500 });
    }
  }
  return new Response(
    JSON.stringify({
      isValid,
      payload,
    }),
    { status: 200 }
  );
}

const getSignature = (body: any) =>
  createHmac('sha1', EcEnv.NEXT_PUBLIC_STORYBLOK_WEBHOOK_SECRET || 'eb70046ad70b85e8cf5ae2c808061b9f8edb4780')
    .update(body)
    .digest('hex');

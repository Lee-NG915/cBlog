import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@castlery/observability/server';

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('url');
  try {
    if (!query) throw new Error('url is required');
    const res = await fetch(query, {
      next: {
        revalidate: 60,
        tags: [`${query}`],
      },
    });
    return new Response(await res.text(), {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    logger.error('service worker error', { error });
    return NextResponse.json({ message: '处理失败' }, { status: 500 });
  }
};

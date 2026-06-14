import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@castlery/observability/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const uid = searchParams.get('uid');
  const platform = searchParams.get('platform');

  if (!uid || !platform) {
    return NextResponse.json({ error: 'Missing required parameters: uid and platform' }, { status: 400 });
  }

  if (!['ios', 'android'].includes(platform)) {
    return NextResponse.json({ error: 'Invalid platform. Must be ios or android' }, { status: 400 });
  }

  try {
    // 直接调用 Sketchfab API，而不是循环调用自己
    const sketchfabUrl = `https://sketchfab.com/i/archives/ar?model=${uid}&platform=${platform}`;

    const response = await fetch(sketchfabUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Castlery/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Sketchfab API error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data?.url) {
      return NextResponse.json({ url: data.url });
    } else {
      return NextResponse.json({ error: 'AR model URL not found' }, { status: 404 });
    }
  } catch (error) {
    logger.error('Error fetching AR model from Sketchfab', { error });
    return NextResponse.json({ error: 'Failed to fetch AR model URL' }, { status: 500 });
  }
}

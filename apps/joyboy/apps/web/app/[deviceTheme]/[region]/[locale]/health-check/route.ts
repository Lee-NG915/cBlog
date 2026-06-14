// export async function GET(req: Request) {
//   return new Response('OK', { status: 200 });
// }
import { NextRequest, NextResponse } from 'next/server';
// TODO:等 middleware PR 合并完成后 再去 joyboy-deploy 更新为最新的 api/[region]/health-check/route.ts
export async function GET(request: NextRequest) {
  return new NextResponse('ok');
}

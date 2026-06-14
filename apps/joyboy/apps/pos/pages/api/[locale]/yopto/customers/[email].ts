import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🚀 ~ file: [email].ts:4 ~ handler ~ req:', req);
  const { email } = req.query;
  // 调用 https://loyalty.yotpo.com/api/v2/customers 然后返回

  res.status(200).json({ email });
}

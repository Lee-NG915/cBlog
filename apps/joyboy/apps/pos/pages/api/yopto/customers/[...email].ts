import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🚀 ~ file: [email].ts:4 ~ handler ~ req:', req);
  const { email } = req.query;
  res.end(`Email: ${email}`);
}

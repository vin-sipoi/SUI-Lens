import { NextApiRequest, NextApiResponse } from 'next/server';

// This API endpoint for claiming bounties is deprecated and no longer supported.
export async function POST(req: NextApiRequest, res: NextApiResponse) {
  return res.status(410).json({ error: "Bounty claiming is no longer supported in this API." });
}

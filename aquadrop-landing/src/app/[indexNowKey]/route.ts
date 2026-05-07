import { notFound } from 'next/navigation';

type IndexNowKeyParams = {
  params: Promise<{
    indexNowKey: string;
  }>;
};

export async function GET(_request: Request, { params }: IndexNowKeyParams) {
  const { indexNowKey } = await params;
  const indexNowKeyEnv = process.env.INDEXNOW_KEY?.trim();

  if (!indexNowKeyEnv || indexNowKey !== `${indexNowKeyEnv}.txt`) {
    notFound();
  }

  return new Response(indexNowKeyEnv, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
}

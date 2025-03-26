import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  image?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | { error: string }>
) {
  if (req.method === 'POST') {
    const { url } = req.body;
    // url'ye göre dinamik işlem yapabilirsiniz; burada sadece sabit resim döndürüyoruz.
    res.status(200).json({
      image: '/icons/logom2.png',
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

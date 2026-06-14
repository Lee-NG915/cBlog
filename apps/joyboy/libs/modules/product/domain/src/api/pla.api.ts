// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { EcEnv } from '@castlery/config';

// export const plaApi = api.injectEndpoints({
// //   endpoints: (builder) => {
// //   },
// });
// export const {  } = plaApi;
// export const {  } = plaApi.endpoints;

export const getAllProductsServer = async () => {
  try {
    const res = await fetch(`${EcEnv.NEXT_PUBLIC_API_HOST}/product/_search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        size: 3,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const hits = data?.hits?.hits;
      if (hits) {
        const arr = hits.map((hit: any) => hit._source.slug);
        const realArr = Array.isArray(arr) ? arr : [];
        return Promise.resolve(realArr);
      }
      throw new Error('no hits');
    }
    throw new Error('not ok');
  } catch (err) {
    return Promise.resolve([]);
  }
};

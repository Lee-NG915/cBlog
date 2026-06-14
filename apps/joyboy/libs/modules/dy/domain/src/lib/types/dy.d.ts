declare global {
  interface Window {
    DY: {
      recommendationContext:
        | {
            type: string;
            data: string[];
          }
        | undefined;
      ServerUtil: {
        getProductsData: (
          skus: string[],
          arg1: any[],
          arg2: string,
          arg3: boolean,
          callback: (err: any, res: any) => void
        ) => void; // eslint-disable-next-line @typescript-eslint/no-explicit-any
      };
    };
    DYO: {
      dyhash: {
        sha256: (email: string) => string;
      };
    };
  }
}

export {};

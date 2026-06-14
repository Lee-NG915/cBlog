import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { fetchFromStoryblok } from '../fetch';

const withServerSideRendering = <P extends object>({
  ClientComponent,
  requestArr,
  onDataFetched,
}: {
  ClientComponent: ComponentType<P>;
  requestArr: string[];
  onDataFetched?: (data: any[]) => Partial<P>;
}): ComponentType<P> => {
  const DynamicComponent = dynamic<P>(() => Promise.resolve(ClientComponent), {
    ssr: true,
  });

  const ServerSideRenderedComponent: ComponentType<P> = async (props: P) => {
    const response = (await fetchFromStoryblok({ slugArray: requestArr })) || [];
    let finalProps: P = props;
    if (onDataFetched) {
      const data = onDataFetched(response);
      finalProps = { ...props, ...data };
    }
    return <DynamicComponent {...finalProps} />;
  };

  return ServerSideRenderedComponent;
};

export { withServerSideRendering };

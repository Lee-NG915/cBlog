import { SbWidgetsServer } from './widgetsRender.server';
import { SbWidgetsClient } from './widgetsRender.client';
import { sbApiClient } from '../../storyblok';

interface SbWidgetsProps {
  widgets: string;
}

export const SbWidgets = async (props: SbWidgetsProps) => {
  const { widgets, ...rest } = props;

  const blok = await sbApiClient.getWidgets(`${widgets}`);
  return (
    <>
      <SbWidgetsClient blok={blok?.content ?? {}} />
      <SbWidgetsServer blok={blok?.content ?? {}} {...rest} />
    </>
  );
};

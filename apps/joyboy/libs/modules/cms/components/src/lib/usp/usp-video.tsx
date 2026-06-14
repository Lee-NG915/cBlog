'use client';
import { MediaVideo } from '@castlery/shared-components';

interface USPVideoProps {
  //TODO: add props
  src: string;
}
export const USPVideo = (props: USPVideoProps) => {
  return <MediaVideo {...props} />;
};
export default USPVideo;

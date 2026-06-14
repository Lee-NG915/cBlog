import { withServerSideRendering } from '@castlery/modules-cms-services';
import Footer from '../footer/footer';
import { EcEnv } from '@castlery/config';

const apiPrefix = EcEnv.NEXT_PUBLIC_COUNTRY?.toLowerCase();
const WebGlobalFooter = async () => {
  const ServerSideFooter = withServerSideRendering({
    ClientComponent: Footer,
    requestArr: [`${apiPrefix}/configuration/footer`],
    onDataFetched: (data) => {
      const footerData = data[0]?.data?.list || [];
      const socialList = data[0]?.data?.socialList || [];
      const bottomList = data[0]?.data?.bottomList || [];
      const mobileList = data[0]?.data?.mobileList || [];
      return {
        footerData,
        socialList,
        bottomList,
        mobileList,
      };
    },
  });

  return <ServerSideFooter footerData={[]} socialList={[]} bottomList={[]} mobileList={[]} />;
};

export { WebGlobalFooter };

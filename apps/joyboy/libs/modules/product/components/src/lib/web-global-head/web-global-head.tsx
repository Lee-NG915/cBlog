import { getStorySlug, withServerSideRendering } from '@castlery/modules-cms-services';
import WebGlobalNav from '../web-global-nav/web-global-nav';
import { isOutdated } from '@castlery/modules-cms-services';
import { WebNoticeBar } from '../web-notice-bar/web-notice-bar';
import { EcEnv } from '@castlery/config';

export const apiPrefix = EcEnv.NEXT_PUBLIC_COUNTRY?.toLowerCase();
const getStorySlugPath = getStorySlug(apiPrefix, undefined, undefined);
const WebGlobalHead = ({ noticeHadClose }: { noticeHadClose: boolean }) => {
  const ServerSideGlobalNav = withServerSideRendering({
    ClientComponent: WebGlobalNav,
    // requestArr: [`${apiPrefix}/configuration/global-nav`],
    requestArr: [`${getStorySlugPath?.globalNav}`],
    onDataFetched: (data) => {
      const globalNavData = data[0]?.data?.items || [];
      const filteredGlobalNavData = globalNavData.filter(
        (item: { published_at: string; ended_at: string }) => !isOutdated(item.published_at, item.ended_at)
      );
      return {
        globalNavData: filteredGlobalNavData,
      };
    },
  });

  const ServerSideNoticeBar = withServerSideRendering({
    ClientComponent: WebNoticeBar,
    // requestArr: [`${apiPrefix}/configuration/notice`],
    requestArr: [`${getStorySlugPath?.configurationNotice}`],
    onDataFetched: (data) => {
      const noticeBarData = data[0]?.data?.notice || [];
      const noticeBarMobileData = data[0]?.data?.notice_mobile || [];
      const noticeNum = data[0]?.data?.limit_num || 0;
      const filteredNoticeBarData = noticeBarData.filter(
        (item: { published_at: string; ended_at: string }) => !isOutdated(item.published_at, item.ended_at)
      );
      const filteredNoticeBarMobileData = noticeBarMobileData.filter(
        (item: { published_at: string; ended_at: string }) => !isOutdated(item.published_at, item.ended_at)
      );
      return {
        noticeBarData: filteredNoticeBarData.slice(0, noticeNum) || [],
        noticeBarMobileData: filteredNoticeBarMobileData.slice(0, noticeNum) || [],
        noticeClose: noticeHadClose,
      };
    },
  });

  return (
    <>
      <ServerSideNoticeBar noticeBarData={[]} noticeBarMobileData={[]} hadClose={noticeHadClose} />
      <ServerSideGlobalNav globalNavData={[]} />
    </>
  );
};

export { WebGlobalHead };

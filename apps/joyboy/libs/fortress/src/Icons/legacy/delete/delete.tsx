import Icons, { IconsProps } from '../../Icons';

export type DeleteProps = IconsProps;

/**
 * - sm
 *   - 0.875 rem 14 px
 * - md (defalut)
 *   - 1 rem 16 px
 * - lg
 *   - 1.125 rem 18 px
 * - xl
 *   - 1.25 rem 20 px
 * - xl2 (big)
 *   - 1.5 rem 24 px
 * @param props
 * @returns
 */
export function Delete(props: DeleteProps) {
  return (
    <Icons {...props}>
      <path d="M7.625 19.8875C7.175 19.8875 6.79167 19.7292 6.475 19.4125C6.15833 19.0958 6 18.7125 6 18.2625V5.88749H5V4.88749H9V4.11249H15V4.88749H19V5.88749H18V18.2625C18 18.7292 17.846 19.1168 17.538 19.4255C17.2293 19.7335 16.8417 19.8875 16.375 19.8875H7.625ZM17 5.88749H7V18.2625C7 18.4458 7.05833 18.5958 7.175 18.7125C7.29167 18.8292 7.44167 18.8875 7.625 18.8875H16.375C16.5417 18.8875 16.6873 18.8248 16.812 18.6995C16.9373 18.5748 17 18.4292 17 18.2625V5.88749ZM9.8 16.8875H10.8V7.88749H9.8V16.8875ZM13.2 16.8875H14.2V7.88749H13.2V16.8875ZM7 5.88749V18.8875V18.2625V5.88749Z" />
    </Icons>
  );
}

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/

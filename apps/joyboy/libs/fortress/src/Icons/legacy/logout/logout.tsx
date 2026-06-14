import Icons, { IconsProps } from '../../Icons';

export type LogoutProps = IconsProps;

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
export function Logout(props: LogoutProps) {
  return (
    <Icons {...props}>
      <path d="M5.8 20.5C5.35 20.5 4.97066 20.346 4.662 20.038C4.354 19.7293 4.2 19.3417 4.2 18.875V5.125C4.2 4.65833 4.354 4.271 4.662 3.963C4.97066 3.65433 5.35 3.5 5.8 3.5H12.225V4.5H5.8C5.65 4.5 5.51266 4.56267 5.388 4.688C5.26266 4.81267 5.2 4.95833 5.2 5.125V18.875C5.2 19.0417 5.26266 19.1873 5.388 19.312C5.51266 19.4373 5.65 19.5 5.8 19.5H12.225V20.5H5.8ZM16.275 15.55L15.575 14.825L17.875 12.5H9.225V11.5H17.875L15.575 9.175L16.275 8.45L19.8 12L16.275 15.55Z" />
    </Icons>
  );
}

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/

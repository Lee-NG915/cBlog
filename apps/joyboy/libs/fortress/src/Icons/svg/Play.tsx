import Icons, { SvgIconProps } from '../Icons';

export default function (props: SvgIconProps) {
  return (
    <Icons {...props}>
      <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24">
        <path d="M8 19V5L19 12L8 19Z" />
      </svg>
    </Icons>
  );
}

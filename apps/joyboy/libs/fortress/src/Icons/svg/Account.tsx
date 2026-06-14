import Icons, { IconsProps } from '../Icons';

// https://www.zhangxinxu.com/sp/svgo/

export default function (props: IconsProps) {
  return (
    <Icons {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.527 15.627c-2.072-1.172-3.466-3.356-3.466-5.859C5.061 6.031 8.172 3 12.01 3c3.838 0 6.95 3.03 6.95 6.768 0 2.507-1.398 4.694-3.477 5.864L22 19.217V22H2v-2.783l6.527-3.59zm3.483-.198c-3.228 0-5.824-2.545-5.824-5.66s2.596-5.661 5.824-5.661c3.229 0 5.825 2.546 5.825 5.66 0 3.115-2.596 5.661-5.825 5.661zm-8.885 5.463v-1.025l6.623-3.643a8.278 8.278 0 0 0 4.508.002l6.62 3.641v1.025H3.124z"
      />
    </Icons>
  );
}

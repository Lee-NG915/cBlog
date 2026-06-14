'use client';
import { Button, Stack } from '@castlery/fortress';
import { CmsIcon } from '../cms-icon/cms-icon';
import { storyblokEditable } from '@storyblok/react/rsc';
import { useTrackingTags } from '@castlery/modules-tracking-components';
import { ButtonStoryblok } from '@castlery/types';

export interface CmsButtonProps {
  blok: ButtonStoryblok;
  onCustomClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  /**
   * used in gtm tracking data
   */
  outerModuleName?: string;
  sx?: object;
}

export function CmsButton({
  outerModuleName = '',
  blok,
  onCustomClick,
  sx,
  loading,
  disabled,
  ...rest
}: CmsButtonProps) {
  const {
    text,
    variant = 'primary',
    start_decorator = null,
    end_decorator = null,
    link,
    tracking_label,
    data_selenium,
    id,
  } = blok || {}; //klaviyo_form_id, link
  const hasLink = !!link && typeof link === 'string';

  if (text === 'Add To Cart') {
    // console.log(blok, outerModuleName, '=====> add to cart blok');
  }

  const buttonTrackingTags = useTrackingTags({
    moduleName: outerModuleName,
    elementName: blok?.text,
    ...(tracking_label ? { content: { trackingLabel: tracking_label } } : {}),
  });

  return (
    <Stack {...storyblokEditable(blok)} key={blok._uid}>
      {hasLink ? (
        <Button
          {...buttonTrackingTags}
          onClick={onCustomClick}
          component={'a'}
          variant={variant}
          disabled={disabled}
          href={link}
          id={id || blok?._uid}
          data-selenium={data_selenium || ''}
          sx={{ height: 52, ...(sx || {}) }}
          startDecorator={start_decorator ? <CmsIcon name={start_decorator} /> : null}
          endDecorator={end_decorator ? <CmsIcon name={end_decorator} /> : null}
          loading={loading}
          {...rest}
        >
          {text}
        </Button>
      ) : (
        <Button
          {...buttonTrackingTags}
          onClick={onCustomClick}
          variant={variant}
          disabled={disabled}
          loading={loading}
          id={id || blok?._uid}
          data-selenium={data_selenium || ''}
          startDecorator={start_decorator ? <CmsIcon name={start_decorator} /> : null}
          endDecorator={end_decorator ? <CmsIcon name={end_decorator} /> : null}
          sx={{ height: 52, ...(sx || {}) }}
          {...rest}
        >
          {text}
        </Button>
      )}
    </Stack>
  );
}

export default CmsButton;

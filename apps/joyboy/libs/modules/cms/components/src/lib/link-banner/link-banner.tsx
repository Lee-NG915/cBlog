'use client';

import { Link, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import RightArrow from '@castlery/fortress/Icons/svg/RightArrow';
import { DtStack } from '@castlery/modules-tracking-components';
import { storyblokEditable, StoryblokServerComponent } from '@storyblok/react/rsc';
import { hasRichText } from '../../utils/rich-text-utils';
import { Button, ButtonProps } from '../component-v1/button';
import { RichTextTypography } from '../component-v1/components';
import { ImageProps } from '../component-v1/image';
import { NextFortressLink } from '@castlery/shared-components';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_STORYBLOK } from '@castlery/modules-tracking-services';
import { KlaviyoInputFormProps } from '../klaviyo_input_form';

interface LinkBannerProps {
  blok: {
    header: string;
    header_level: 'h1' | 'h2';
    header_color: string;
    description: string;
    image: ImageProps[];
    background_color: string;
    link: {
      text: string;
      url: string;
      text_color: string;
      open_in_new_tab?: boolean;
    }[];
    button: ButtonProps[];
    link_text_color: string;
    klaviyo_signup_form: KlaviyoInputFormProps[];
    _uid: string;
    whole_link?: boolean;
  };
}

const LinkBanner = ({ blok }: LinkBannerProps) => {
  const { desktop } = useBreakpoints();
  // const [isHovered, setIsHovered] = useState(false);
  const {
    header,
    header_level = 'h1',
    header_color,
    description,
    image,
    link = [
      {
        url: 'sale',
        text: 'Go Sale',
        text_color: '#fff',
      },
    ],
    link_text_color,
    background_color,
    _uid,
    button,
    whole_link = false,
    klaviyo_signup_form,
  } = blok;

  const dispatch = useAppDispatch();

  const handleLinkClick = () => {
    dispatch(EVENT_STORYBLOK({ action: 'link_banner_click', label: header, method: document?.title || '' }));
  };

  const renderContent = () => {
    if (!desktop) {
      return (
        <Stack
          sx={(theme) => ({
            width: '100%',
            backgroundColor: background_color || theme.palette.brand.maroonVelvet[500],
            padding: theme.spacing(6),
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            minHeight: '260px',
          })}
        >
          {image.length > 0 && (
            <Stack
              className="link-banner-image"
              sx={() => ({
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                div: {
                  height: '100%',
                  div: {
                    '--AspectRatio-paddingBottom': '0 !important',
                  },
                },
              })}
            >
              {image.map((nestedBlok) => (
                <StoryblokServerComponent
                  blok={nestedBlok}
                  key={nestedBlok._uid}
                  loader={{
                    ratio: !desktop ? 0.5538 : 0.417,
                  }}
                  sizes={['1-xs', '1-sm']}
                  lazy={true}
                />
              ))}
            </Stack>
          )}
          <Stack
            sx={(theme) => ({
              position: 'relative',
              zIndex: 1,
              alignItems: 'center',
              gap: theme.spacing(4),
            })}
          >
            <Typography
              level={header_level}
              sx={(theme) => ({
                color: header_color || theme.palette.brand.warmLinen[500],
                // mb: '16px',
                textAlign: 'center',
              })}
            >
              {header}
            </Typography>
            {hasRichText(description) && (
              <RichTextTypography
                description={description}
                sx={(theme) => ({
                  color: theme.palette.brand.warmLinen[500],
                  textAlign: 'center',
                })}
              />
            )}
            {button.length > 0 && (
              <Stack
                sx={(theme) => ({
                  alignItems: 'center',
                  // mb: '16px',
                })}
              >
                {button.map((button) => (
                  <Button key={button?._uid} blok={button} color={button.color} textColor={button.text_color} />
                ))}
              </Stack>
            )}
            {link.length > 0 && !whole_link && (
              <Link
                target={link[0].open_in_new_tab ? '_blank' : '_self'}
                onClick={handleLinkClick}
                target={link[0].open_in_new_tab ? '_blank' : '_self'}
                href={`${link[0].url}`}
                sx={(theme) => ({
                  width: 'fit-content',
                  color: link_text_color || theme.palette.brand.warmLinen[500],
                  textDecorationColor: link_text_color || theme.palette.brand.warmLinen[500],
                  '&:hover': {
                    color: link_text_color || theme.palette.brand.warmLinen[500],
                    textDecorationColor: link_text_color || theme.palette.brand.warmLinen[500],
                  },
                })}
                endDecorator={
                  <RightArrow
                    sx={(theme) => ({
                      fill: link_text_color || theme.palette.brand.warmLinen[500],
                      ml: theme.spacing(1),
                    })}
                  />
                }
              >
                Find out more
              </Link>
            )}
            {klaviyo_signup_form?.length > 0 && (
              <Stack
                sx={{
                  width: '100%',
                }}
              >
                {klaviyo_signup_form.map((nestedBlok) => (
                  <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
                ))}
              </Stack>
            )}
          </Stack>
        </Stack>
      );
    }
    return (
      <Stack
        sx={(theme) => ({
          width: '100%',
          minHeight: '315px',
          justifyContent: 'center',
          backgroundColor: background_color || theme.palette.brand.maroonVelvet[500],
          padding: '0 60px',
          alignItems: 'center',
          position: 'relative',
        })}
        // onMouseEnter={() => {
        //   setIsHovered(true);
        // }}
        // onMouseLeave={() => setIsHovered(false)}
      >
        {image.length > 0 && (
          <Stack
            className="link-banner-image"
            sx={() => ({
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              div: {
                height: '100%',
                div: {
                  '--AspectRatio-paddingBottom': '0 !important',
                },
              },
            })}
          >
            {image.map((nestedBlok) => (
              <StoryblokServerComponent
                blok={nestedBlok}
                key={nestedBlok._uid}
                loader={{
                  ratio: !desktop ? 0.5538 : 0.417,
                }}
                sizes={['1-xs', '1-md', '1-lg', '0.8-xl']}
                lazy={true}
              />
            ))}
          </Stack>
        )}
        <Stack
          sx={(theme) => ({
            position: 'relative',
            zIndex: 3,
            alignItems: 'center',
          })}
        >
          <Typography
            level={header_level}
            sx={(theme) => ({
              color: header_color || theme.palette.brand.warmLinen[500],
              mb: theme.spacing(6),
              textAlign: 'center',
            })}
          >
            {header}
          </Typography>
          {hasRichText(description) && (
            <RichTextTypography
              description={description}
              sx={(theme) => ({
                color: theme.palette.brand.warmLinen[500],
                mb: theme.spacing(6),
                textAlign: 'center',
              })}
            />
          )}
          {button.length > 0 && (
            <Stack
              sx={(theme) => ({
                alignItems: 'center',
                mb: theme.spacing(6),
              })}
            >
              {button.map((button) => (
                <Button key={button?._uid} blok={button} color={button.color} textColor={button.text_color} />
              ))}
            </Stack>
          )}
          {link.length > 0 && !whole_link && (
            <Link
              target={link[0].open_in_new_tab ? '_blank' : '_self'}
              onClick={handleLinkClick}
              href={`${link[0].url}`}
              sx={(theme) => ({
                width: 'fit-content',
                color: link[0].text_color || theme.palette.brand.warmLinen[500],
                textDecorationColor: link[0].text_color || theme.palette.brand.warmLinen[500],
              })}
              endDecorator={
                <RightArrow
                  sx={(theme) => ({
                    fill: link_text_color || theme.palette.brand.warmLinen[500],
                    ml: theme.spacing(1),
                  })}
                />
              }
            >
              {link[0].text}
            </Link>
          )}
          {klaviyo_signup_form?.length > 0 && (
            <Stack
              sx={{
                width: '100%',
              }}
            >
              {klaviyo_signup_form.map((nestedBlok) => (
                <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
              ))}
            </Stack>
          )}
        </Stack>
        {/* {isHovered && (
          <Stack
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              top: 0,
              zIndex: 2,
              pointerEvents: 'none',
              background: 'rgba(50, 52, 51, 0.2)',
            }}
          />
        )} */}
      </Stack>
    );
  };

  if (!desktop) {
    return (
      <DtStack useImpression {...storyblokEditable(blok)} componentName="link-banner" uid={_uid} key={_uid}>
        {whole_link && link.length > 0 ? (
          <NextFortressLink sx={{ textDecoration: 'none' }} href={`${link[0].url}`}>
            {renderContent()}
          </NextFortressLink>
        ) : (
          <>{renderContent()}</>
        )}
      </DtStack>
    );
  }

  return (
    <DtStack useImpression {...storyblokEditable(blok)} componentName="link-banner" uid={_uid} key={_uid}>
      {whole_link && link.length > 0 ? (
        <NextFortressLink sx={{ textDecoration: 'none' }} href={`${link[0].url}`}>
          {renderContent()}
        </NextFortressLink>
      ) : (
        <>{renderContent()}</>
      )}
    </DtStack>
  );
};

export { LinkBanner };

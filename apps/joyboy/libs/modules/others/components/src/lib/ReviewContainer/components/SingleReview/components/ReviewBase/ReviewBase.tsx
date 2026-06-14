'use client';

import { EcEnv } from '@castlery/config';
import { Stack, Typography } from '@castlery/fortress';
import { CustomLink, FortressImage, Rating } from '@castlery/shared-components';

type ReviewBaseProps = {
  user_name: string;
  rating: number;
  variant: {
    is_available: boolean;
    images: {
      links: {
        feed: string;
      };
    }[];
    product_name: string;
    product_slug: string;
    variant_option_values: {
      option_type_presentation: string;
      presentation: string;
      option_type_name: string;
      name: string;
    }[];
  };
};

const ReviewBase = ({ user_name, rating, variant }: ReviewBaseProps) => {
  const decorateSlug = () => {
    if (variant.variant_option_values.length === 0) {
      return variant.product_slug;
    }
    const variations = variant.variant_option_values.map((item, index) => {
      return `${item.option_type_name}=${item.name}${index === variant.variant_option_values.length - 1 ? '' : '&'}`;
    });
    return `${variant.product_slug}?${variations.join('')}`;
  };
  return (
    <Stack
      sx={(theme) => ({
        minWidth: theme.spacing(59),
        alignItems: 'flex-start',
        mr: {
          sx: 0,
          md: theme.spacing(10),
        },
        mb: {
          sx: theme.spacing(5),
          md: theme.spacing(8),
        },
        maxWidth: {
          sx: '100%',
          md: theme.spacing(59),
        },
      })}
    >
      <Typography
        level="body1"
        sx={(theme) => ({
          mb: theme.spacing(1),
        })}
      >
        {user_name}
      </Typography>
      <Stack
        sx={(theme) => ({
          width: 'fit-content',
          mb: {
            sx: theme.spacing(2),
            md: theme.spacing(4),
          },
        })}
      >
        <Rating rating={rating} size={20} innerColor={'#844025'} outerColor={'#CCCCCC'} />
      </Stack>

      {variant.is_available ? (
        <Stack
          sx={(theme) => ({
            mb: {
              sx: theme.spacing(2),
              md: theme.spacing(4),
            },
            a: {
              textDecorationColor: theme.palette.brand.burntOrange[500],
            },
          })}
        >
          <CustomLink
            href={`${
              EcEnv.NEXT_PUBLIC_ONEPIECE_HOST
            }/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/products/${decorateSlug()}`}
          >
            {variant.images[0]?.links.feed && (
              <FortressImage
                src={variant.images[0].links.feed}
                alt={variant.product_name}
                imageWidth={120}
                imageHeight={120}
                sx={(theme) => ({
                  width: theme.spacing(30),
                  height: theme.spacing(30),
                  objectFit: 'cover',
                  mb: {
                    sx: theme.spacing(2),
                    md: theme.spacing(4),
                  },
                })}
              />
            )}
            <Typography
              level="body1"
              sx={(theme) => ({
                mb: theme.spacing(2),
                color: theme.palette.brand.burntOrange[500],
                maxWidth: theme.spacing(59),
                whiteSpace: 'wrap',
              })}
            >
              {variant.product_name}
            </Typography>
          </CustomLink>
        </Stack>
      ) : (
        <>
          {variant.images[0]?.links.feed && (
            <FortressImage
              src={variant.images[0]?.links.feed}
              alt={variant.product_name}
              imageWidth={120}
              imageHeight={120}
              sx={(theme) => ({
                width: theme.spacing(30),
                height: theme.spacing(30),
                objectFit: 'cover',
                mb: {
                  sx: theme.spacing(2),
                  md: theme.spacing(4),
                },
              })}
            />
          )}
          <Typography
            level="body1"
            sx={(theme) => ({
              mb: theme.spacing(2),
              maxWidth: theme.spacing(59),
              whiteSpace: 'wrap',
            })}
          >
            {variant.product_name}
          </Typography>
        </>
      )}
      {variant.variant_option_values.map((option) => (
        <Typography
          level="caption1"
          sx={(theme) => ({
            mb: theme.spacing(2),
            color: theme.palette.brand.mono[700],
          })}
        >
          {option.option_type_presentation}: {option.presentation}
        </Typography>
      ))}
    </Stack>
  );
};

export { ReviewBase };

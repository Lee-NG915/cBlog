'use client';

import { Stack, Typography, Button, useBreakpoints } from '@castlery/fortress';
import { DYRecommendationCarousel, FortressImage } from '@castlery/shared-components';
import { resultAssetsConfiguration } from './result-assets-configuration';
import { Download } from '@castlery/fortress/Icons';
import { HoverListing } from './components/hover-listing';
import { useEffect, useMemo, useState } from 'react';

const downloadResult = {
  tgg: 'https://res.cloudinary.com/castlery/image/upload/v1774859909/User%20segmentation%20quiz/Report%20Cards/Report_Cards_TGG_results_V3.jpg',
  is: 'https://res.cloudinary.com/castlery/image/upload/v1774859908/User%20segmentation%20quiz/Report%20Cards/Report_Cards_IS_results_V3.jpg',
  rr: 'https://res.cloudinary.com/castlery/image/upload/v1774859910/User%20segmentation%20quiz/Report%20Cards/Report_Cards_RR_results_V3.jpg',
  pph: 'https://res.cloudinary.com/castlery/image/upload/v1774859909/User%20segmentation%20quiz/Report%20Cards/Report_Cards_PPH_results_V3.jpg',
  pht: 'https://res.cloudinary.com/castlery/image/upload/v1774859910/User%20segmentation%20quiz/Report%20Cards/Report_Cards_PHT_results_V3.jpg',
};

const DYRecommendationCarouselName = {
  tgg: 'Skyline Penthouse',
  is: 'Rainforest Lodge',
  rr: 'Country Farmhouse',
  pph: 'Coastal Villa',
  pht: 'Bed & Breakfast',
};

const ResultPage = ({ result }: { result: string }) => {
  const [currentResult, setCurrentResult] = useState<string | undefined>(undefined);

  const resultAssets = useMemo(() => {
    return resultAssetsConfiguration[currentResult as keyof typeof resultAssetsConfiguration];
  }, [currentResult]);

  useEffect(() => {
    setCurrentResult(result);
  }, [result]);

  const { desktop } = useBreakpoints();

  const onClickDownload = () => {
    window.open(downloadResult[currentResult as keyof typeof downloadResult], '_blank');
  };

  const dynamicCards = useMemo(() => {
    const wholeCardsList = [
      {
        header: 'Skyline Penthouse',
        image: {
          desktop: {
            src: 'https://res.cloudinary.com/castlery/image/upload/v1779940725/hardcode%20pages/TGG_Skyline_Penthouse.jpg',
            ratio: 0.75,
          },
          mobile: {
            src: 'https://res.cloudinary.com/castlery/image/upload/v1779940725/hardcode%20pages/TGG_Skyline_Penthouse.jpg',
            ratio: 0.64,
          },
        },
        button: {
          text: 'Learn more',
          to: 'tgg',
        },
        onClickChange: () => setCurrentResult('tgg'),
      },
      {
        header: 'Rainforest Lodge',
        image: {
          desktop: {
            src: 'https://res.cloudinary.com/castlery/image/upload/v1779940787/hardcode%20pages/IS_Rainforest_Lodge.jpg',
            ratio: 0.75,
          },
          mobile: {
            src: 'https://res.cloudinary.com/castlery/image/upload/v1779940787/hardcode%20pages/IS_Rainforest_Lodge.jpg',
            ratio: 0.64,
          },
        },
        button: {
          text: 'Learn more',
          to: 'is',
        },
        onClickChange: () => setCurrentResult('is'),
      },
      {
        header: 'Country Farmhouse',
        image: {
          desktop: {
            src: 'https://res.cloudinary.com/castlery/image/upload/v1779940822/hardcode%20pages/RR_Country_Farmhouse.jpg',
            ratio: 0.75,
          },
          mobile: {
            src: 'https://res.cloudinary.com/castlery/image/upload/v1779940822/hardcode%20pages/RR_Country_Farmhouse.jpg',
            ratio: 0.64,
          },
        },
        button: {
          text: 'Learn more',
          to: 'rr',
        },
        onClickChange: () => setCurrentResult('rr'),
      },
      {
        header: 'Coastal Villa',
        image: {
          desktop: {
            src: 'https://res.cloudinary.com/castlery/image/upload/v1779940844/hardcode%20pages/PPH_Coastal_Villa.jpg',
            ratio: 0.75,
          },
          mobile: {
            src: 'https://res.cloudinary.com/castlery/image/upload/v1779940844/hardcode%20pages/PPH_Coastal_Villa.jpg',
            ratio: 0.64,
          },
        },
        button: {
          text: 'Learn more',
          to: 'pph',
        },
        onClickChange: () => setCurrentResult('pph'),
      },
      {
        header: 'Bed & Breakfast',
        image: {
          desktop: {
            src: 'https://res.cloudinary.com/castlery/image/upload/v1779940864/hardcode%20pages/PHT_Bed_and_Breakfast.jpg',
            ratio: 0.75,
          },
          mobile: {
            src: 'https://res.cloudinary.com/castlery/image/upload/v1779940864/hardcode%20pages/PHT_Bed_and_Breakfast.jpg',
            ratio: 0.64,
          },
        },
        button: {
          text: 'Learn more',
          to: 'pht',
        },
        onClickChange: () => setCurrentResult('pht'),
      },
    ];
    return wholeCardsList.filter((card) => card.button.to !== currentResult);
  }, [currentResult]);

  return (
    <Stack>
      {resultAssets &&
        resultAssets.map((asset, index) => {
          if (index === 2) {
            return (
              <Stack key={index} sx={{ position: 'relative' }}>
                <FortressImage
                  src={desktop ? asset.desktop.src : asset.mobile.src}
                  alt={`${result} ${index + 1}`}
                  ratio={desktop ? asset.desktop.ratio : asset.mobile.ratio}
                />
              </Stack>
            );
          }
          return (
            <FortressImage
              key={index}
              src={desktop ? asset.desktop.src : asset.mobile.src}
              alt={`${result} ${index + 1}`}
              ratio={desktop ? asset.desktop.ratio : asset.mobile.ratio}
            />
          );
        })}
      <Stack
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          padding: `0 ${theme.spacing(4)} ${theme.spacing(6)} ${theme.spacing(4)}`,
          backgroundColor: theme.palette.brand.warmLinen[500],
          ...(desktop && {
            backgroundColor: '#f6f9ea',
          }),
        })}
      >
        <Button startDecorator={<Download />} onClick={onClickDownload}>
          Share My Results
        </Button>
      </Stack>
      <DYRecommendationCarousel
        selector_name={DYRecommendationCarouselName[currentResult as keyof typeof DYRecommendationCarouselName]}
      />
      <HoverListing header="Explore other vacation homes" items={dynamicCards} />
      <Stack
        sx={(theme) => ({
          alignItems: 'center',
          backgroundColor: theme.palette.brand.warmLinen[500],
          paddingBottom: theme.spacing(10),
          ...(!desktop && {
            padding: `0 ${theme.spacing(4)} ${theme.spacing(6)} ${theme.spacing(4)}`,
          }),
        })}
      >
        <Button
          size="lg"
          sx={(theme) => ({
            width: 'fit-content',
            ...(!desktop && {
              width: '100%',
            }),
          })}
          onClick={() => {
            window.location.reload();
            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            });
          }}
        >
          Retake the Quiz
        </Button>
      </Stack>
    </Stack>
  );
};

export { ResultPage };

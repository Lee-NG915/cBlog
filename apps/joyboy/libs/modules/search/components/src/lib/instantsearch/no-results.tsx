import { EcEnv } from '@castlery/config';
import { Container, Stack, Typography } from '@castlery/fortress';
// eslint-disable-next-line
import { DYRecommendationCarousel } from '@castlery/shared-components';

export function NoResults() {
  // const { results } = useInstantSearch();

  // const hasRefinements = results.getRefinements().length > 0;
  // const description = hasRefinements ? 'Try to reset your applied filters.' : 'Please try another query.';

  return (
    <Container>
      <Stack justifyContent="center" height="100%">
        <Typography
          level="body1"
          sx={{
            mt: 4,
            mb: 9,
            textAlign: 'center',
          }}
        >
          We couldn't find any results that matched your criteria, but tweaking your search may help.
        </Typography>
        {EcEnv.NEXT_PUBLIC_CHANNEL === 'POS' ? null : (
          <>
            <DYRecommendationCarousel
              selector_name="LP 0 Search (API)"
              containerSx={{
                p: 0,
              }}
            />
            <DYRecommendationCarousel
              selector_name="LP 0 Search (API) 2"
              containerSx={{
                p: 0,
              }}
            />
            <DYRecommendationCarousel
              selector_name="LP 0 Search (API) 3"
              containerSx={{
                p: 0,
              }}
            />
          </>
        )}
      </Stack>
    </Container>
  );
}

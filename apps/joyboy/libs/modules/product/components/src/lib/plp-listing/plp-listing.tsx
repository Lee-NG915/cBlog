import { HitSub } from '@castlery/modules-product-domain';
import { Card, Grid, useBreakpoints } from '@castlery/fortress';
import ProductCubeItem from '../product-cube-item/product-cube-item';

/* eslint-disable-next-line */
export interface PlpListingProps {
  list: HitSub[];
}

export function PLPListing(props: PlpListingProps) {
  const { list } = props;
  const { desktop } = useBreakpoints();

  return (
    <Card>
      <Grid
        container
        direction='row'
        // spacing={2}
      >
        {list.map((item, index) => {
          return (
            <Grid
              sx={{
                width: !desktop ? '50%' : '25%',
                display: 'flex',
                justifyContent: 'center',
                position: 'relative'
              }}
              key={index}
            >
              <ProductCubeItem {...item} />
            </Grid>
          );
        })}
      </Grid>
    </Card>
  );
}

export default PLPListing;

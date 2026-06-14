import React from 'react';
import { Box, Stack, Typography, Select } from 'fortress';
import Option from '@mui/joy/Option';
import { Country, OrderItems } from 'fortress/GlobalReview/hooks/useGlobalReview';

type ReviewMoreHeaderProps = {
  setOrderItems: (newValue: OrderItems) => void;
  setSelectCountry: (newValue: Country) => void;
  selectCountry: Country;
};

const ReviewMoreHeader = ({ setOrderItems, setSelectCountry, selectCountry }: ReviewMoreHeaderProps) => {
  const renderRecommendTypeList = () => {
    return (
      <>
        <Option value="recommended">Recommended</Option>
        <Option value="most_recent">Most Recent</Option>
        <Option value="rating_high_to_low">Rating - High to Low</Option>
        <Option value="rating_low_to_high">Rating - Low to High</Option>
        <Option value="with_image">With Pictures</Option>
      </>
    );
  };
  const renderCountryTypeList = () => {
    return (
      <>
        <Option value="ALL">All Reviews</Option>
        <Option value="SG">Singapore</Option>
        <Option value="AU">Australia</Option>
        <Option value="US">United States</Option>
      </>
    );
  };
  const renderSelectBar = () => {
    return (
      <Stack
        sx={() => ({
          display: 'flex',
          flexDirection: 'row',
        })}
      >
        <Box
          sx={() => ({
            marginRight: 3,
          })}
        >
          <Select
            onChange={(event: React.SyntheticEvent | null, newValue: OrderItems) => setOrderItems(newValue)}
            defaultValue="recommended"
          >
            {renderRecommendTypeList()}
          </Select>
        </Box>
        <Box>
          <Select
            onChange={(event: React.SyntheticEvent | null, newValue: Country) => setSelectCountry(newValue)}
            defaultValue={selectCountry}
            value={selectCountry}
          >
            {renderCountryTypeList()}
          </Select>
        </Box>
      </Stack>
    );
  };
  return (
    <Box
      sx={() => ({
        paddingBottom: 2,
      })}
    >
      <Typography
        sx={(theme) => ({
          fontSize: '1.25rem',
          fontWeight: 600,
          color: theme.palette.brand.charcoal[900],
          fontFamily: '"MinervaModern", "Helvetica Neue", Arial, sans-serif',
          lineHeight: '1.2',
          paddingBottom: 1,
        })}
      >
        Customers Reviews
      </Typography>
      {renderSelectBar()}
    </Box>
  );
};

export default ReviewMoreHeader;

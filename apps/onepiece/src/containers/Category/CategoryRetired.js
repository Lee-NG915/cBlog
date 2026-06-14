import React from 'react';
import RetiredPage from 'components/RetiredPage';
import { wrapPage } from 'utils/page';

const CategoryRetired = () => <RetiredPage />;

export default wrapPage({
  fromCategoryRetired: true,
})(CategoryRetired);

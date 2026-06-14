import { getUrl } from 'pages';
import { getHistory } from 'helpers/History';

// 40003 => out of stock
// 10001 => not enough item, deprecated,
// 40018 => order state invalid, https://app.clickup.com/t/1vj1wb
// 40019 => promotion become ineligible, https://app.clickup.com/t/200eut

// error codes that need redirecting to cart page
const ERROR_CODES = [40003, 10001, 40018, 40019];
export default (error) => {
  if (error && error.errors && ERROR_CODES.includes(error.errors[0].code)) {
    const history = getHistory();
    history.push({
      pathname: getUrl('cart'),
      state: {
        error,
      },
    });
    return true;
  }

  return false;
};

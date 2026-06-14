import { useRouterHistory as withRouterHistory } from 'react-router';

let browserHistory;
let getNamespace;
if (__SERVER__) {
  getNamespace = require('cls-hooked').getNamespace;
}

export function getHistory() {
  if (__SERVER__) {
    return getNamespace('castlery').get('history');
  }
  if (__CLIENT__) {
    return browserHistory;
  }
}

export const setUpBrowserHistory = () => {
  const createBrowserHistory = require('history/lib/createBrowserHistory').default;
  browserHistory = withRouterHistory(createBrowserHistory)({
    basename: __BASE_ROUTE__,
  });
  return browserHistory;
};

export const setUpMemoryHistory = (entry) => {
  const createMemoryHistory = require('history/lib/createMemoryHistory').default;
  const history = withRouterHistory(() => createMemoryHistory(entry))({
    basename: __BASE_ROUTE__,
  });
  getNamespace('castlery').set('history', history);
  return history;
};

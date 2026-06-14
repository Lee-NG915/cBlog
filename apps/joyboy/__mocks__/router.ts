// __mocks__/next/router.js

const useRouter = jest.fn().mockReturnValue({
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
});
const useParams = jest.fn();

export { useRouter, useParams };

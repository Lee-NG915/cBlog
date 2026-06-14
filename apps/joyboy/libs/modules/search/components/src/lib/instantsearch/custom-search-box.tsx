import { useSearchBox } from 'react-instantsearch';

// This component exists solely to enable InstantSearchNext to recognize the 'q' parameter in the URL.
// The primary search box functionality is handled by a separate autocomplete component within the project.
// Currently, there's no direct connection between that autocomplete component and InstantSearchNext;
// they are linked through the URL, which synchronizes their data.
export function CustomSearchBox() {
  const { query: _ } = useSearchBox();

  return <></>;
}

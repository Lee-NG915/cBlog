import type { Theme, CssVarsThemeOptions } from '@mui/joy';
import type { Components as JoyComponents } from '@mui/joy/styles/components';
import type { Components as MuiComponents } from '@mui/material/styles';

import './overrides/Fab';
import './overrides/Palette';
import './overrides/Shadow';
// import './overrides/Mixins';
import './overrides/Typography';
import './overrides/Autocomplete';
import './overrides/Button';
import './overrides/Breakpoint';
import './overrides/Card';
import './overrides/IconButton';
import './overrides/Input';
import './overrides/Option';
import './overrides/Select';
import './overrides/Tag';
import './overrides/Pagination';
import './overrides/Components';
import './overrides/Tab';
import './overrides/TabList';
import './overrides/RadioButton';

export type ThemeSchema = Theme & {
  components?: JoyComponents<Theme> & MuiComponents<Theme>;
};

export * from './overrides/Palette';
export * from './overrides/Shadow';
export * from './overrides/Typography';
export * from './overrides/Autocomplete';
export * from './overrides/Button';
export * from './overrides/Breakpoint';
export * from './overrides/Card';
export * from './overrides/IconButton';
export * from './overrides/Input';
export * from './overrides/Option';
export * from './overrides/Select';
export * from './overrides/Tag';
export * from './overrides/Pagination';
export * from './overrides/Link';
export * from './overrides/Components';
export * from './overrides/Fab';
export * from './overrides/Tab';
export * from './overrides/TabList';
export * from './overrides/RadioButton';

export type FortressThemeOptions = CssVarsThemeOptions;

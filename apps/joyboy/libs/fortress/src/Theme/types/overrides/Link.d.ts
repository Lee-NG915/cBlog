// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CssVarsThemeOptions, OverridableStringUnion } from '@mui/joy';

declare module '@mui/joy/Link' {
  // 定义size类型的覆盖接口
  interface LinkPropsSizeOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
  }

  interface LinkPropsVariantOverrides {
    primary: true;
    secondary: true;
    tertiary: true;
  }

  interface LinkPropsColorOverrides {
    secondary: true;
    tertiary: true;
  }
}

// 扩展LinkTypeMap以包含size属性
declare module '@mui/joy/Link' {
  interface LinkTypeMap<P = {}, _D extends React.ElementType = 'a'> {
    props: P & {
      /**
       * The size of the link.
       * @default 'md'
       */
      size?: OverridableStringUnion<'xs' | 'sm' | 'md' | 'lg', LinkPropsSizeOverrides>;
    };
  }
}

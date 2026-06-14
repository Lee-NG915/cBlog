import {
  Dropdown,
  Link,
  ListItemDecorator,
  Sheet,
  SxProps,
  optionClasses,
  selectClasses,
  useBreakpoints,
} from '@castlery/fortress';
import { AUFlag, CAFlag, ExpandMore, SGFlag, UKFlag, USFlag } from '@castlery/fortress/Icons';
import React from 'react';
// import { Dropdown, ListItemDecorator, Sheet, SxProps, optionClasses, selectClasses } from 'fortress';
// import { AUFlag, ExpandMore, SGFlag, USFlag } from 'fortress/Icons';

export type CountrySelectorProps = {
  mode?: 'base' | 'simple';
  showIcon?: boolean;
  sx?: SxProps;
  size?: 'sm' | 'md';
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, value: string) => void;
  defaultValue?: '/sg' | '/us' | '/au' | '/ca' | '/';
  countries: { route: string; name: string; [key: string]: any; code: string }[];
  inFooter?: boolean;
};
export default function CountrySelector({
  mode = 'base',
  sx = [],
  showIcon = true,
  defaultValue,
  countries,
  onClick = () => {},
  ...props
}: CountrySelectorProps) {
  const { desktop } = useBreakpoints();
  const countriesOptions = React.useRef(
    countries.map((item) => {
      let iconCom;
      switch (item.route) {
        case '/sg':
          iconCom = <SGFlag />;
          break;
        case '/us':
          iconCom = <USFlag />;
          break;
        case '/au':
          iconCom = <AUFlag />;
          break;
        case '/ca':
          iconCom = <CAFlag />;
          break;
        case '/uk':
          iconCom = <UKFlag />;
          break;
        default:
      }

      return {
        ...item,
        iconCom,
      };
    })
  );
  const defaultLabel = countries.find(({ route }) => route === defaultValue)?.name;
  return (
    <Sheet
      sx={(theme) => ({
        bgcolor: 'transparent',
        div: {
          padding: '0 !important',
          color: (theme) => (desktop ? `${theme.palette.brand.wheat[800]} !important` : 'inherit'),
          borderBottom: 'none !important',
          '&:hover': {
            borderBottom: 'none !important',
          },
          '&:active': {
            borderBottom: 'none !important',
          },
        },
        svg: {
          fill: '#fff !important',
          '&:hover': {
            fill: '#fff !important',
          },
          '&:active': {
            fill: '#fff !important',
          },
        },
        [`& .${selectClasses.listbox}`]: {
          borderColor: theme.palette.brand.charcoal[300],
        },
        ...(props?.size === 'sm' && {
          // TODO why optionClasses not effect the Dropdown.Option
          [`& .${optionClasses.root}, .${selectClasses.root}`]: {
            ...theme.typography.caption2,
            color: null,
          },
        }),
      })}
    >
      <Dropdown
        defaultValue={defaultValue}
        aria-label="Country Selector"
        placeholder={defaultLabel}
        name="country selector"
        indicator={mode === 'simple' ? '' : <ExpandMore fontSize="md" />}
        renderValue={(options) => {
          if (mode === 'simple') {
            return countriesOptions.current.find((item) => item.route === options?.value)?.iconCom;
          }
          return options?.label || defaultLabel;
        }}
        size={props?.size}
        getSerializedValue={(ref) => {
          const value = ref?.value || defaultLabel;
          return value;
        }}
        sx={[
          {
            color: (theme) => theme.palette.brand.wheat[700],
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {countriesOptions.current.map(({ name, route, iconCom }, index) => (
          <Dropdown.Option
            key={index}
            value={route}
            label={name}
            sx={(theme) => ({
              ...(showIcon && {
                display: 'flex',
                justifyContent: 'flex-start',
              }),

              ...(mode === 'simple' && {
                color: theme.palette.common.black,
              }),
              ...(props?.size === 'sm' && {
                ...theme.typography.caption2,
                color: null,
              }),
            })}
          >
            {/* TODO style outline */}
            {showIcon ? <ListItemDecorator>{iconCom}</ListItemDecorator> : null}
            {/* TODO if component has RouterLink may be it's not a UI component  */}
            <Link
              href={route}
              onClick={(event) => onClick(event, route)}
              target="_blank"
              sx={{
                all: 'unset',
              }}
            >
              {name}
            </Link>
          </Dropdown.Option>
        ))}
      </Dropdown>
    </Sheet>
  );
}

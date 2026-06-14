import React from 'react';
import { ListItemDecorator, Sheet, SxProps, optionClasses, selectClasses } from '@castlery/fortress';
import { AUFlag, ExpandMore, SGFlag, USFlag, CAFlag, UKFlag } from '@castlery/fortress/Icons';
import { Dropdown } from 'fortress';
// import { Dropdown, ListItemDecorator, Sheet, SxProps, optionClasses, selectClasses } from 'fortress';
// import { AUFlag, ExpandMore, SGFlag, USFlag } from 'fortress/Icons';
import { RouterLink } from 'components/RouterLink';

export type CountrySelectorProps = {
  mode?: 'base' | 'simple';
  showIcon?: boolean;
  sx?: SxProps;
  size?: 'sm' | 'md';
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, value: string) => void;
  defaultValue?: '/sg' | '/us' | '/au' | '/ca' | '/uk' | '/';
  countries: { route: string; name: string; [key: string]: any; code: string }[];
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
        [`& .${selectClasses.listbox}`]: {
          borderColor: 'none',
        },
        ...(props?.size === 'sm' && {
          // TODO why optionClasses not effect the Dropdown.Option
          [`& .${optionClasses.root}, .${selectClasses.root}`]: {
            // ...theme.typography.caption2,
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
            color: '#3C101E',
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
            <RouterLink
              href={route}
              onClick={(event) => onClick(event, route)}
              target="_blank"
              // 取消原本的全部样式
              style={{ all: 'unset' }}
            >
              {name}
            </RouterLink>
          </Dropdown.Option>
        ))}
      </Dropdown>
    </Sheet>
  );
}

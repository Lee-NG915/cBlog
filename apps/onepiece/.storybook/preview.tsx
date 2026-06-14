// .storybook/preview.tsx
import React from 'react';
import { ThemeProvider } from '../src/fortress/Theme';
import { Preview } from '@storybook/react';
// import style from '../src/sass/_fonts';
import 'sass/base.scss';
// import ThirdScripts from '../src/components/Stack/ThirdScripts';
import createStore from '../src/redux/create';
import ApiClient from '../src/helpers/ApiClient';
import { ThemeCompositionProvider } from '../src/theme/themeProvider';
import lazySizes from 'lazysizes';
import 'lazysizes/plugins/attrchange/ls.attrchange';
import 'lazysizes/plugins/rias/ls.rias';



lazySizes.cfg.lazyClass = 'img-lazyload';
lazySizes.cfg.loadingClass = 'img-lazyloading';
lazySizes.cfg.loadedClass = 'img-lazyloaded';

import { Provider } from 'react-redux';
const preview: Preview = {
  parameters: {
    controls: {
      expanded: true,
      matchers: {
        date: /Date$/,
      },
    },
    actions: { argTypesRegex: '^on[A-Z].*' },
    // TODO 视图类型 确定要查看的 手机 平板 桌面端的大小
  },

  decorators: [
    (Story) => {
      // TODO 暂时不引入svg 反推业务删除老的svg
      return (
        <>
          <ThemeCompositionProvider appContext={{ device: 'desktop' }} >
            <Provider store={createStore(new ApiClient(), window.__data)}>
              < Story />
            </Provider>
          </ThemeCompositionProvider >
        </>
      )
    },
  ],
};

export default preview;

# OnePiece

## Prerequisite

Node >= 14.x.x

## Installation

> [!NOTE]
> Setting up a GitHub token: https://castlery.atlassian.net/wiki/spaces/EC/pages/2738487745/Fortress

```bash
yarn install
```

Before running script, make sure shell scripts in `scripts` folder are excutable. Run `chmod +x ./scripts/*` if not.

## Development

Firstly generate the `.env` file in your root folder. You can configure some basic settings of the project.

```bash
npm run setup
```

Then you can run the app. There are two modules, `desktop` and `mobile`. To develop one module, for example `mobile`, run

```bash
npm run dev mobile
```

## Build and Run Production Server

Take `mobile` module for example:

```bash
npm run build mobile
npm run start mobile
```

Default port: desktop => 9000 mobile => 8000 (configed in scripts/start.sh)

## Build with Docker

```bash
# With the OnePiece root folder
docker-compose build
docker-compose up
```

## The Architecture

This web app is a server side rendered single page react app. The building tool is Webpack. Data is mainly using Redux. Styles are written in SASS and CSS Module.

**Server Side Rendering**

This is achieved by using a webpack plugin `extract-text-webpack-plugin`. After the bundle is built using webpack, a relative asset json file `webpack-assets-xxx-xxx.json` will be generated. It contains all the relationship between the imported path and the real path of all non-js assets like images, css. When pages are rendered on server side, the server will use the json file to correctly import non-js assets.

Note: don't use browser specific global variables like `document` in `constructor` and `render` method as they will be run in server too.

**Async Load Data**

For server side rendering, some pages need to preload data to render a meaningful page for SEO. This is achieved with `src/components/AsycLoad`. Below is example of using it. `Redux` is used to preserve the preloaded data and pass it to client.

```javascript
import React from 'react';
import { asyncLoad } from 'components/AsyncLoad/utils';
import { loadIfNeeded as loadUser } from 'redux/modules/auth';
import { init as initLocation } from 'redux/modules/geolocation';

@asyncLoad([
  ({ store: { dispatch } }) => dispatch(loadUser()),
  ({ store: { dispatch } }) => dispatch(initLocation()),
])
export default class App extends React.PureComponent {
  ...
}
```

On client side, when rendering an async loaded page, the browser won't jump to the page until the data specified is loaded.

## SASS Structure

- A Default **base.scss** is imported at **client.js** which provides all the basic styles.

- For each component, create a `sass` file under the same folder with the `js` file.

  ```bash
  eg: a Header component, the file structure is like below

  Header
    -> index.js
    -> style.scss
  ```

- In the `style.scss` file, call `@import '../../sass/variables'` and `@import '../../sass/mixins'` if you need to use variables and mixins. You need to adjust the relative path based on your `style.scss` file's location

- CSS Module is used to prevent classname confliction. Use `:local` to define components' classes and BEM to define the child elements. Use direct child selector rather than descendant selector if possible.

  ```bash
  :local(.product) {
    &__header {
      height: 100px;

      & > .btn { // <===== direct child selector style is preferred
        height: 34px;
      }
    }

    &--good {
      background-color: #ffffff;
    }
  }
  ```

- Use `import style from './style.scss'` in the component js file to import the styles. The style can be used in two ways.

  ```javascript
  import style from './style.scss'

  // use without any helpers
  return (
    <div className={style.product}>
      <div className={`${style.product}__header`}>...</div>
      <div className={`${style.product}__content`}>...</div>
    </div>
  );

  // use with bem
  import Bem from 'utils/bem';

  ...

  const block = new Bem(style.product);
  return (
    <div className={block}>
      <div className={block.elm('header')}>...</div>
      <div className={block.elm('content')}>...</div>
    </div>
  );
  ```

  `Bem` is more powerful. It can be initialized with `className` passed throught `props` and all child elements will have the `className`, making it easy to override components' default styles.

  ```javascript
  const block = new Bem(style.product).mix(this.props.className);
  return (
    <div className={block}>
      <div className={block.elm('header')}>...</div>
    </div>
  );
  ```

  is equivalent to

  ```javascript
  const { className } = this.props;
  return (
    <div className={`${style.product} ${className}`}>
      <div className={`${style.product}__header ${className}__header`}>...</div>
    </div>
  );
  ```

  Note: When using `Bem`, if the className is passed to a non-native dom component, use `toString` to transform it to a string.

  ```javascript
  const block = new Bem(style.product);
  return <Product className={block.toString()} />;
  ```

## Modules management for OPTIMIZATION

1. For modules outside of `node_modules`, use es6 modules' `import` and `export` (webpack 2's tree shaking feature only supports es6 modules).

   In the following cases it's possible for webpack to detect usage of modules:

   - named import `import { A } from 'a';`
   - default import `import A from 'a';`
   - re-export `export { default as a } from './a'`

   In the following cases it's not possible to detect usage of modules:

   - `import * as ...`
   - CommonJS or AMD consuming ES6 module
   - System.import

2. To import modules in `node_modules`, import as few as possible. So when use import, import from the specific file. Use `require` for conditional import.

   ```javascript
   // recommended
   import isEqual from 'lodash/isEqual';
   // don't import like below
   import { isEqual } from 'lodash';

   // conditional import
   if (__MOBILE__) {
     const b = require('b');
   }
   ```

## Release script

We use the script `.scripts/release.sh` to release onepiece automatically. It will release the latest code in branch develop. (Note: If this branch master is not available locally, please fetch branch master remotely first.)
To run the script you could run

```bash
# the $version is your release version such as 2.1.1
npm run release $version
```

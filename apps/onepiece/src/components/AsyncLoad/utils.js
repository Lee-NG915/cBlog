import { endGlobalLoad } from 'redux/modules/asyncLoad';

function eachComponents(components, iterator) {
  for (let i = 0, l = components.length; i < l; i++) {
    // eslint-disable-line id-length
    if (typeof components[i] === 'object' && !components[i].asyncLoad) {
      for (const [key, value] of Object.entries(components[i])) {
        iterator(value, i, key);
      }
    } else {
      iterator(components[i], i);
    }
  }
}

function filterAndFlattenComponents(components) {
  const flattened = [];
  eachComponents(components, (Component) => {
    if (Component && Component.asyncLoad) {
      flattened.push(Component);
    }
  });
  return flattened;
}

export function loadAsyncConnect({ components, ...rest }) {
  // make sure returned promise is always resolved.
  return Promise.all(
    filterAndFlattenComponents(components).map((Component) =>
      Promise.all(
        Component.asyncLoad.map((p) =>
          p(rest).catch((error) => {
            if (error && !(error.status === 401 || error.status === 403)) {
              console.error(JSON.stringify({ message: 'AsyncLoad error', error: error.track || error }, null, 2));
            }
          })
        )
      )
    )
  );
}

export function loadOnServer(args) {
  return loadAsyncConnect(args).then(() => {
    args.store.dispatch(endGlobalLoad());
  });
}

export function asyncLoad(items) {
  return (Component) => {
    Component.asyncLoad = items;
    return Component;
  };
}

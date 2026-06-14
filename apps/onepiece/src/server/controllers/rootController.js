import React from 'react';
import RootEntry from 'client/RootEntry';
import HtmlEngine from 'server/utils/HtmlEngine';

export const renderRoot =
  ({ namespace }) =>
  (req, res, next) => {
    if (req.cookies.castlery_shop) {
      next();
    } else {
      const engine = new HtmlEngine({ entry: 'root', namespace });
      const countryCode = namespace.get('req')?.headers?.['x-viewer-country'];
      res.send(
        engine.render(
          <RootEntry
            country={countryCode}
            appContext={{
              device: req.device,
            }}
          />
        )
      );
    }
  };

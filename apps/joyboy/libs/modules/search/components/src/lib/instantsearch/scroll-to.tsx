import { EcEnv } from '@castlery/config';
import { Box } from '@castlery/fortress';
import { Middleware } from 'instantsearch.js';
import React, { useEffect, useRef } from 'react';
import { useInstantSearch } from 'react-instantsearch';

export function ScrollTo({ children, disable }: { children: React.ReactNode; disable?: boolean }) {
  const { addMiddlewares } = useInstantSearch();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const middleware: Middleware = () => {
      return {
        onStateChange() {
          const isFiltering = document.body.classList.contains('filtering');
          const isTyping =
            document.activeElement?.tagName === 'INPUT' && document.activeElement?.getAttribute('type') === 'search';

          if (isFiltering || isTyping || disable) {
            return;
          }
          if (EcEnv.NEXT_PUBLIC_CHANNEL === 'POS') {
            containerRef.current!.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        },
      };
    };

    return addMiddlewares(middleware);
  }, [addMiddlewares]);

  return <Box ref={containerRef}>{children}</Box>;
}

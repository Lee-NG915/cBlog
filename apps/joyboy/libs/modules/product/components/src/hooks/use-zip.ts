'use client';
import { EcEnv } from '@castlery/config';
import { useRef, useCallback, useEffect, RefObject } from 'react';
import { logger } from '@castlery/observability/client';

// 返回值类型定义
type UseZipReturn = [RefObject<HTMLDivElement>, () => void];

// Shared promise for singleton script loading
let loadScriptPromise: Promise<void> | null = null;

const useZip = (): UseZipReturn => {
  const zipRef = useRef<HTMLDivElement>(null);

  const loadScript = useCallback((src: string): Promise<void> => {
    // If already loaded, resolve immediately
    if (loadScriptPromise) {
      return loadScriptPromise;
    }

    // Create promise for script loading
    loadScriptPromise = new Promise<void>((resolve, reject) => {
      // Check if script already exists in DOM
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        // If already loaded, resolve immediately
        if (window.Zip?.Widget) {
          try {
            window.Zip.Widget.setup();
          } catch (error) {
            logger.error('Error initializing Zip Widget', { error });
          }
          resolve();
        } else {
          // Wait for existing script to load
          existingScript.addEventListener('load', () => {
            if (window.Zip?.Widget) {
              try {
                window.Zip.Widget.setup();
              } catch (error) {
                logger.error('Error initializing Zip Widget', { error });
              }
              resolve();
            }
          });
          // Timeout after 10 seconds
          setTimeout(() => {
            if (!window.Zip?.Widget) {
              reject(new Error('Script loading timeout'));
            }
          }, 10000);
        }
        return;
      }

      // Load new script
      const script = document.createElement('script');
      script.src = src;
      script.async = true;

      script.onload = () => {
        // Initialize widget after script loads, but don't block rendering
        if (window.Zip?.Widget) {
          setTimeout(() => {
            try {
              if (window.Zip?.Widget) {
                window.Zip.Widget.setup();
              }
            } catch (error) {
              logger.error('Error initializing Zip Widget', { error });
            }
          }, 0);
        }
        resolve();
      };

      script.onerror = () => {
        loadScriptPromise = null; // Reset on error to allow retry
        reject(new Error('Error loading Zip Widget script'));
      };

      document.head.appendChild(script);
    });

    return loadScriptPromise;
  }, []);

  const handleZipLabelClick = useCallback((): void => {
    if (zipRef.current) {
      // FIXME hotfix
      const zipLearnMore = zipRef.current.querySelector('.zip-learn-more') as HTMLElement;
      if (zipLearnMore) {
        zipLearnMore.click();
      }
    }
  }, []);

  useEffect(() => {
    if (zipRef.current && EcEnv.NEXT_PUBLIC_ZIP_URL) {
      loadScript(EcEnv.NEXT_PUBLIC_ZIP_URL).catch((error) => {
        logger.error('Failed to load Zip Widget', { error });
      });
    }
  }, []); // Empty dependency array - only run once

  return [zipRef, handleZipLabelClick];
};

export default useZip;

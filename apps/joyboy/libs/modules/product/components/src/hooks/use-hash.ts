import { useEffect, useState } from 'react';

export const useHash = () => {
  const [hash, setHash] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
  });

  useEffect(() => {
    // 确保客户端渲染时再次同步 hash
    const currentHash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
    setHash(currentHash);

    // 监听 hash 变化
    const handleHashChange = () => {
      const newHash = window.location.hash.replace('#', '');
      setHash(newHash);
    };

    // 监听 popstate 事件（浏览器前进后退）
    const handlePopState = () => {
      const newHash = window.location.hash.replace('#', '');
      setHash(newHash);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', handleHashChange);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('hashchange', handleHashChange);
        window.removeEventListener('popstate', handlePopState);
      }
    };
  }, []);

  return hash;
};

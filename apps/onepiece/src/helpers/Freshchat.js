import { setFreshchatUser } from 'utils/tracking';

// export const loadFreshchat = (user) =>
//   new Promise((resolve) => {
//     if (window.fcWidget) {
//       initFreshchat(user);
//       resolve();
//       return;
//     }
//     const fcJS = document.createElement('script');
//     fcJS.id = 'freshchat-js-sdk';
//     fcJS.async = true;
//     fcJS.src = 'https://wchat.freshchat.com/js/widget.js';
//     fcJS.onload = () => {
//       initFreshchat(user);
//       resolve();
//     };
//     document.body.appendChild(fcJS);
//   });

export const initFreshchat = (user) => {
  window.fcWidget.init({
    token: __FRESHCHAT_ID__,
    host: 'https://wchat.freshchat.com',
    siteId: `CASTLERY-${__APPLICATION_ENV__.includes('prod') ? __COUNTRY__ : __APPLICATION_ENV__.toUpperCase()}`,
    config: {
      headerProperty: {
        hideChatButton: true,
      },
      content: {
        headers: {
          chat: 'Talk to Us',
          chat_help: 'Hi there! We’re here to help you out.',
        },
      },
    },
    externalId: user?.id || '',
    tags: [__COUNTRY__.toLowerCase()],
  });
  setFreshchatUser(user);
};

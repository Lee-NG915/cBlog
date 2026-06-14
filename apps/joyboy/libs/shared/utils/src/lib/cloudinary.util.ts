/**
 * 移除 cloudinary 图片背景色
 * @param url 'cloudinary url'
 * @returns
 */
export const removeClPicBgColor = (url: string) => {
  // 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1645672842/crusader/variants/50440748-AM4001/Madison-Left-Chaise-Sectional-Sofa-Bisque-Front.jpg';
  let newUrl = url;

  if (url?.startsWith('https://res.cloudinary.com/')) {
    const reg = /(.*)\/(private|upload)\/(.*?)\/(.*)/;

    newUrl = url.replace(reg, (match, ...args) => {
      args[2] = args[2].replace(/b_rgb:*((?!,).)*/, '');
      return args.splice(0, 4).filter(Boolean).join('/');
    });
  }
  return newUrl;
};

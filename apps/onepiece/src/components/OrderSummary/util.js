import * as Cookies from 'helpers/Cookie';

export const couponAutoApplyFlag = {
  set: (emailHashed, code) => {
    Cookies.set('removeCouponFlag', JSON.stringify({ email: emailHashed, code }), 1 / 12);
  },
  get: () => {
    const data = Cookies.get('removeCouponFlag');
    return data ? JSON.parse(data) : null;
  },
  clear: () => {
    try {
      Cookies.remove('removeCouponFlag'); // 清除cookie
    } catch (err) {
      console.log('清除cookie失败>>>>removeCouponFlag');
    }
  },
  isHitMark: (emailHashed, code) => {
    const data = Cookies.get('removeCouponFlag');
    if (data) {
      const { email, code: couponCode } = JSON.parse(data);
      return email === emailHashed && couponCode === code;
    }
    return false;
  },
};

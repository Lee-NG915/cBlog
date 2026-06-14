const tips = {
  lessThan8: 'Password must be at least 8 characters in length',
  rule: 'Password must contain lowercase and uppercase characters, and digits',
  expired: 'Password reset link expired',
};

// const reg = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
const reg = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).{8,}$/;

export const passwordChecker = (value: string) => {
  if (value.length < 8) {
    return tips.lessThan8;
  }

  if (!reg.test(value)) {
    return tips.rule;
  }
  return true;
};

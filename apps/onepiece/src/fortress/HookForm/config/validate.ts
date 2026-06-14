import validateRulesMap from './validateRules';

/**
 * validateRulesMap => 内置校验器，
 * 扩展：引入校验库，直接替换
 */
export const VALIDATE_MAP = new Map([
  ['EMAIL', validateRulesMap.get('email')],
  ['PASSWORD', validateRulesMap.get('password')],
  ['USERNAME', validateRulesMap.get('username')],
  ['PHONESG', validateRulesMap.get('phoneSG')],
  ['PHONEUS', validateRulesMap.get('phoneUS')],
  ['PHONEAU', validateRulesMap.get('phoneAU')],
  ['FLAME', validateRulesMap.get('fLame')],
]);

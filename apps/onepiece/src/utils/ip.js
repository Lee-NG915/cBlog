export function isPrivateIp(ip) {
  return (
    /^(::f{4}:)?10\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(ip) ||
    /^(::f{4}:)?192\.168\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(ip) ||
    /^(::f{4}:)?172\.(1[6-9]|2\d|30|31)\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(ip) ||
    /^(::f{4}:)?127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(ip) ||
    /^(::f{4}:)?169\.254\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(ip) ||
    /^f[cd][0-9a-f]{2}:/i.test(ip) ||
    /^fe80:/i.test(ip) ||
    /^::1$/.test(ip) ||
    /^::$/.test(ip)
  );
}

/**
 * Convert ipv4 address to ipv6 full format (::ffff:ipv4)
 * @param ipv4 ipv4 address
 * @returns ipv6 address in full format
 */
export function ipv4ToIpv6Full(ipv4) {
  const parts = ipv4.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => p < 0 || p > 255)) {
    return ipv4;
  }

  const hex1 = parts[0].toString(16).padStart(2, '0');
  const hex2 = parts[1].toString(16).padStart(2, '0');
  const hex3 = parts[2].toString(16).padStart(2, '0');
  const hex4 = parts[3].toString(16).padStart(2, '0');

  return `0000:0000:0000:0000:0000:ffff:${hex1}${hex2}:${hex3}${hex4}`;
}

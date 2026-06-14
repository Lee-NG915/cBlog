/**
 * Convert ipv4 address to ipv6 6to4 full address
 * @param ipv4 ipv4 address
 * @returns ipv6 address
 */
export function ipv4To6to4Full(ipv4: string) {
  const parts = ipv4.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => p < 0 || p > 255)) {
    return ipv4;
  }

  const hex1 = ((parts[0] << 8) + parts[1]).toString(16).padStart(4, '0');
  const hex2 = ((parts[2] << 8) + parts[3]).toString(16).padStart(4, '0');

  return `2002:${hex1}:${hex2}:0000:0000:0000:0000:0000`;
}

/**
 * Convert ipv4 address to ipv6 full format (::ffff:ipv4)
 * @param ipv4 ipv4 address
 * @returns ipv6 address in full format
 */
export function ipv4ToIpv6Full(ipv4: string) {
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

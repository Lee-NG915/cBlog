import { EcEnv } from '@castlery/config';

/**
 * 格式化 label 文本
 * - 如果第一个字符是数字，整个字符串转小写
 * - 如果第一个单词不是数字，第一个单词首字母大写，后面单词首字母小写
 *
 * @param label - 要格式化的文本
 * @returns 格式化后的文本
 *
 * @example
 * formatLabel('HELLO WORLD') // 'Hello world'
 * formatLabel('hello WORLD') // 'Hello world'
 * formatLabel('123 ABC') // '123 abc'
 */

export function formatLabel(label: string): string {
  if (!label) return label;

  const trimmedLabel = label.trim();
  const firstChar = trimmedLabel[0];

  // 如果第一个字符是数字，返回原样（转小写）
  if (/\d/.test(firstChar)) {
    return label.toLowerCase();
  }

  // 找到第一个单词的结束位置（空格或字符串结束）
  const firstSpaceIndex = trimmedLabel.indexOf(' ');
  if (firstSpaceIndex === -1) {
    // 只有一个单词
    return trimmedLabel.charAt(0).toUpperCase() + trimmedLabel.slice(1).toLowerCase();
  }

  // 多个单词：第一个单词首字母大写，后面单词首字母小写
  const firstWord = trimmedLabel.substring(0, firstSpaceIndex);
  const rest = trimmedLabel.substring(firstSpaceIndex).toLowerCase();
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase() + rest;
}

export function splitLabel(label: string): string {
  if (!label) {
    return label;
  }
  if (label.includes('-')) {
    const parts = label.split('-');
    const formattedParts = parts.map((part) => formatLabel(part));
    return formattedParts.join('-');
  }
  return formatLabel(label);
}

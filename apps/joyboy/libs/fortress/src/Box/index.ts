export { default } from './Box';
// 显式导出自定义的 BoxProps，覆盖从 '@mui/joy/Box' 导出的 BoxProps
export type { BoxProps } from './Box';
// 重新导出所有其他从 JoyUI Box 导出的内容
export * from './Box';

import { enterApp } from "../slice/admin.pos.slice";
// TODO 现在是错误的 到时要思考出怎么处理这个事件就触发一次
export const EnterAppEvent = enterApp.fulfilled

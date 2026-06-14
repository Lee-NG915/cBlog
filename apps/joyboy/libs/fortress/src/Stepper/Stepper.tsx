import { Stepper as JoyStepper } from '@mui/joy';
import type { StepperProps as JoyStepperProps } from '@mui/joy';

// 扩展原有的Props类型
// export interface FortressStepperProps extends JoyStepperProps {
//   // 这里可以添加Fortress特有的属性
// }

export const Stepper = (props: JoyStepperProps) => {
  return <JoyStepper {...props} />;
};

// 添加默认导出
export default Stepper;

import { InputFilter } from 'searchkit';

class CustomInputFilter extends InputFilter {
  componentWillMount() {
    try {
      // 在breakpoints: desktop 更改时出现的错误
      // issue: https://github.com/searchkit/searchkit/blob/v2.3.0/packages/searchkit/src/core/AccessorManager.ts
      // throw new Error("Only a single instance of BaseQueryAccessor is allowed")
      super.componentWillMount();
    } catch (e) {
      console.log('InputFilterError', e);
    }
  }
}

export default CustomInputFilter;

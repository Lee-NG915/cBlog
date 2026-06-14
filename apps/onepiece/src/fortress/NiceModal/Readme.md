# NiceModal Review

## 1. quick know

### 1.1 NiceModal 是什么，遵循哪些规范

- NiceModal 是二次封装的组件，包含基于 mui/joy 开发的基础 UI 组件 & 基于 react - hook 开发的交互层
- NiceModal 的 BaseModal 组件,是完全遵循 @mui/joy 的开发规范 => 认为是一个定制的 fortress-UI 通用 Modal
- NiceModal 暴露 useModal & useSimpleModal & useNiceFormModal ,方便声明式调用

### 1.2 NiceModal 的类型

- BaseModal (confirmation modal)
- FormFillModal
- LocationModal
- NestedModal
- imageViewer

## 2.期待的调用方式

- 期望提供声明式调用 & 命令式调用两种方式

### 2.1 声明式调用

### 2.2 命令式调用

- 详见 NiceModal.stories.tsx

## Tracking Event

### 和 Zi han 沟通

- 当 modal 被打开时，会针对一些场景，发送 tracking event
- 当表单提交时，发送 tracking event

### 实现

```tsx
interface TrackingParameters {
  category: string;
  action: string;
}
// 普通modal，针对 open / close / confirm 场景，发送 tracking event
interface TrackingEvents {
  trackingOpen?(param: TrackingParameters): void;
  trackingClose?(param: TrackingParameters): void;
  trackingConfirm?(param: TrackingParameters): void;
}
// form-fill类型的modal，增加submit event
interface FormTrackingEvents extends Omit<TrackingEvents, 'trackingConfirm'> {
  trackingBeforeSubmit?(param: TrackingParameters): void;
  trackingAfterSubmit?(param: TrackingParameters): void;
}
```

### 现有的使用 modal 的场景

- 1. location modal:
     add shipping address => select address
- 2. confirmation modal:
     such as voucher redemption
- 3. image modal:
     view larger image
- 4. form-fill modal:
     such as login-modal
- 5. subscription modal:
- 6. countrySelect modal: IP 检测不在当前国家，需要手动选择国家
- 7. container iframe: Sign Up for Workshop
- 8. appointment modal
- 9. text modal
- 10. calendar modal
- 13. swatch modal
- 14. cart modal
- 15. afterPay modal
- 16. mobile modal

## Accessibility

### Keyboard Interaction

- In the following description, the term tabbable element refers to any element with a tabindex value of zero or greater. Note that values greater than 0 are strongly discouraged.

#### When a dialog opens, focus moves to an element inside the dialog. See notes below regarding initial focus placement.

- Tab:  
  Moves focus to the next tabbable element inside the dialog.
  If focus is on the last tabbable element inside the dialog, moves focus to the first tabbable element inside the dialog.
- Shift + Tab:
  Moves focus to the previous tabbable element inside the dialog.
  If focus is on the first tabbable element inside the dialog, moves focus to the last tabbable element inside the dialog.
- Escape: Closes the dialog.

### role & description

- role="dialog" //'alertdialog'。
- aria-labelledby="modal-title"：这指定了 modal 的标题元素，这将帮助屏幕阅读器用户理解 modal 的标题。
- aria-describedby="modal-content"：这指定了 modal 的内容元素，这将帮助屏幕阅读器用户理解 modal 的内容。

### focus

- 1. Use CSS to clearly indicate focus status to help users identify the element that currently has focus.
- 2. Make sure focus doesn't cycle between invisible elements.
- 3. Try not to manually set the value of the tabindex attribute to ensure that the focus can be switched in the order of element focus.（the tabindex attribute can set the tab order of an element.）

## QA

- 直接在 fortress 暴露 hook&component，统一引入的方式
- https://mui.com/material-ui/react-modal/#server-side-modal 考虑服务端渲染 modal
- button - accessibility 属性
- 了解 framer 的作用，看看有没有可以参考改进的地方
-

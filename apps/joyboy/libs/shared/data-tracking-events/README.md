# data-tracking-events

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build data-tracking-events` to build the library.

## Running unit tests

Run `nx test data-tracking-events` to execute the unit tests via [Jest](https://jestjs.io).

## GA DOC

- [可参考的标准事件](https://developers.google.com/tag-platform/gtagjs/reference/events?hl=zh-cn)
- [GA 的事件参数](https://developers.google.com/tag-platform/devguides/events?hl=zh-cn#universal_analytics_events)

| 参数     | 类型   | 说明           |
| -------- | ------ | -------------- |
| category | string | 事件类型，必填 |
| action   | string | 事件行为，必填 |
| label    | string | 事件标签，选填 |
| value    | number | 事件数值，选填 |

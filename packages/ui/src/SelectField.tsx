"use client";
import {
  Children,
  Fragment,
  isValidElement,
  type ReactNode,
  type CSSProperties,
} from "react";
import { Select } from "@base-ui/react/select";

type Option = { value: string; label: ReactNode; disabled: boolean };
function text(node: ReactNode): string {
  return Children.toArray(node)
    .map((n) =>
      isValidElement<{ children?: ReactNode }>(n)
        ? text(n.props.children)
        : String(n),
    )
    .join("");
}
function options(children: ReactNode): Option[] {
  return Children.toArray(children).flatMap((node) => {
    if (
      !isValidElement<{
        value?: string | number;
        children?: ReactNode;
        disabled?: boolean;
      }>(node)
    )
      return [];
    if (node.type === Fragment) return options(node.props.children);
    if (node.type !== "option") return [];
    return [
      {
        value: String(node.props.value ?? text(node.props.children)),
        label: node.props.children,
        disabled: !!node.props.disabled,
      },
    ];
  });
}
export function SelectField({
  children,
  value,
  defaultValue,
  onValueChange,
  id,
  name,
  disabled,
  required,
  className = "",
  style,
  ...aria
}: {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}) {
  const items = options(children);
  return (
    <Select.Root<string>
      value={value}
      defaultValue={defaultValue}
      onValueChange={(v) => {
        if (v !== null) onValueChange?.(v);
      }}
      name={name}
      disabled={disabled}
      required={required}
      items={items}
    >
      <Select.Trigger
        id={id}
        className={`c-select ${className}`}
        style={style}
        {...aria}
      >
        <Select.Value className="c-select-value" />
        <Select.Icon className="c-select-icon">
          <svg
            viewBox="0 0 20 20"
            width="20"
            height="20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="m5 7.5 5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner
          className="c-select-positioner"
          sideOffset={8}
          alignItemWithTrigger={false}
          collisionPadding={12}
        >
          <Select.Popup className="c-select-popup">
            <Select.List className="c-select-list">
              {items.map((item) => (
                <Select.Item
                  key={item.value}
                  value={item.value}
                  disabled={item.disabled}
                  className="c-select-option"
                >
                  <Select.ItemText>{item.label}</Select.ItemText>
                  <Select.ItemIndicator className="c-select-check">
                    <svg
                      viewBox="0 0 20 20"
                      width="18"
                      height="18"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="m4 10 4 4 8-8"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

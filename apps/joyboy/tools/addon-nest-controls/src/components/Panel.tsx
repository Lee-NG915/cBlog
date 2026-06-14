import React, { FC, useState } from 'react';
import { AddonPanel } from 'storybook/internal/components';
import { useArgs, useArgTypes } from 'storybook/internal/manager-api';
import {
  BooleanControl,
  NumberControl,
  TextControl,
  ColorControl,
  ObjectControl,
  FilesControl,
  DateControl,
  // OptionsControl,
} from '@storybook/blocks';

type ExpandedSet = Set<string>;

interface MyPanelProps {
  active: boolean;
}

function updateNestedValue(obj: any, path: (string | number)[], newVal: any): any {
  if (path.length === 0) return newVal;
  const [head, ...rest] = path;
  if (Array.isArray(obj)) {
    const index = Number(head);
    const newArr = [...obj];
    newArr[index] = updateNestedValue(obj[index], rest, newVal);
    return newArr;
  }
  return {
    ...obj,
    [head]: updateNestedValue(obj?.[head], rest, newVal),
  };
}

function pathToString(path: (string | number)[]): string {
  return path.map(String).join('.');
}

export const Panel: FC<MyPanelProps> = ({ active }) => {
  const [args, updateArgs] = useArgs();
  const argTypes = useArgTypes();
  const [expandedSet, setExpandedSet] = useState<ExpandedSet>(new Set());

  function isExpanded(pathString: string) {
    return expandedSet.has(pathString);
  }

  function toggleExpand(pathString: string) {
    setExpandedSet((prev) => {
      const copy = new Set(prev);
      if (copy.has(pathString)) {
        copy.delete(pathString);
      } else {
        copy.add(pathString);
      }
      return copy;
    });
  }

  function renderValue(value: any, path: (string | number)[]): React.ReactNode {
    if (value === null || value === undefined) {
      return renderLeafControl(path, value);
    }

    if (typeof value === 'object') {
      const pathString = pathToString(path);
      const expanded = isExpanded(pathString);
      const labelText = Array.isArray(value) ? `[...] length=${value?.length}` : '{...}';

      return (
        <div style={{ marginLeft: 10 }}>
          <div style={{ cursor: 'pointer' }} onClick={() => toggleExpand(pathString)}>
            {expanded ? '▾' : '▸'} <strong>{labelText}</strong>{' '}
            <em style={{ opacity: 0.7 }}>(click to {expanded ? 'collapse' : 'expand'})</em>
          </div>
          {expanded && (
            <div style={{ borderLeft: '1px solid #ddd', marginLeft: 12, paddingLeft: 8 }}>
              {Array.isArray(value) ? renderArray(value, path) : renderObject(value, path)}
            </div>
          )}
        </div>
      );
    }

    return renderLeafControl(path, value);
  }

  function renderArray(arr: any[], parentPath: (string | number)[]): React.ReactNode {
    return arr.map((item, index) => {
      const currentPath = [...parentPath, index];
      return (
        <div key={index} style={{ marginTop: 4 }}>
          {renderValue(item, currentPath)}
        </div>
      );
    });
  }

  function renderObject(obj: Record<string, any>, parentPath: (string | number)[]): React.ReactNode {
    return Object.entries(obj).map(([key, val]) => {
      const currentPath = [...parentPath, key];

      return (
        <div key={key} style={{ marginTop: 4 }}>
          <div>
            <strong>{key}</strong>:
          </div>
          {renderValue(val, currentPath)}
        </div>
      );
    });
  }

  function renderLeafControl(path: (string | number)[], value: any) {
    const fieldLabel = path[path.length - 1]?.toString() ?? 'value';

    let typeInfo = resolveArgType(path);

    // color palette
    const parentInfo = resolveArgType(path.slice(0, -1));

    if (!(typeInfo?.control && typeInfo?.controls?.type) && parentInfo?.control?.type === 'color') {
      typeInfo = {
        control: {
          type: parentInfo?.control?.type,
          presetColors: parentInfo?.control?.presetColors,
          defaultValue: parentInfo?.control?.defaultValue,
        },
      };
    }
    const handleChange = (newVal: any) => {
      const newArgs = updateNestedValue(args, path, newVal);
      updateArgs(newArgs);
    };
    const rawOptions = typeInfo?.control?.options;
    const labels: Record<string, string> = Array.isArray(rawOptions)
      ? rawOptions.reduce((acc: Record<string, string>, item) => {
          acc[item] = String(item);
          return acc;
        }, {})
      : (rawOptions as Record<string, string>);
    switch (typeInfo?.control?.type || typeInfo?.control) {
      case 'boolean':
        return <BooleanControl name={fieldLabel} value={value} onChange={handleChange} />;
      case 'number':
        return <NumberControl name={fieldLabel} value={Number(value)} onChange={handleChange} />;
      case 'text':
        return <TextControl name={fieldLabel} value={value} onChange={handleChange} />;
      case 'color': {
        const colorValue = value && typeof value === 'object' ? value.value : value;
        return <ColorControl name={fieldLabel} value={colorValue} onChange={handleChange} />;
      }

      // case 'select':
      //   return <OptionsControl type="select" name={fieldLabel} labels={labels} value={value} onChange={handleChange} />;
      // case 'radio':
      //   return <OptionsControl type="radio" name={fieldLabel} labels={labels} value={value} onChange={handleChange} />;

      // case 'check':
      //   return <OptionsControl type="check" name={fieldLabel} labels={labels} value={value} onChange={handleChange} />;
      // case 'multi-select':
      //   return (
      //     <OptionsControl type="multi-select" name={fieldLabel} labels={labels} value={value} onChange={handleChange} />
      //   );
      case 'select':
        return (
          <select value={value} onChange={(e) => handleChange(e.target.value)}>
            {Object.entries(labels).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div>
            {Object.entries(labels).map(([val, label]) => (
              <label key={val} style={{ display: 'block', marginBottom: 4 }}>
                <input
                  type="radio"
                  name={fieldLabel}
                  value={val}
                  checked={value === val}
                  onChange={() => handleChange(val)}
                />
                {label}
              </label>
            ))}
          </div>
        );

      case 'check':
        return (
          <div>
            {Object.entries(labels).map(([val, label]) => (
              <label key={val} style={{ display: 'block', marginBottom: 4 }}>
                <input
                  type="checkbox"
                  value={val}
                  checked={Array.isArray(value) && value.includes(val)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const newValue = Array.isArray(value) ? [...value] : [];
                    if (checked && !newValue.includes(val)) {
                      newValue.push(val);
                    } else if (!checked) {
                      const index = newValue.indexOf(val);
                      if (index !== -1) newValue.splice(index, 1);
                    }
                    handleChange(newValue);
                  }}
                />
                {label}
              </label>
            ))}
          </div>
        );

      case 'multi-select':
        return (
          <select
            multiple
            value={value}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
              handleChange(selected);
            }}
          >
            {Object.entries(labels).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        );

      case 'file':
        return <FilesControl name={fieldLabel} value={value} onChange={handleChange} />;
      case 'date':
        return <DateControl name={fieldLabel} value={value} onChange={handleChange} />;
      default:
        return <ObjectControl name={fieldLabel} value={value} onChange={handleChange} />;
    }
  }

  function resolveArgType(path: (string | number)[]): any {
    let current: any = argTypes;

    for (const key of path) {
      if (current == null) return undefined;

      if (Array.isArray(current)) {
        const index = typeof key === 'number' ? key : parseInt(key as string, 10);
        current = current[index];
      } else {
        current = current[key];
      }
    }

    return current;
  }

  return (
    <AddonPanel active={active}>
      <div style={{ padding: 10 }}>
        <div style={{ marginTop: 10 }}>{renderValue(args, [])}</div>
      </div>
    </AddonPanel>
  );
};

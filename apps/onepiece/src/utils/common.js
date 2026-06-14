import camelCase from 'lodash/camelCase';

export const detectObject = (obj) => {
  if (Object.prototype.toString.call(obj) === '[object Object]') {
    return true;
  }
  return false;
};

const propertyNameConverter = (converterFn) => (data) => {
  const recursive = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map((x) => recursive(x));
    }
    if (!detectObject(obj)) {
      return obj;
    }
    const keys = Object.keys(obj);
    return keys.reduce((accum, propName) => {
      const propValue = obj[propName];
      return {
        ...accum,
        [converterFn(propName)]: recursive(propValue),
      };
    }, {});
  };
  return recursive(data);
};

export const toCamel = propertyNameConverter(camelCase);

export const camelToSnake = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((item) => camelToSnake(item));
  }
  if (typeof obj === 'object' && obj !== null) {
    const snakeObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        snakeObj[snakeKey] = camelToSnake(obj[key]);
      }
    }
    return snakeObj;
  }
  return obj;
};

/*
  1. when operation return true, will stop recursion
  2. when operation return object, this object will be as the one item of children.
*/
export const traverseNestedArrayByChildren = (arr, operation, level = 0) => {
  let stopRecurse = false;
  const handled = [];
  if (!Array.isArray(arr)) {
    throw new Error('The first parameter arr or children must be an array!');
  }
  arr.some((item) => {
    const children = traverseNestedArrayByChildren(item.children, operation, level + 1);
    if (children === true) {
      return true;
    }

    const handledItem = operation(item, children, level + 1) || item;
    if (!detectObject(handledItem) && handledItem !== true) {
      throw new Error('The callback operation must return an object or true!');
    }
    handled.push(handledItem);
    stopRecurse = handledItem === true;
    return stopRecurse; // stop recusion
  });

  return stopRecurse || handled;
};

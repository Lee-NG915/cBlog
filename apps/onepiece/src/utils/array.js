// all functions don't mutate original array

export function move(arr, fromIndex, toIndex) {
  if (!Array.isArray(arr)) {
    console.error('the first parameter of move must be an array.');
  }
  if (fromIndex < 0 || fromIndex >= arr.length || toIndex < 0) {
    return arr;
  }

  const _arr = arr.slice();
  const val = _arr[fromIndex];
  _arr.splice(fromIndex, 1);
  _arr.splice(toIndex, 0, val);
  return _arr;
}

export function add(arr, index, val) {
  if (index < 0) {
    console.error('invalid index');
    return arr;
  }
  if (val === undefined) {
    val = index;
    index = arr.length;
  }
  return [...arr.slice(0, index), val, ...arr.slice(index)];
}

export function remove(arr, index) {
  if (index < 0) {
    console.error('invalid index');
    return arr;
  }
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}

export function replace(arr, index, val) {
  if (index < 0 || index >= arr.length) {
    console.error('invalid index');
    return arr;
  }
  return [...arr.slice(0, index), val, ...arr.slice(index + 1)];
}

export const ObjHelper = {
  isRealObject: (obj: any): boolean => {
    return obj && typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Object]';
  },
  get: (obj: any, fields: string[]): any => {
    if (!ObjHelper.isRealObject(obj)) return null;
    if (!Array.isArray(fields) || fields.length === 0) return obj;
    return fields.reduce((acc: Record<string, any> | null, field: string) => {
      const cur = field in obj ? obj[field] : null;
      const realCur = cur ?? null;
      const realAcc = acc ?? null;
      if (!realAcc && !realCur) return null;
      return { ...(realAcc ? { ...realAcc } : {}), ...(realCur ? { [field]: realCur } : {}) };
    }, null);
  },
};

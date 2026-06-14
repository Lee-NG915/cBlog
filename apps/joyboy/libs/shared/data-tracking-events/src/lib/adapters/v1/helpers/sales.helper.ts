import type { Sales } from '../entities/sales.entity';

export const SalesHelper = {
  getFullName: (sales: Pick<Sales, 'firstname' | 'lastname'>) => {
    const fullName = `${sales.firstname || ''} ${sales.lastname || ''}`;
    return fullName ? fullName.trim() : '';
  },
};

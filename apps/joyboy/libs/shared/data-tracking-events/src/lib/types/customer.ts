export interface Customer {
  email: string;
  id: number;
  phone?: string;
  firstname?: string;
  lastname?: string;
  emailHashed?: string;
  phoneHashed?: string;
}

export type Channel = 'web' | 'pos';
export interface Customer {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  user_hash?: string;
  channel: Channel;
  firstnameHashed?: string;
  lastnameHashed?: string;
  emailHashed?: string;
  phoneHashed?: string;
  profile?: {
    birthday?: string;
    occupation?: string;
    housing_type?: string;
    home_size?: string;
    most_time_spent_location?: string;
    annual_household_income?: string;
    display_profile_reward_banner?: boolean;
  };
}

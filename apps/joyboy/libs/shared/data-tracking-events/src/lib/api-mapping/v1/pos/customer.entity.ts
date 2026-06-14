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

// export const customer = {
//   id: 'id',
//   firstname: 'firstname',
//   lastname: 'lastname',
//   email: 'email',
//   phone: 'phone',
//   user_hash: 'user_hash',
//   channel: 'channel',
//   firstnameHashed: 'firstnameHashed',
//   lastnameHashed: 'lastnameHashed',
//   emailHashed: 'emailHashed',
//   phoneHashed: 'phoneHashed',
//   profile: 'profile',
//   'profile.birthday': 'profile.birthday',
//   'profile.occupation': 'profile.occupation',
//   'profile.housing_type': 'profile.housing_type',
//   'profile.home_size': 'profile.home_size',
//   'profile.most_time_spent_location': 'profile.most_time_spent_location',
//   'profile.annual_household_income': 'profile.annual_household_income',
//   'profile.display_profile_reward_banner': 'profile.display_profile_reward_banner',
// };

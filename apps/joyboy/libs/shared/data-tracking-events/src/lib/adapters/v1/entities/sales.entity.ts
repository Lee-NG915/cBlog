export interface Sales {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  channel: string;
  profile: Profile;
  name?: string;
}

export interface Profile {
  birthday: string;
  occupation: string;
  housing_type: string;
  home_size: string;
  most_time_spent_location: string;
  annual_household_income: string;
  display_profile_reward_banner: boolean;
}

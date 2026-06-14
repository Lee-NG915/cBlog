export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  user_hash?: string;
  channel: Channel;
  profile?: {
    birthday?: string;
    // occupation?: string;
    housing_type?: string;
    home_size?: string;
    // most_time_spent_location?: string;
    annual_household_income?: string;
    display_profile_reward_banner?: boolean;
    home_ownership?: string;
    household_size?: string;
    household_structure?: string[];
    created_at?: string | null;
    updated_at?: string | null;
  };
  firstnameHashed?: string;
  lastnameHashed?: string;
  emailHashed?: string;
  phoneHashed?: string;
  version?: number;
  subscribe?: boolean;
}

export interface CreateUserFromWebChannelResponse {
  user: Pick<User, 'id' | 'firstname' | 'lastname' | 'email' | 'phone' | 'channel'>;
  access_token: {
    access_token: string;
    created_at: number;
    expires_in: number;
    refresh_token: string;
  };
}

export interface SubmitReviewData {
  review: {
    attachment_keys: string[];
    rating: number;
    title: string;
    content: string;
    is_anonymous: boolean;
    variant_code?: string;
    order_number?: string;
  };
}

export interface SubscriptionsGroups {
  deliver_types: { email: boolean; sms: boolean; web: boolean };
  email: boolean;
  sms: boolean;
  web: boolean;
  description: string;
  name: string;
  subject: string;
}

export interface UserSubscription {
  status: string;
  updated_at: string;
  message_groups: SubscriptionsGroups[];
  created_at: string;
  email: string;
  id: number;
}

// export interface UserAddress {
//   id: number;
//   firstname: string;
//   lastname: string;
//   address1: string;
//   address2: string;
//   city: string;
//   zipcode: string;
//   phone: string;
//   alternative_phone: string;
//   company: string;
//   state: string;
//   state_name: string;
//   country: string;
//   street: string;
//   building_name: string;
//   street_number: string;
//   level: string;
//   flat: string;
//   is_manual: boolean;
//   is_temporary: boolean;
//   is_valid: boolean;
//   is_shippable: boolean;
//   building_type: string;
// }

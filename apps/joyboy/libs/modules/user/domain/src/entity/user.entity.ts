// eslint-disable-next-line @typescript-eslint/no-unused-vars

/**
{
    "id": 145260,
    "firstname": "S",
    "lastname": "T",
    "email": "rick.gao@castlery.com",
    "phone": null,
    "channel": "web",
    "profile": {
        "birthday": null,
        "occupation": null,
        "housing_type": null,
        "home_size": null,
        "most_time_spent_location": null,
        "annual_household_income": null,
        "display_profile_reward_banner": true
    }
}
 */

export type Tokens = {
  access_token: string;
  created_at: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
};

export type Channel = 'web' | 'pos';
// export interface User {
//   id: number;
//   firstname: string;
//   lastname: string;
//   email: string;
//   phone?: string;
//   user_hash?: string;
//   channel: Channel;
//   profile?: {
//     birthday?: string;
//     occupation?: string;
//     housing_type?: string;
//     home_size?: string;
//     most_time_spent_location?: string;
//     annual_household_income?: string;
//     display_profile_reward_banner?: boolean;
//   };
//   firstnameHashed?: string;
//   lastnameHashed?: string;
//   emailHashed?: string;
//   phoneHashed?: string;
// }

// const initialState: User = {
//   id: 0,
//   firstname: '',
//   lastname: '',
//   email: '',
//   phone: '',
//   user_hash: '',
//   channel: Channel.web,
// };

// export const userSlice = createSlice({
//   name: 'user',
//   initialState,
//   reducers: {
//     login: (state, action) => {
//       return action.payload;
//     },
//   },
// });
// export default userSlice;

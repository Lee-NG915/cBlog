import { logout } from "../slice/auth.slice";

export const loggedOutEvent = logout.fulfilled;

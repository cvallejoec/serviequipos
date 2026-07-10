const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://localhost:8000";
const BASE = `${API_URL}/api/v1`;

export const endpoints = {
  auth: {
    googleLogin: `${BASE}/iam/auth/google`,
    microsoftLogin: `${BASE}/iam/auth/microsoft`,
    otpRequest: `${BASE}/iam/auth/otp/request`,
    otpVerify: `${BASE}/iam/auth/otp/verify`,
  },
  users: {
    me: `${BASE}/iam/users/me`,
    profile: `${BASE}/iam/users/me/profile`,
  },
  me: {
    profile: `${BASE}/me/profile`,
    avatar: `${BASE}/me/avatar`,
  },
} as const;

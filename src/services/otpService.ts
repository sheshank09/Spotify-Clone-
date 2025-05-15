import { supabase } from '../lib/supabase';

export const sendOtp = async (email: string) => {
const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) {
    throw new Error(error.message);
  }
};

export const verifyOtp = async (otp: string) => {
  // Implement OTP verification logic here
  // This may involve checking the OTP against a database or service
};

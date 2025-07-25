
export type Payment = {
  amount: number;
  currency: string;
  date: string;
};

export type PaymentInfo = {
  payment_method: string;
  card_type: string;
  last_four_digits: string;
  expiry_date: string;
};

export type User = {
  id: number;
  subscription_id: number;
  plan_id: number;
  user_id: number;
  user_email: string;
  marketing_consent: boolean;
  update_url: string;
  cancel_url: string;
  state: string;
  signup_date: string;
  quantity: number;
  last_payment: Payment;
  next_payment: Payment;
  payment_information: PaymentInfo;
};

export type UserDB = {
  id: number;
  subscription_id: number;
  plan_id: number;
  user_id: number;
  user_email: string;
  marketing_consent: boolean;
  update_url: string;
  cancel_url: string;
  state: string;
  signup_date: string;
  quantity: number;
  last_payment_json: string;
  next_payment_json: string;
  payment_information_json: string;
};
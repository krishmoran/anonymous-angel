export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  retailer: string;
  product_id: string;
  max_price?: number; // Optional max price for Zinc API (price + $5)
}

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2?: string;
  zip_code: string;
  city: string;
  state: string;
  country: string;
  phone_number: string;
}

export interface PaymentInfo {
  name: string;
  number: string;
  cvv: string;
  expiryMonth: string;
  expiryYear: string;
}

export interface GiftOrder {
  product: Product;
  message?: string;
  shipping_address: ShippingAddress;
  payment: PaymentInfo;
  email: string; // Sender's email
  reveal_email?: string; // Optional email for identity reveal
  request_id?: string;
}
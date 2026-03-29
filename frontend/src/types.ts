export type OrderDto = {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product_type: string;
  description: string;
  colors: string;
  sizes: string;
  delivery_address: string;
  order_date: string | null;
  status: string;
  preferred_payment: string;
};

export const salesChannelOptions = ['bolt', 'webshop', 'nagyker'] as const;

export type SalesChannel = (typeof salesChannelOptions)[number];

export type AnnouncementSubmitPayload = {
  name: string;
  email: string;
  phone: string | null;
  consent: boolean;
};

export type GiftSubmitPayload = {
  full_name: string;
  email: string;
  phone: string;
  shipping_address: string;
  purchase_location: string;
  purchase_date: string;
  consent: boolean;
  purchase_declaration: boolean;
  receipt_url: string | null;
  receipt_path: string | null;
};

export type ResellerSubmitPayload = {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  website: string | null;
  sales_channel: SalesChannel;
  message: string | null;
};

export type FormSubmitRequest =
  | {
      formType: 'announcement_signup';
      payload: AnnouncementSubmitPayload;
    }
  | {
      formType: 'gift_claim';
      payload: GiftSubmitPayload;
    }
  | {
      formType: 'reseller_application';
      payload: ResellerSubmitPayload;
    };

export type FormSubmitResponse = {
  ok: boolean;
  isDuplicate?: boolean;
  error?: string;
};

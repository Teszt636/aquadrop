export type EmailNotificationType =
  | 'announcement_signup'
  | 'gift_claim'
  | 'reseller_application'
  | 'announcement_signup_exists'
  | 'gift_claim_exists'
  | 'reseller_application_exists';

export type AnnouncementNotificationPayload = {
  name: string;
  email: string;
  phone: string | null;
};

export type GiftNotificationPayload = {
  fullName: string;
  email: string;
  phone: string;
  shippingAddress: string;
  purchaseLocation: string;
  purchaseDate: string;
  receiptUrl: string | null;
  statusUrl?: string | null;
};

export type ResellerNotificationPayload = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string | null;
  salesChannel: string;
  message: string | null;
};

export type EmailNotificationRequest =
  | {
      type: 'announcement_signup';
      payload: AnnouncementNotificationPayload;
    }
  | {
      type: 'gift_claim';
      payload: GiftNotificationPayload;
    }
  | {
      type: 'reseller_application';
      payload: ResellerNotificationPayload;
    }
  | {
      type: 'announcement_signup_exists';
      payload: AnnouncementNotificationPayload;
    }
  | {
      type: 'gift_claim_exists';
      payload: GiftNotificationPayload;
    }
  | {
      type: 'reseller_application_exists';
      payload: ResellerNotificationPayload;
    };

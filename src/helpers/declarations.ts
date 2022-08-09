export interface VKUser {
    id: number;
    first_name: string;
    last_name: string;
    can_access_closed: boolean;
    is_closed: boolean;
    type: string;
    deactivated?: string;
}

export type LikeUser = VKUser & {
    likes: number;
}

export type ActiveUser = VKUser & {
    comments: number;
}

export type Friend = VKUser & {
    sex: number
}

export type FriendWithCity = Friend & { city?: { id: number, title: string } }

export interface AllInformation {
    likeUsers: LikeUser[];
    activeUser: ActiveUser | null;
    secretGuests: FriendWithCity[];
    interestedUsers: Friend[];
}

export type GiftUser = VKUser & {
    gifts: number;
}

export type ImportantUser = VKUser & LikeUser & ActiveUser & {
    sum: number;
};

export interface WebhookBody {
    eshopId: '462460';
    paymentId: '3996726087';
    orderId: '35323435';
    eshopAccount: '6512480542';
    serviceName: 'VKBOT';
    recipientAmount: '10.00';
    commissionAmount: '0.35';
    recipientOriginalAmount: '10.00';
    recipientCurrency: 'RUB';
    paymentStatus: '5';
    userName: '';
    userEmail: 'cash-city@list.ru';
    paymentData: '2022-04-27 02:03:29';
    secretKey: '159357Iluxa@@';
    payMethod: 'Acquiring';
    shortPan: '';
    country: '';
    bank: '';
    ipAddress: '';
    cardHolder: '';
    brandType: '';
    rcCode: '';
    rcCodeUserDescription: '';
    gatewayName: 'QiwiBankDirect';
    hash: 'fc0d3e69ba42d2ecf2f6bccbf7159030';
  }
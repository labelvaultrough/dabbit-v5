// Types for points & rewards system

export interface PointsTransaction {
  id: string;
  timestamp: string;
  amount: number;
  type: 'earned' | 'redeemed' | 'expired';
  source: 'habit' | 'bonus' | 'challenge' | 'redemption';
  habitId?: string;
  description: string;
}

export interface EventDiscount {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  discountAmount: number;
  maxDiscountPercentage: number;
  category: 'workshop' | 'comedy' | 'classes' | 'other';
  validUntil?: string;
  imageUrl?: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time?: string;
  location: {
    name: string;
    city: string;
  };
  price: number;
  discountedPrice?: number;
  category: 'workshop' | 'comedy' | 'classes' | 'other';
  imageUrl: string;
}

export interface Redemption {
  id: string;
  discountId: string;
  eventId: string;
  eventName: string;
  pointsUsed: number;
  discountAmount: number;
  originalPrice: number;
  timestamp: string;
  status: 'active' | 'used' | 'expired';
  redemptionCode: string;
}

export interface Subscription {
  id: string;
  name: string;
  description: string;
  duration: string;
  originalPrice: number;
  discountedPrice: number;
  pointsCost: number;
  imageUrl: string;
}

export interface GoodieItem {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  pointsCost: number;
  imageUrl: string;
} 
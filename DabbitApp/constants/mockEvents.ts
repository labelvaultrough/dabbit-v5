import { Event, EventDiscount, Subscription, GoodieItem } from '@/types/points';
import { generateId } from '@/utils/helpers';

// Check if mock events exist
console.log('Loading mock data for rewards screen');

export const MOCK_EVENTS: Event[] = [
  {
    id: generateId(),
    name: 'Mindfulness Workshop',
    description: 'A full-day workshop focused on mindfulness practices for daily life. Learn techniques to reduce stress and improve focus.',
    date: '2025-05-10',
    time: '09:00 - 17:00',
    location: {
      name: 'Zen Center',
      city: 'Mumbai',
    },
    price: 1200,
    discountedPrice: 900,
    category: 'workshop',
    imageUrl: 'https://images.unsplash.com/photo-1545389336-cf090694435e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: generateId(),
    name: 'Stand-up Comedy Night',
    description: 'Enjoy an evening of laughter with the best stand-up comedians in town.',
    date: '2025-05-15',
    time: '20:00 - 22:00',
    location: {
      name: 'Laugh Factory',
      city: 'Delhi',
    },
    price: 800,
    discountedPrice: 600,
    category: 'comedy',
    imageUrl: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: generateId(),
    name: 'Cooking Masterclass',
    description: 'Learn to cook gourmet dishes from a professional chef. Includes hands-on cooking session and tasting.',
    date: '2025-05-20',
    time: '11:00 - 14:00',
    location: {
      name: 'Culinary Institute',
      city: 'Bangalore',
    },
    price: 1500,
    discountedPrice: 1200,
    category: 'classes',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: generateId(),
    name: 'Yoga Retreat Weekend',
    description: 'A weekend of yoga, meditation, and relaxation by the beach. All levels welcome.',
    date: '2025-05-25',
    time: 'Full Weekend',
    location: {
      name: 'Serenity Resort',
      city: 'Goa',
    },
    price: 3500,
    discountedPrice: 2800,
    category: 'workshop',
    imageUrl: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
];

// Mock subscriptions data
export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: generateId(),
    name: 'Headspace Premium',
    description: 'Get unlimited access to guided meditations and mindfulness exercises',
    duration: '1 month',
    originalPrice: 899,
    discountedPrice: 599,
    pointsCost: 400,
    imageUrl: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: generateId(),
    name: 'Calm Premium',
    description: 'Sleep stories, meditation guides, and relaxing music',
    duration: '3 months',
    originalPrice: 2499,
    discountedPrice: 1999,
    pointsCost: 800,
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: generateId(),
    name: 'Fitness Pro',
    description: 'Home workout routines with expert trainers',
    duration: '1 month',
    originalPrice: 999,
    discountedPrice: 699,
    pointsCost: 450,
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
];

// Mock goodies data
export const MOCK_GOODIES: GoodieItem[] = [
  {
    id: generateId(),
    name: 'Meditation Cushion',
    description: 'Ergonomic cushion for comfortable meditation sessions',
    originalPrice: 1499,
    discountedPrice: 999,
    pointsCost: 550,
    imageUrl: 'https://images.unsplash.com/photo-1591228127791-8e2eaef098d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: generateId(),
    name: 'Eco Water Bottle',
    description: 'Stainless steel, BPA-free water bottle',
    originalPrice: 899,
    discountedPrice: 599,
    pointsCost: 300,
    imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: generateId(),
    name: 'Yoga Mat',
    description: 'Non-slip, eco-friendly yoga mat for your practice',
    originalPrice: 1299,
    discountedPrice: 899,
    pointsCost: 450,
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: generateId(),
    name: 'Sleep Mask',
    description: 'Soft, contoured sleep mask for better rest',
    originalPrice: 699,
    discountedPrice: 399,
    pointsCost: 200,
    imageUrl: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
]; 
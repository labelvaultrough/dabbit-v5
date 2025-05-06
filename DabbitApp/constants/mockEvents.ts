import { Event, EventDiscount } from '@/types/points';
import { generateId } from '@/utils/helpers';

// Check if mock events exist
console.log('Loading MOCK_EVENTS and MOCK_DISCOUNTS');

export const MOCK_DISCOUNTS: EventDiscount[] = [
  {
    id: generateId(),
    name: 'Premium Discount',
    description: 'Get ₹300 off on selected premium events',
    pointsCost: 300,
    discountAmount: 300,
    maxDiscountPercentage: 30,
    category: 'workshop',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  },
  {
    id: generateId(),
    name: 'Standard Discount',
    description: 'Get ₹200 off on selected events',
    pointsCost: 200,
    discountAmount: 200,
    maxDiscountPercentage: 30,
    category: 'comedy',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: generateId(),
    name: 'Basic Discount',
    description: 'Get ₹100 off on selected events',
    pointsCost: 100,
    discountAmount: 100,
    maxDiscountPercentage: 30,
    category: 'classes',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

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
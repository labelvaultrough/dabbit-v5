import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the time block type
export type TimeBlock = {
  id: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  startTime: string; // 24-hour format HH:MM
  endTime: string;   // 24-hour format HH:MM
  emoji: string;
};

// Define the context type
type TimeBlockContextType = {
  timeBlocks: TimeBlock[];
  updateTimeBlock: (updatedBlock: TimeBlock) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  getTimeBlockForHour: (hour: number) => TimeBlock;
  isWithinTimeBlock: (timeString: string, blockId: TimeBlock['id']) => boolean;
};

// Default time blocks
const DEFAULT_TIME_BLOCKS: TimeBlock[] = [
  { id: 'Morning', startTime: '05:00', endTime: '11:59', emoji: '🌞' },
  { id: 'Afternoon', startTime: '12:00', endTime: '16:59', emoji: '⛅' },
  { id: 'Evening', startTime: '17:00', endTime: '20:59', emoji: '✨' },
  { id: 'Night', startTime: '21:00', endTime: '04:59', emoji: '🌕' },
];

// Storage key
const TIME_BLOCKS_STORAGE_KEY = '@dabbit_time_blocks';

// Create the context
const TimeBlockContext = createContext<TimeBlockContextType | undefined>(undefined);

// Provider component
export function TimeBlockProvider({ children }: { children: React.ReactNode }) {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(DEFAULT_TIME_BLOCKS);

  // Load saved time blocks on initial render
  useEffect(() => {
    const loadTimeBlocks = async () => {
      try {
        const savedBlocks = await AsyncStorage.getItem(TIME_BLOCKS_STORAGE_KEY);
        if (savedBlocks) {
          setTimeBlocks(JSON.parse(savedBlocks));
        }
      } catch (error) {
        console.error('Error loading time blocks:', error);
      }
    };

    loadTimeBlocks();
  }, []);

  // Save time blocks whenever they change
  const saveTimeBlocks = async (blocks: TimeBlock[]) => {
    try {
      await AsyncStorage.setItem(TIME_BLOCKS_STORAGE_KEY, JSON.stringify(blocks));
    } catch (error) {
      console.error('Error saving time blocks:', error);
    }
  };

  // Update a time block
  const updateTimeBlock = async (updatedBlock: TimeBlock) => {
    const newBlocks = timeBlocks.map(block => 
      block.id === updatedBlock.id ? updatedBlock : block
    );
    setTimeBlocks(newBlocks);
    await saveTimeBlocks(newBlocks);
  };

  // Reset to default time blocks
  const resetToDefaults = async () => {
    setTimeBlocks(DEFAULT_TIME_BLOCKS);
    await saveTimeBlocks(DEFAULT_TIME_BLOCKS);
  };

  // Helper: Get the time block for a specific hour
  const getTimeBlockForHour = (hour: number): TimeBlock => {
    // Convert hour to HH:00 format for comparison
    const timeString = `${hour.toString().padStart(2, '0')}:00`;
    
    // Special handling for Night which wraps around midnight
    const nightBlock = timeBlocks.find(block => block.id === 'Night');
    if (nightBlock) {
      const nightStart = parseInt(nightBlock.startTime.split(':')[0], 10);
      const nightEnd = parseInt(nightBlock.endTime.split(':')[0], 10);
      
      // If night ends in the morning (e.g., 21:00 - 04:59)
      if (nightStart > nightEnd) {
        if (hour >= nightStart || hour <= nightEnd) {
          return nightBlock;
        }
      } else if (hour >= nightStart && hour <= nightEnd) {
        return nightBlock;
      }
    }
    
    // Check other time blocks
    for (const block of timeBlocks) {
      if (block.id === 'Night') continue; // Already handled

      const blockStart = parseInt(block.startTime.split(':')[0], 10);
      const blockEnd = parseInt(block.endTime.split(':')[0], 10);
      
      // Include the end hour fully (up to XX:59)
      if (hour >= blockStart && hour <= blockEnd) {
        return block;
      }
    }
    
    // Default to morning if no match - this should never happen with proper validation
    return timeBlocks.find(block => block.id === 'Morning') || DEFAULT_TIME_BLOCKS[0];
  };

  // Helper: Check if all hours of the day are covered by time blocks
  const validateFullDayCoverage = (): boolean => {
    // Check each hour of the day (0-23)
    for (let hour = 0; hour < 24; hour++) {
      let hourIsCovered = false;
      
      // Check if this hour is covered by any time block
      for (const block of timeBlocks) {
        const blockStart = parseInt(block.startTime.split(':')[0], 10);
        const blockEnd = parseInt(block.endTime.split(':')[0], 10);
        
        if (block.id === 'Night' && blockStart > blockEnd) {
          // Night block wraps around midnight
          if (hour >= blockStart || hour <= blockEnd) {
            hourIsCovered = true;
            break;
          }
        } else if (hour >= blockStart && hour <= blockEnd) {
          hourIsCovered = true;
          break;
        }
      }
      
      if (!hourIsCovered) {
        return false;
      }
    }
    
    return true;
  };

  // Helper: Check if a time string is within a specific time block
  const isWithinTimeBlock = (timeString: string, blockId: TimeBlock['id']): boolean => {
    if (!timeString) return false;
    
    const [hourStr, minuteStr] = timeString.split(':');
    const hour = parseInt(hourStr, 10);
    
    const block = timeBlocks.find(b => b.id === blockId);
    if (!block) return false;
    
    return getTimeBlockForHour(hour).id === blockId;
  };

  return (
    <TimeBlockContext.Provider 
      value={{ 
        timeBlocks, 
        updateTimeBlock, 
        resetToDefaults,
        getTimeBlockForHour,
        isWithinTimeBlock
      }}
    >
      {children}
    </TimeBlockContext.Provider>
  );
}

// Custom hook to use the time block context
export function useTimeBlocks() {
  const context = useContext(TimeBlockContext);
  if (context === undefined) {
    throw new Error('useTimeBlocks must be used within a TimeBlockProvider');
  }
  return context;
} 
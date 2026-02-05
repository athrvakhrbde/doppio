
import { create } from 'zustand';


export type Intent = 'body-double' | 'focus' | 'social';

export interface Cafe {
    id: string;
    name: string;
    coords: [number, number];
    amenities?: string[];
    coworkers: { name: string, intent: Intent }[];
    hasDouble?: boolean;
}

interface CheckInState {
    currentCafeId: string | null;
    isCheckedIn: boolean;
    intent: Intent | null;
    userName: string;
    setUserName: (name: string) => void;
    cafes: Cafe[];
    checkIn: (cafeId: string, intent: Intent) => void;
    checkOut: () => void;
    addCafe: (cafe: Cafe) => void;
}

const INITIAL_CAFES: Cafe[] = [];

export const useCheckInStore = create<CheckInState>((set) => ({
    currentCafeId: null,
    isCheckedIn: false,
    intent: null,
    userName: 'anon',
    setUserName: (name: string) => set({ userName: name }),
    cafes: INITIAL_CAFES,
    checkIn: (cafeId: string, intent: Intent) => set({ currentCafeId: cafeId, isCheckedIn: true, intent }),
    checkOut: () => set({ currentCafeId: null, isCheckedIn: false, intent: null }),
    addCafe: (cafe: Cafe) => set((state) => ({ cafes: [cafe, ...state.cafes] })),
}));

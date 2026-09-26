'use client';

import { create } from 'zustand';
import type { User, UserRole } from '@/types';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    hasRole: (roles: UserRole[]) => boolean;
    isAtLeast: (role: UserRole) => boolean;
    signOut: () => void;
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
    viewer: 0,
    designer: 1,
    admin: 2,
    super_admin: 3,
};

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isLoading: true,

    setUser: (user) => set({ user, isLoading: false }),
    setLoading: (isLoading) => set({ isLoading }),

    hasRole: (roles) => {
        const { user } = get();
        if (!user) return false;
        return roles.includes(user.role);
    },

    isAtLeast: (role) => {
        const { user } = get();
        if (!user) return false;
        return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[role];
    },

    signOut: () => set({ user: null, isLoading: false }),
}));

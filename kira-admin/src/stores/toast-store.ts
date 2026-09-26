'use client';

import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
    id: string;
    message: string;
    variant: ToastVariant;
}

interface ToastState {
    toasts: ToastItem[];
    addToast: (message: string, variant?: ToastVariant) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],

    addToast: (message, variant = 'success') => {
        const id = `toast_${Date.now()}`;
        set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }));
        setTimeout(() => {
            set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, 4000);
    },

    removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

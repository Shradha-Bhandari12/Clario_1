'use client';

import { useEffect, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@/types';

export function AuthProvider({ children }: { children: ReactNode }) {
    const setUser = useAuthStore((s) => s.setUser);
    const setLoading = useAuthStore((s) => s.setLoading);

    useEffect(() => {
        const supabase = createClient();

        // Get initial session
        const initAuth = async () => {
            try {
                const {
                    data: { user: authUser },
                } = await supabase.auth.getUser();

                if (authUser) {
                    // Fetch user profile from users table
                    const { data: profile } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', authUser.id)
                        .single();

                    if (profile) {
                        setUser(profile as User);
                    } else {
                        // Auth user exists but no profile — create minimal profile
                        setUser({
                            id: authUser.id,
                            email: authUser.email || '',
                            full_name: authUser.email?.split('@')[0] || 'User',
                            role: 'viewer',
                            avatar_url: null,
                            status: 'active',
                            last_login: new Date().toISOString(),
                            created_at: new Date().toISOString(),
                        });
                    }
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            }
        };

        initAuth();

        // Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT' || !session?.user) {
                setUser(null);
                return;
            }

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    setUser(profile as User);
                }
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, setLoading]);

    return <>{children}</>;
}

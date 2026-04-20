'use client';
import { useAppStore } from '@/stores/useAppStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RoleGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
    const { user, isLoading } = useAppStore();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && (!user || !allowedRoles.includes(user.role))) {
            router.push('/login');
        }
    }, [user, router, allowedRoles, isLoading]);

    if (isLoading) return null; // Or a loading spinner

    return user && allowedRoles.includes(user.role) ? <>{children}</> : null;
}
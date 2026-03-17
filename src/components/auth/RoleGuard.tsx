'use client';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RoleGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!user || !allowedRoles.includes(user.role)) {
            router.push('/login');
        }
    }, [user, router, allowedRoles]);

    return user && allowedRoles.includes(user.role) ? <>{children}</> : null;
}
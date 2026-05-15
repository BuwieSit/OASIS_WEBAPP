import { useQuery } from '@tanstack/react-query';
import { AdminAPI } from '../api/admin.api';

/**
 * Custom hook to fetch and manage Admin Dashboard statistics.
 */
export const useAdminStats = () => {
    const { data: dashboard, isLoading, error, refetch } = useQuery({
        queryKey: ['adminDashboard'],
        queryFn: AdminAPI.getDashboard,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return {
        dashboard,
        metrics: dashboard?.metrics || {},
        lastUpdated: dashboard?.last_updated,
        isLoading,
        error,
        refetch
    };
};

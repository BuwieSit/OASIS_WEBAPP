import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminAPI } from '../api/admin.api';
import { NotificationAPI } from '../api/notification.api.js';
import { useAuth } from '../context/authContext';

/**
 * Custom hook for handling notifications/alerts for both Admin and Students.
 */
export const useNotifications = () => {
    const { role } = useAuth();
    const queryClient = useQueryClient();

    // Fetching logic based on role
    const { data: notifications = [], isLoading, error } = useQuery({
        queryKey: ['notifications', role],
        queryFn: role === 'ADMIN' ? AdminAPI.getAdminAlerts : NotificationAPI.getStudentNotifications,
        refetchInterval: 5000, // Refresh every 5 seconds
        enabled: !!role,
    });

    // Mutations (mostly for students currently, but extensible)
    const markAsReadMutation = useMutation({
        mutationFn: NotificationAPI.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', role] });
        },
    });

    const toggleSaveMutation = useMutation({
        mutationFn: NotificationAPI.toggleSave,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', role] });
        },
    });

    return {
        notifications,
        isLoading,
        error,
        markAsRead: markAsReadMutation.mutate,
        toggleSave: toggleSaveMutation.mutate,
    };
};

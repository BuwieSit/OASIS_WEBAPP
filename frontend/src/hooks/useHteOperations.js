import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminAPI } from '../api/admin.api';

/**
 * Custom hook for HTE (Host Training Establishment) operations.
 * Handles fetching, creation, importing, and exporting.
 */
export const useHteOperations = (statusFilter = "") => {
    const queryClient = useQueryClient();

    // 1. Fetch HTEs
    const { data: htes = [], isLoading: htesLoading, error: htesError } = useQuery({
        queryKey: ['adminHtes', statusFilter],
        queryFn: () => AdminAPI.getHTEs(statusFilter),
    });

    // 2. Create HTE
    const createHteMutation = useMutation({
        mutationFn: AdminAPI.createHTE,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminHtes'] });
        },
    });

    // 3. Export HTEs to Excel
    const exportHtes = async (filter) => {
        try {
            const res = await AdminAPI.downloadHTEsExcel(filter || "ALL");
            const blob = new Blob([res.data], { 
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `hte_list_${filter || "ALL"}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error("Export failed:", error);
            throw error;
        }
    };

    // 4. Import HTEs from Excel
    const importHtesMutation = useMutation({
        mutationFn: AdminAPI.uploadHTEsExcel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminHtes'] });
        },
    });

    return {
        htes,
        htesLoading,
        htesError,
        createHte: createHteMutation.mutateAsync,
        isCreating: createHteMutation.isPending,
        importHtes: importHtesMutation.mutateAsync,
        isImporting: importHtesMutation.isPending,
        exportHtes,
    };
};

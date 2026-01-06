import { useCallback, useEffect, useState } from 'react';
import { Plant, PlantCreateInput, PlantUpdateInput } from '@/types/plant';
import { plantService } from '@/services/plantService';

interface UsePlantManagementReturn {
    plants: Plant[];
    isLoading: boolean;
    error: string | null;
    addPlant: (input: PlantCreateInput) => Promise<Plant>;
    updatePlant: (id: string, input: PlantUpdateInput) => Promise<Plant | null>;
    deletePlant: (id: string) => Promise<boolean>;
    recordCareTask: (plantId: string, category: string) => Promise<Plant | null>;
    refreshPlants: () => Promise<void>;
    clearError: () => void;
}

/**
 * Hook for managing plant operations
 * Single source of truth for plant state
 */
export function usePlantManagement(): UsePlantManagementReturn {
    const [plants, setPlants] = useState<Plant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load plants on mount
    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                const loaded = await plantService.getAllPlants();
                setPlants(loaded);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load plants');
                setPlants([]);
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, []);

    const addPlant = useCallback(async (input: PlantCreateInput): Promise<Plant> => {
        try {
            const newPlant = await plantService.createPlant(input);
            setPlants(prev => [...prev, newPlant]);
            setError(null);
            return newPlant;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to add plant';
            setError(message);
            throw err;
        }
    }, []);

    const updatePlant = useCallback(async (id: string, input: PlantUpdateInput): Promise<Plant | null> => {
        try {
            const updated = await plantService.updatePlant(id, input);
            if (updated) {
                setPlants(prev => prev.map(p => p.id === id ? updated : p));
            }
            setError(null);
            return updated;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update plant';
            setError(message);
            throw err;
        }
    }, []);

    const deletePlant = useCallback(async (id: string): Promise<boolean> => {
        try {
            const success = await plantService.deletePlant(id);
            if (success) {
                setPlants(prev => prev.filter(p => p.id !== id));
            }
            setError(null);
            return success;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete plant';
            setError(message);
            throw err;
        }
    }, []);

    const recordCareTask = useCallback(async (plantId: string, category: string): Promise<Plant | null> => {
        try {
            const updated = await plantService.recordCareTask(plantId, category);
            if (updated) {
                setPlants(prev => prev.map(p => p.id === plantId ? updated : p));
            }
            setError(null);
            return updated;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to record task';
            setError(message);
            throw err;
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    const refreshPlants = useCallback(async () => {
        try {
            setIsLoading(true);
            const loaded = await plantService.getAllPlants();
            setPlants(loaded);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to refresh plants');
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        plants,
        isLoading,
        error,
        addPlant,
        updatePlant,
        deletePlant,
        recordCareTask,
        refreshPlants,
        clearError,
    };
}

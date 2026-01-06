import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from 'react';

export interface PlantPhoto {
    id: string;
    plantId: string;
    imageUri: string;
    timestamp: Date;
    notes?: string;
    height?: number; // in cm
    width?: number; // in cm
}

const PHOTOS_STORAGE_KEY = 'plant_photos';

/**
 * Custom hook for managing plant photos
 * Handles local storage of photos with metadata
 * In production, this would integrate with cloud storage like Firebase or AWS S3
 */
export function usePhotoManagement() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Get all photos for a plant
     */
    const getPlantPhotos = useCallback(async (plantId: string): Promise<PlantPhoto[]> => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await AsyncStorage.getItem(PHOTOS_STORAGE_KEY);
            if (!data) return [];

            const allPhotos = JSON.parse(data) as PlantPhoto[];
            const plantPhotos = allPhotos.filter(p => p.plantId === plantId);

            // Sort by timestamp descending (newest first)
            return plantPhotos.sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load photos';
            setError(message);
            console.error('Error getting plant photos:', err);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Add a new photo
     */
    const addPhoto = useCallback(async (
        plantId: string,
        imageUri: string,
        notes?: string,
        height?: number,
        width?: number
    ): Promise<PlantPhoto | null> => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await AsyncStorage.getItem(PHOTOS_STORAGE_KEY);
            const allPhotos = data ? JSON.parse(data) : [];

            const newPhoto: PlantPhoto = {
                id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                plantId,
                imageUri,
                timestamp: new Date(),
                notes,
                height,
                width,
            };

            allPhotos.push(newPhoto);
            await AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(allPhotos));

            return newPhoto;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to add photo';
            setError(message);
            console.error('Error adding photo:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Delete a photo
     */
    const deletePhoto = useCallback(async (photoId: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await AsyncStorage.getItem(PHOTOS_STORAGE_KEY);
            if (!data) return false;

            const allPhotos = JSON.parse(data) as PlantPhoto[];
            const filteredPhotos = allPhotos.filter(p => p.id !== photoId);

            await AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(filteredPhotos));
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete photo';
            setError(message);
            console.error('Error deleting photo:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Update photo metadata
     */
    const updatePhoto = useCallback(async (
        photoId: string,
        updates: Partial<Omit<PlantPhoto, 'id' | 'timestamp'>>
    ): Promise<PlantPhoto | null> => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await AsyncStorage.getItem(PHOTOS_STORAGE_KEY);
            if (!data) return null;

            const allPhotos = JSON.parse(data) as PlantPhoto[];
            const index = allPhotos.findIndex(p => p.id === photoId);

            if (index === -1) return null;

            allPhotos[index] = {
                ...allPhotos[index],
                ...updates,
            };

            await AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(allPhotos));
            return allPhotos[index];
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update photo';
            setError(message);
            console.error('Error updating photo:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Get the most recent photo for a plant
     */
    const getLatestPhoto = useCallback(async (plantId: string): Promise<PlantPhoto | null> => {
        try {
            const photos = await getPlantPhotos(plantId);
            return photos.length > 0 ? photos[0] : null;
        } catch (err) {
            console.error('Error getting latest photo:', err);
            return null;
        }
    }, [getPlantPhotos]);

    return {
        isLoading,
        error,
        getPlantPhotos,
        getLatestPhoto,
        addPhoto,
        deletePhoto,
        updatePhoto,
    };
}

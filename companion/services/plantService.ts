import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plant, PlantCreateInput, PlantUpdateInput } from '@/types/plant';

const STORAGE_KEY = 'plants_v1';

/**
 * Helper to safely parse ISO date strings to Date objects
 */
function parseDate(dateString: string | Date | undefined): Date | undefined {
    if (!dateString) return undefined;
    if (dateString instanceof Date) return dateString;
    return new Date(dateString);
}

/**
 * Helper to ensure all plant dates are properly parsed
 */
function normalizePlant(plant: any): Plant {
    return {
        ...plant,
        createdAt: parseDate(plant.createdAt) || new Date(),
        updatedAt: parseDate(plant.updatedAt) || new Date(),
        careSchedules: (plant.careSchedules || []).map((schedule: any) => ({
            ...schedule,
            lastPerformed: parseDate(schedule.lastPerformed),
        })),
    };
}

class PlantService {
    private cache: Plant[] | null = null;

    /**
     * Get all plants (cached)
     */
    async getAllPlants(): Promise<Plant[]> {
        if (this.cache) return this.cache;

        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            this.cache = data ? JSON.parse(data).map(normalizePlant) : [];
            return this.cache;
        } catch (error) {
            console.error('Failed to load plants:', error);
            this.cache = [];
            return [];
        }
    }

    /**
     * Get a single plant by ID
     */
    async getPlant(id: string): Promise<Plant | null> {
        const plants = await this.getAllPlants();
        return plants.find(p => p.id === id) || null;
    }

    /**
     * Create a new plant
     */
    async createPlant(input: PlantCreateInput): Promise<Plant> {
        const now = new Date();
        const newPlant: Plant = {
            ...input,
            id: `plant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: now,
            updatedAt: now,
        };

        const plants = await this.getAllPlants();
        plants.push(newPlant);
        await this.savePlants(plants);
        return newPlant;
    }

    /**
     * Update an existing plant
     */
    async updatePlant(id: string, input: PlantUpdateInput): Promise<Plant | null> {
        const plants = await this.getAllPlants();
        const index = plants.findIndex(p => p.id === id);

        if (index === -1) return null;

        plants[index] = {
            ...plants[index],
            ...input,
            id: plants[index].id,
            createdAt: plants[index].createdAt,
            updatedAt: new Date(),
        };

        await this.savePlants(plants);
        return plants[index];
    }

    /**
     * Delete a plant
     */
    async deletePlant(id: string): Promise<boolean> {
        const plants = await this.getAllPlants();
        const newPlants = plants.filter(p => p.id !== id);

        if (newPlants.length === plants.length) return false;

        await this.savePlants(newPlants);
        return true;
    }

    /**
     * Record that a care task was completed
     */
    async recordCareTask(plantId: string, category: string): Promise<Plant | null> {
        const plant = await this.getPlant(plantId);
        if (!plant) return null;

        const updated = plant.careSchedules.map(schedule =>
            schedule.category === category
                ? { ...schedule, lastPerformed: new Date() }
                : schedule
        );

        return this.updatePlant(plantId, { careSchedules: updated });
    }

    /**
     * Get the next due date for a care task
     */
    async getNextCareDate(plantId: string, category: string): Promise<Date | null> {
        const plant = await this.getPlant(plantId);
        if (!plant) return null;

        const schedule = plant.careSchedules.find(s => s.category === category);
        if (!schedule) return null;

        const lastPerformed = schedule.lastPerformed || plant.createdAt;
        const nextDate = new Date(lastPerformed);
        nextDate.setDate(nextDate.getDate() + schedule.frequency);

        return nextDate;
    }

    /**
     * Clear all data (development only)
     */
    async clear(): Promise<void> {
        await AsyncStorage.removeItem(STORAGE_KEY);
        this.cache = null;
    }

    /**
     * Internal: save plants and update cache
     */
    private async savePlants(plants: Plant[]): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
            this.cache = plants;
        } catch (error) {
            this.cache = null;
            console.error('Failed to save plants:', error);
            throw error;
        }
    }
}

export const plantService = new PlantService();

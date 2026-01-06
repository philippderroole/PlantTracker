export type CareCategory = 'watering' | 'fertilization' | 'pruning' | 'repotting';
export type PlantLocation = 'bedroom' | 'balcony' | 'office' | 'living room' | 'kitchen' | 'bathroom' | 'other';

export interface CareSchedule {
    category: CareCategory;
    frequency: number; // in days
    lastPerformed?: Date;
    notes?: string;
}

export interface Plant {
    id: string;
    name: string;
    species?: string;
    imageUri?: string;
    location?: PlantLocation;
    notes?: string;
    careSchedules: CareSchedule[];
    createdAt: Date;
    updatedAt: Date;
}

// Input types for mutations
export interface PlantCreateInput {
    name: string;
    species?: string;
    location?: PlantLocation;
    imageUri?: string;
    notes?: string;
    careSchedules: CareSchedule[];
}

export interface PlantUpdateInput {
    name?: string;
    species?: string;
    location?: PlantLocation;
    imageUri?: string;
    notes?: string;
    careSchedules?: CareSchedule[];
}

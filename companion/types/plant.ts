export interface Plant {
    id: string;
    name: string;
    species: string;
    imageUri: string;
    lastWatered?: Date;
    wateringFrequency?: number; // in days
}

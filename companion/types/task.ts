export interface Task {
    id: string;
    title: string;
    completed: boolean;
    plantId?: string;
    dueDate?: Date;
}

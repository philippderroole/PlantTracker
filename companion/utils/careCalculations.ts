import { Plant, CareCategory } from '@/types/plant';

export interface CareTaskStatus {
    category: CareCategory;
    daysUntilDue: number;
    isOverdue: boolean;
    daysOverdue: number;
}

/**
 * Calculate the next due date for a care task
 */
export function getNextDueDate(plant: Plant, category: string): Date | null {
    const schedule = plant.careSchedules.find(s => s.category === category);
    if (!schedule) return null;

    const lastPerformed = schedule.lastPerformed || plant.createdAt;
    const nextDate = new Date(lastPerformed);
    nextDate.setDate(nextDate.getDate() + schedule.frequency);

    return nextDate;
}

/**
 * Get all overdue tasks for a plant
 */
export function getOverdueTasks(plant: Plant, now: Date = new Date()): CareTaskStatus[] {
    const tasks: CareTaskStatus[] = [];

    for (const schedule of plant.careSchedules) {
        const nextDate = getNextDueDate(plant, schedule.category);
        if (!nextDate) continue;

        const isOverdue = nextDate < now;
        const daysOverdue = Math.floor(
            (now.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const daysUntilDue = Math.ceil(
            (nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        tasks.push({
            category: schedule.category,
            daysUntilDue,
            isOverdue,
            daysOverdue,
        });
    }

    return tasks;
}

/**
 * Get the maximum days overdue (for warnings)
 */
export function getMaxDaysOverdue(plant: Plant, now: Date = new Date()): number {
    const overdue = getOverdueTasks(plant, now);
    if (overdue.length === 0) return 0;
    return Math.max(...overdue.map(t => (t.isOverdue ? t.daysOverdue : 0)));
}

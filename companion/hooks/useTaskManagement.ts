import { useCallback, useEffect, useState } from 'react';
import { Plant, CareCategory } from '@/types/plant';
import { notificationService, CareReminder } from '@/services/notificationService';
import { plantService } from '@/services/plantService';

export interface Task {
    id: string;
    plantId: string;
    plantName: string;
    category: CareCategory;
    dueDate: Date;
    isOverdue: boolean;
    daysUntilDue: number;
    frequency: number;
}

/**
 * Custom hook for managing care tasks
 * Generates tasks from plant care schedules and provides task management functions
 */
export function useTaskManagement() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Generate tasks from plants
     */
    const generateTasks = useCallback((plants: Plant[]): Task[] => {
        const reminders = notificationService.generateCareReminders(plants);
        const now = new Date();

        return reminders.map((reminder) => {
            const daysUntilDue = Math.ceil(
                (reminder.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );
            const isOverdue = daysUntilDue < 0;

            // Find the plant to get the frequency
            const plant = plants.find(p => p.id === reminder.plantId);
            const schedule = plant?.careSchedules.find(s => s.category === reminder.category);

            return {
                id: reminder.id,
                plantId: reminder.plantId,
                plantName: reminder.plantName,
                category: reminder.category,
                dueDate: reminder.dueDate,
                isOverdue,
                daysUntilDue,
                frequency: schedule?.frequency || 7,
            };
        });
    }, []);

    /**
     * Get due tasks (overdue or due today)
     */
    const getDueTasks = useCallback((): Task[] => {
        return tasks.filter(task => task.isOverdue || task.daysUntilDue === 0);
    }, [tasks]);

    /**
     * Get upcoming tasks (due in the next 7 days)
     */
    const getUpcomingTasks = useCallback((daysAhead: number = 7): Task[] => {
        return tasks.filter(task => task.daysUntilDue > 0 && task.daysUntilDue <= daysAhead);
    }, [tasks]);

    /**
     * Sort tasks by due date
     */
    const getSortedTasks = useCallback((): Task[] => {
        return [...tasks].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    }, [tasks]);

    /**
     * Mark a task as complete
     */
    const completeTask = useCallback(async (task: Task): Promise<void> => {
        try {
            setIsLoading(true);
            await plantService.recordCareTask(task.plantId, task.category);

            // Refresh tasks would be handled by the caller through useEffect
        } catch (error) {
            console.error('Error completing task:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Update tasks based on plants
     */
    const updateTasks = useCallback((plants: Plant[]): void => {
        const newTasks = generateTasks(plants);
        setTasks(newTasks);
    }, [generateTasks]);

    return {
        tasks,
        isLoading,
        dueTasks: getDueTasks(),
        upcomingTasks: getUpcomingTasks(),
        sortedTasks: getSortedTasks(),
        updateTasks,
        completeTask,
        generateTasks,
    };
}

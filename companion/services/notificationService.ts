import { Plant, CareCategory } from '@/types/plant';

/**
 * NotificationService handles all notification operations
 * This is a local implementation that manages care reminders
 * In production, this would integrate with Firebase Cloud Messaging
 */

export interface CareReminder {
    id: string;
    plantId: string;
    plantName: string;
    category: CareCategory;
    dueDate: Date;
    lastNotifiedDate?: Date;
}

class NotificationService {
    /**
     * Generate care reminders based on plants and their schedules
     */
    generateCareReminders(plants: Plant[]): CareReminder[] {
        const reminders: CareReminder[] = [];
        const now = new Date();

        plants.forEach((plant) => {
            plant.careSchedules.forEach((schedule) => {
                const lastPerformed = schedule.lastPerformed || plant.createdAt;
                const nextDueDate = new Date(lastPerformed);
                nextDueDate.setDate(nextDueDate.getDate() + schedule.frequency);

                reminders.push({
                    id: `${plant.id}-${schedule.category}`,
                    plantId: plant.id,
                    plantName: plant.name,
                    category: schedule.category,
                    dueDate: nextDueDate,
                });
            });
        });

        // Sort by due date
        return reminders.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    }

    /**
     * Get due reminders (tasks that are due today or overdue)
     */
    getDueReminders(reminders: CareReminder[]): CareReminder[] {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return reminders.filter((reminder) => {
            const reminderDate = new Date(
                reminder.dueDate.getFullYear(),
                reminder.dueDate.getMonth(),
                reminder.dueDate.getDate()
            );
            return reminderDate <= today;
        });
    }

    /**
     * Get upcoming reminders (tasks due in the next 7 days)
     */
    getUpcomingReminders(reminders: CareReminder[], daysAhead: number = 7): CareReminder[] {
        const now = new Date();
        const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

        return reminders.filter((reminder) => {
            return reminder.dueDate > now && reminder.dueDate <= futureDate;
        });
    }

    /**
     * Format a reminder for display
     */
    formatReminder(reminder: CareReminder): string {
        const now = new Date();
        const daysUntilDue = Math.ceil(
            (reminder.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilDue < 0) {
            return `${reminder.category} is overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`;
        } else if (daysUntilDue === 0) {
            return `${reminder.category} is due today`;
        } else {
            return `${reminder.category} is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`;
        }
    }

    /**
     * Request notification permissions
     * In a real app, this would request system permissions
     */
    async requestPermissions(): Promise<boolean> {
        // Placeholder for future notification permission system
        return Promise.resolve(true);
    }

    /**
     * Send a notification (placeholder for future implementation)
     */
    async sendNotification(title: string, body: string): Promise<void> {
        // Placeholder for future notification system
        console.log(`[Notification] ${title}: ${body}`);
    }

    /**
     * Schedule all reminders for a set of plants
     */
    async scheduleAllReminders(plants: Plant[]): Promise<void> {
        const reminders = this.generateCareReminders(plants);
        console.log(`Scheduled ${reminders.length} care reminders`);

        // In production, this would use push notifications
        // For now, we just generate the reminders and store them
    }
}

export const notificationService = new NotificationService();


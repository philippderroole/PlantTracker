import { useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTaskManagement } from './useTaskManagement';
import { usePlantManagement } from './usePlantManagement';

// Configure how notifications should behave when the app is foregrounded
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

interface NotificationPreferences {
    enabled: boolean;
    remindBeforeDays: number; // Remind this many days before due date
    reminderTime: string; // Time of day to send reminders (HH:MM format)
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
    enabled: true,
    remindBeforeDays: 1,
    reminderTime: '08:00',
};

export const useNotificationManagement = () => {
    const { plants } = usePlantManagement();
    const { generateTasks } = useTaskManagement();

    // Request notification permissions
    const requestPermissions = useCallback(async () => {
        try {
            const { status } = await Notifications.requestPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Error requesting notification permissions:', error);
            return false;
        }
    }, []);

    // Get notification preferences
    const getPreferences = useCallback(async (): Promise<NotificationPreferences> => {
        try {
            const stored = await AsyncStorage.getItem('notificationPreferences');
            return stored ? JSON.parse(stored) : DEFAULT_PREFERENCES;
        } catch (error) {
            console.error('Error loading notification preferences:', error);
            return DEFAULT_PREFERENCES;
        }
    }, []);

    // Save notification preferences
    const savePreferences = useCallback(async (prefs: NotificationPreferences) => {
        try {
            await AsyncStorage.setItem('notificationPreferences', JSON.stringify(prefs));
        } catch (error) {
            console.error('Error saving notification preferences:', error);
        }
    }, []);

    // Cancel all scheduled notifications
    const cancelAllNotifications = useCallback(async () => {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
        } catch (error) {
            console.error('Error canceling notifications:', error);
        }
    }, []);

    // Schedule reminders for upcoming care tasks
    const scheduleReminders = useCallback(async () => {
        try {
            const prefs = await getPreferences();
            if (!prefs.enabled) return;

            const tasks = generateTasks(plants);
            const upcomingTasks = tasks.filter(task => !task.isOverdue && task.daysUntilDue <= prefs.remindBeforeDays);

            // Cancel existing notifications before scheduling new ones
            await cancelAllNotifications();

            // Schedule notifications for each upcoming task
            for (const task of upcomingTasks) {
                const [hours, minutes] = prefs.reminderTime.split(':').map(Number);
                const nextNotification = new Date();
                nextNotification.setHours(hours, minutes, 0);

                // If the reminder time has already passed today, schedule for tomorrow
                if (nextNotification <= new Date()) {
                    nextNotification.setDate(nextNotification.getDate() + 1);
                }

                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: `Time to ${task.category}!`,
                        body: `${task.plantName} needs ${task.category.toLowerCase()}.`,
                        sound: 'default',
                        badge: 1,
                        data: {
                            plantId: task.plantId,
                            taskId: task.id,
                            category: task.category,
                        },
                    },
                    trigger: {
                        type: 'daily',
                        hour: hours,
                        minute: minutes,
                    },
                });
            }
        } catch (error) {
            console.error('Error scheduling reminders:', error);
        }
    }, [plants, generateTasks, getPreferences, cancelAllNotifications]);

    // Set up notification response listener
    const setupNotificationListener = useCallback(() => {
        const subscription = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
            const { plantId, taskId } = response.notification.request.content.data;
            // Handle notification tap - navigate to plant detail screen
            if (plantId) {
                console.log('Notification tapped, would navigate to plant:', plantId);
                // In a real app, this would use router.push() to navigate
            }
        });

        return () => subscription.remove();
    }, []);

    // Initialize notifications on mount
    useEffect(() => {
        const initialize = async () => {
            const hasPermission = await requestPermissions();
            if (hasPermission) {
                setupNotificationListener();
                scheduleReminders();
            }
        };

        initialize();
    }, [requestPermissions, setupNotificationListener, scheduleReminders]);

    // Re-schedule reminders when plants change
    useEffect(() => {
        scheduleReminders();
    }, [plants, scheduleReminders]);

    return {
        requestPermissions,
        getPreferences,
        savePreferences,
        cancelAllNotifications,
        scheduleReminders,
    };
};

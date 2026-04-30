'use client';

import { useEffect, useRef } from 'react';
import { apiService } from '@/lib/api';
import { useNotification } from '@/lib/notification-context';
import { useAuthStore } from '@/stores/authStore';

interface NotificationState {
  lastCheck: number;
  notifiedReminderStages: Set<string>;
  notifiedTripStages: Set<string>;
}

const notificationState: NotificationState = {
  lastCheck: 0,
  notifiedReminderStages: new Set(),
  notifiedTripStages: new Set(),
};

export function useReminderNotifications() {
  const { addToast } = useNotification();
  const userId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const checkReminders = async () => {
      try {
        const remindersResponse = await apiService.getReminders();
        const now = new Date();

        remindersResponse.items.forEach((reminder) => {
          const dueDate = new Date(reminder.due_date);
          const hoursBefore = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
          const reminderNowKey = `${userId}:${reminder.id}:now`;
          const reminderSoonKey = `${userId}:${reminder.id}:soon`;
          const reminderTomorrowKey = `${userId}:${reminder.id}:tomorrow`;
          const reminderEmailKey = `${userId}:${reminder.id}:email`;

          if (reminder.is_completed) {
            return;
          }

          // Notify at due time, 1 hour before, and 1 day before.
          // Stage keys allow later reminders to fire even if an earlier one already showed.
          if (hoursBefore <= 0.1) {
            if (notificationState.notifiedReminderStages.has(reminderNowKey)) {
              return;
            }

            addToast(
              '⏰ Reminder Now!',
              `${reminder.title} is due now`,
              'warning',
              6000
            );
            notificationState.notifiedReminderStages.add(reminderNowKey);
          } else if (hoursBefore > 0 && hoursBefore <= 1) {
            if (notificationState.notifiedReminderStages.has(reminderSoonKey)) {
              return;
            }

            addToast(
              '⏰ Reminder Due Soon',
              `${reminder.title} is due in less than 1 hour`,
              'warning',
              6000
            );
            notificationState.notifiedReminderStages.add(reminderSoonKey);
          } else if (hoursBefore > 24 && hoursBefore <= 24.5) {
            if (notificationState.notifiedReminderStages.has(reminderTomorrowKey)) {
              return;
            }

            addToast(
              '📅 Reminder Coming Tomorrow',
              `${reminder.title} is due tomorrow`,
              'info',
              6000
            );
            notificationState.notifiedReminderStages.add(reminderTomorrowKey);
          }
        });

        const tripsResponse = await apiService.getTrips();
        tripsResponse.items.forEach((trip) => {
          const startDate = new Date(trip.startDate);
          const daysBefore = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          const tripTomorrowKey = `${userId}:${trip.id}:tomorrow`;
          const tripThreeDayKey = `${userId}:${trip.id}:three-days`;
          const tripWeekKey = `${userId}:${trip.id}:week`;

          if (daysBefore > 0 && daysBefore <= 1) {
            if (notificationState.notifiedTripStages.has(tripTomorrowKey)) {
              return;
            }

            addToast(
              '✈️ Trip Tomorrow!',
              `Your trip to ${trip.destination} starts tomorrow`,
              'warning',
              6000
            );
            notificationState.notifiedTripStages.add(tripTomorrowKey);
          } else if (daysBefore > 3 && daysBefore <= 3.5) {
            if (notificationState.notifiedTripStages.has(tripThreeDayKey)) {
              return;
            }

            addToast(
              '✈️ Trip in 3 Days',
              `Your trip to ${trip.destination} starts in 3 days`,
              'info',
              6000
            );
            notificationState.notifiedTripStages.add(tripThreeDayKey);
          } else if (daysBefore > 7 && daysBefore <= 7.5) {
            if (notificationState.notifiedTripStages.has(tripWeekKey)) {
              return;
            }

            addToast(
              '✈️ Trip Next Week',
              `Your trip to ${trip.destination} starts in a week`,
              'info',
              6000
            );
            notificationState.notifiedTripStages.add(tripWeekKey);
          }
        });

        notificationState.lastCheck = Date.now();
      } catch (error) {
        console.error('Failed to check reminders:', error);
      }
    };

    // Check on mount
    checkReminders();

    // Check every 5 minutes
    const interval = setInterval(checkReminders, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [addToast, userId]);
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

type TaskReminderData = {
  taskId: string;
  taskName: string;
  taskDate: string;
};

export const NOTIFICATION_SETTINGS_KEY = 'notification_settings';
export const TASK_REMINDER_CHANNEL_ID = 'task-reminders';

const REMINDER_HOUR = 9;
const REMINDER_MINUTE = 0;

const isExpoGoAndroid = Platform.OS === 'android' && Constants.appOwnership === 'expo';

let notificationsModule: NotificationsModule | null = null;
let notificationHandlerConfigured = false;

async function getNotificationsModule() {
  if (Platform.OS === 'web' || isExpoGoAndroid) {
    return null;
  }

  if (notificationsModule) {
    return notificationsModule;
  }

  try {
    notificationsModule = await import('expo-notifications');

    if (!notificationHandlerConfigured && notificationsModule.setNotificationHandler) {
      notificationsModule.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      notificationHandlerConfigured = true;
    }

    return notificationsModule;
  } catch (error) {
    console.warn('Notifications are unavailable in this build:', error);
    return null;
  }
}

export async function setupNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications?.setNotificationChannelAsync) {
    return;
  }

  await Notifications.setNotificationChannelAsync(TASK_REMINDER_CHANNEL_ID, {
    name: 'Lembretes de tarefas',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#6F5AE0',
  });
}

export async function getNotificationsEnabled() {
  const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
  return stored === 'enabled';
}

export async function saveNotificationsEnabled(enabled: boolean) {
  await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, enabled ? 'enabled' : 'disabled');
}

export async function requestNotificationPermission() {
  const Notifications = await getNotificationsModule();
  if (!Notifications?.getPermissionsAsync || !Notifications.requestPermissionsAsync) {
    return false;
  }

  await setupNotificationChannel();

  const currentPermissions = await Notifications.getPermissionsAsync();
  if (currentPermissions.granted) {
    return true;
  }

  const requestedPermissions = await Notifications.requestPermissionsAsync();
  return requestedPermissions.granted;
}

export async function cancelTaskReminder(notificationId?: string) {
  const Notifications = await getNotificationsModule();
  if (!notificationId || !Notifications?.cancelScheduledNotificationAsync) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function scheduleTaskReminder({
  taskId,
  taskName,
  taskDate,
}: TaskReminderData) {
  const Notifications = await getNotificationsModule();
  if (!Notifications?.scheduleNotificationAsync) {
    return undefined;
  }

  const triggerDate = getReminderDate(taskDate);
  if (!triggerDate || triggerDate.getTime() <= Date.now()) {
    return undefined;
  }

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    return undefined;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Lembrete de tarefa',
      body: `Hoje e o prazo de "${taskName}".`,
      data: {
        taskId,
        url: '/(tabs)/explore',
      },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      channelId: TASK_REMINDER_CHANNEL_ID,
    },
  });
}

function getReminderDate(taskDate: string) {
  const [year, month, day] = taskDate.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day, REMINDER_HOUR, REMINDER_MINUTE, 0);
}

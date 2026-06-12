import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

import type { TaskAttachment } from '@/contexts/TaskContext';

const ATTACHMENTS_DIR = `${FileSystem.documentDirectory ?? ''}task-attachments/`;

export async function pickTaskImages() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { granted: false, attachments: [] as TaskAttachment[] };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    quality: 0.8,
  });

  if (result.canceled) {
    return { granted: true, attachments: [] as TaskAttachment[] };
  }

  await ensureAttachmentsDirectory();

  const attachments = await Promise.all(result.assets.map(async asset => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const extension = getFileExtension(asset.uri);
    const name = asset.fileName ?? `anexo-${id}.${extension}`;
    const destination = `${ATTACHMENTS_DIR}${id}.${extension}`;

    await FileSystem.copyAsync({
      from: asset.uri,
      to: destination,
    });

    return {
      id,
      uri: destination,
      name,
      type: 'image' as const,
    };
  }));

  return { granted: true, attachments };
}

export async function deleteTaskAttachment(attachment: TaskAttachment) {
  try {
    const info = await FileSystem.getInfoAsync(attachment.uri);
    if (info.exists) {
      await FileSystem.deleteAsync(attachment.uri, { idempotent: true });
    }
  } catch (error) {
    console.warn('Could not delete task attachment:', error);
  }
}

async function ensureAttachmentsDirectory() {
  if (!FileSystem.documentDirectory) {
    throw new Error('Document directory is unavailable.');
  }

  const info = await FileSystem.getInfoAsync(ATTACHMENTS_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(ATTACHMENTS_DIR, { intermediates: true });
  }
}

function getFileExtension(uri: string) {
  const cleanUri = uri.split('?')[0];
  const extension = cleanUri.split('.').pop()?.toLowerCase();
  return extension && extension.length <= 5 ? extension : 'jpg';
}

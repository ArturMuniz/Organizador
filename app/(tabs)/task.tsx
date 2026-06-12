import { HybridDatePicker } from '@/components/HybridDatePicker';
import { Task, TaskAttachment, useTasks } from '@/contexts/TaskContext';
import { deleteTaskAttachment, pickTaskImages } from '@/src/services/attachmentService';
import { Feather, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 400;
const isLargeScreen = width > 900;

export default function NewTaskScreen() {
  const router = useRouter();
  const { addTask, updateTask, removeTask, tasks } = useTasks();
  const params = useLocalSearchParams();
  const [taskName, setTaskName] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('users');
  const [isEditing, setIsEditing] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [selectedAttachment, setSelectedAttachment] = useState<TaskAttachment | null>(null);

  useEffect(() => {
    if (params.taskId) {
      const task = tasks.find(t => t.id === params.taskId);
      if (task) {
        setTaskName(task.name);
        setTaskDate(task.date);
        setSelectedDate(new Date(task.date));
        setSelectedCategory(task.category);
        setAttachments(task.attachments ?? []);
        setIsEditing(true);
        setEditingTask(task);
      }
    }
  }, [params.taskId, tasks]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    const isoDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
    setTaskDate(isoDate);
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir Tarefa',
      'Tem certeza que deseja excluir esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            if (editingTask) {
              await removeTask(editingTask.id);
              Alert.alert('Sucesso', 'Tarefa excluída com sucesso!', [
                { text: 'OK', onPress: () => router.push('/(tabs)/explore') }
              ]);
            }
          }
        }
      ]
    );
  };

  const handleAddAttachments = async () => {
    try {
      const result = await pickTaskImages();
      if (!result.granted) {
        Alert.alert('Permissão necessária', 'Permita o acesso às imagens para anexar arquivos às tarefas.');
        return;
      }

      if (result.attachments.length > 0) {
        setAttachments(current => [...current, ...result.attachments]);
      }
    } catch (error) {
      console.error('Error picking task images:', error);
      Alert.alert('Erro', 'Não foi possível anexar a imagem.');
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    const attachment = attachments.find(item => item.id === attachmentId);
    setAttachments(current => current.filter(item => item.id !== attachmentId));

    if (attachment) {
      void deleteTaskAttachment(attachment);
    }
  };

  const handleSave = async () => {
    if (!taskName.trim() || !taskDate.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o nome e a data da tarefa.');
      return;
    }

    if (isEditing && editingTask) {
      await updateTask(editingTask.id, {
        name: taskName.trim(),
        date: taskDate.trim(),
        category: selectedCategory,
        completed: editingTask.completed,
        attachments,
      });
      Alert.alert('Sucesso', 'Tarefa atualizada com sucesso!', [
        { text: 'OK', onPress: () => router.push('/(tabs)/explore') }
      ]);
    } else {
      await addTask({
        name: taskName.trim(),
        date: taskDate.trim(),
        category: selectedCategory,
        completed: false,
        attachments,
      });
      Alert.alert('Sucesso', 'Tarefa criada com sucesso!', [
        { text: 'OK', onPress: () => router.push('/(tabs)/explore') }
      ]);
    }
  };

  const categories = [
    { id: 'users', icon: 'users', family: Feather, color: '#00A8FF' },
    { id: 'dumbbell', icon: 'dumbbell', family: MaterialCommunityIcons, color: '#FF4DE4' },
    { id: 'heart', icon: 'heart', family: FontAwesome, color: '#00A8FF' },
    { id: 'briefcase', icon: 'briefcase', family: Feather, color: '#8453CC' },
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Feather name="chevron-left" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}
          </Text>
          {isEditing ? (
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={handleDelete}
            >
              <Feather name="trash-2" size={24} color="white" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 28 }} />
          )}
        </View>

        {/* Formulário num Card Arredondado */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>O que vamos fazer?</Text>
          
          {/* Input: Nome da Tarefa */}
          <View style={styles.inputContainer}>
            <Feather name="edit-2" size={20} color="#6D42A4" style={styles.inputIcon} />
            <TextInput 
              style={styles.input}
              placeholder="Nome da tarefa"
              placeholderTextColor="#C2AEE0"
              value={taskName}
              onChangeText={setTaskName}
            />
          </View>

          {/* Input: Data/Hora */}
          <HybridDatePicker
            value={selectedDate}
            onChange={handleDateChange}
            minimumDate={new Date()}
            placeholder="Selecione a data"
            mode="date"
          />

          {/* Seleção de Categoria */}
          <Text style={styles.categoryTitle}>Categoria</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity 
                key={cat.id} 
                style={[
                  styles.categoryIcon, 
                  selectedCategory === cat.id && styles.categoryIconSelected
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <cat.family 
                  name={cat.icon as any} 
                  size={24} 
                  color={selectedCategory === cat.id ? 'white' : cat.color} 
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.categoryTitle}>Anexos</Text>
          <TouchableOpacity style={styles.attachmentButton} activeOpacity={0.8} onPress={handleAddAttachments}>
            <Feather name="image" size={20} color="#6D42A4" />
            <Text style={styles.attachmentButtonText}>Adicionar imagens</Text>
          </TouchableOpacity>

          {attachments.length > 0 && (
            <View style={styles.attachmentsGrid}>
              {attachments.map(attachment => (
                <View key={attachment.id} style={styles.attachmentPreview}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.attachmentImageButton}
                    onPress={() => setSelectedAttachment(attachment)}
                  >
                    <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeAttachmentButton}
                    onPress={() => handleRemoveAttachment(attachment.id)}
                  >
                    <Feather name="x" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Botão de Salvar */}
          <TouchableOpacity style={styles.saveButtonWrapper} activeOpacity={0.8} onPress={handleSave}>
            <LinearGradient 
              colors={['#D1B5ED', '#C2A1E8']} 
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Salvar Alterações' : 'Criar Tarefa'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={!!selectedAttachment}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAttachment(null)}
      >
        <View style={styles.attachmentModalOverlay}>
          <TouchableOpacity
            style={styles.attachmentModalClose}
            onPress={() => setSelectedAttachment(null)}
          >
            <Feather name="x" size={24} color="white" />
          </TouchableOpacity>
          {selectedAttachment && (
            <>
              <Image source={{ uri: selectedAttachment.uri }} style={styles.attachmentModalImage} resizeMode="contain" />
              <Text style={styles.attachmentModalName}>{selectedAttachment.name}</Text>
            </>
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C2A1E8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isLargeScreen ? 40 : isSmallScreen ? 12 : 24,
    paddingTop: isLargeScreen ? 40 : 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: isSmallScreen ? 18 : 22,
    fontWeight: '900',
    color: 'white',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: isLargeScreen ? 40 : isSmallScreen ? 12 : 20,
    paddingBottom: 40,
    maxWidth: isLargeScreen ? 600 : undefined,
    alignSelf: isLargeScreen ? 'center' : undefined,
    width: isLargeScreen ? '100%' : undefined,
  },
  formCard: {
    backgroundColor: '#F4ECFC',
    borderRadius: 30,
    padding: isSmallScreen ? 16 : 24,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: isSmallScreen ? 16 : 20,
    fontWeight: '900',
    color: '#8453CC',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: isSmallScreen ? 14 : 16,
    color: '#6D42A4',
    fontWeight: '600',
  },
  inputText: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#6D42A4',
    fontWeight: '600',
  },
  categoryTitle: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: 'bold',
    color: '#6D42A4',
    marginTop: 10,
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 18,
    gap: isSmallScreen ? 8 : 12,
  },
  categoryIcon: {
    width: isSmallScreen ? 48 : 56,
    height: isSmallScreen ? 48 : 56,
    borderRadius: isSmallScreen ? 24 : 28,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIconSelected: {
    backgroundColor: '#9254DC',
  },
  attachmentButton: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  attachmentButtonText: {
    color: '#6D42A4',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '800',
  },
  attachmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  attachmentPreview: {
    width: isSmallScreen ? 74 : 88,
    height: isSmallScreen ? 74 : 88,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  attachmentImageButton: {
    width: '100%',
    height: '100%',
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
  },
  removeAttachmentButton: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  attachmentModalClose: {
    position: 'absolute',
    right: 20,
    top: 48,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  attachmentModalImage: {
    width: '100%',
    height: '78%',
  },
  attachmentModalName: {
    color: 'white',
    fontSize: isSmallScreen ? 13 : 15,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  saveButtonWrapper: {
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  saveButton: {
    paddingVertical: isSmallScreen ? 14 : 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '900',
    color: '#8453CC',
  },
});

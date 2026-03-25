import { useTasks } from '@/contexts/TaskContext';
import { Feather, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function NewTaskScreen() {
  const router = useRouter();
  const { addTask } = useTasks();
  const [taskName, setTaskName] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('users');

  const handleSave = async () => {
    if (!taskName.trim() || !taskDate.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o nome e a data da tarefa.');
      return;
    }

    await addTask({
      name: taskName.trim(),
      date: taskDate.trim(),
      category: selectedCategory,
      completed: false,
    });

    Alert.alert('Sucesso', 'Tarefa criada com sucesso!', [
      { text: 'OK', onPress: () => router.push('/(tabs)') }
    ]);
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Feather name="chevron-left" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Tarefa</Text>
        <View style={{ width: 28 }} /> {/* Espaçador para centralizar o título */}
      </View>

      {/* Formulário num Card Arredondado */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
          <View style={styles.inputContainer}>
            <Feather name="calendar" size={20} color="#6D42A4" style={styles.inputIcon} />
            <TextInput 
              style={styles.input}
              placeholder="Data (ex: 10 Julho)"
              placeholderTextColor="#C2AEE0"
              value={taskDate}
              onChangeText={setTaskDate}
            />
          </View>

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

          {/* Botão de Salvar */}
          <TouchableOpacity style={styles.saveButtonWrapper} activeOpacity={0.8} onPress={handleSave}>
            <LinearGradient 
              colors={['#D1B5ED', '#C2A1E8']} 
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>Criar Tarefa</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: 'white',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#F4ECFC',
    borderRadius: 30,
    padding: 24,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
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
    fontSize: 16,
    color: '#6D42A4',
    fontWeight: '600',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6D42A4',
    marginTop: 10,
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    backgroundColor: '#9254DC', // Roxo escuro quando selecionado
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
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#8453CC',
  },
});
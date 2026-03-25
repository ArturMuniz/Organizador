import { Task, useTasks } from '@/contexts/TaskContext';
import { Feather, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

// Mapeamento de categorias para ícones
const categoryIcons: Record<string, { icon: string; family: any; color: string }> = {
  users: { icon: 'users', family: Feather, color: '#00A8FF' },
  dumbbell: { icon: 'dumbbell', family: MaterialCommunityIcons, color: '#FF4DE4' },
  heart: { icon: 'heart', family: FontAwesome, color: '#00A8FF' },
  briefcase: { icon: 'briefcase', family: Feather, color: '#8453CC' },
};

// --- Componentes Reutilizáveis ---

const StatCard = ({ number, label }: { number: string; label: string }) => (
  <View style={styles.statCard}>
    <Text style={styles.statNumber}>{number}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const TaskCard = ({ task }: { task: Task }) => {
  const categoryInfo = categoryIcons[task.category] || categoryIcons.users;
  const IconFamily = categoryInfo.family;

  return (
    <TouchableOpacity style={styles.taskCard} activeOpacity={0.8}>
      <View style={styles.taskCardLeft}>
        <View style={styles.taskIconContainer}>
          <IconFamily name={categoryInfo.icon as any} size={24} color={categoryInfo.color} />
        </View>
        <View>
          <Text style={styles.taskTitle}>
            {task.name}
          </Text>
          <Text style={styles.taskSubtitle}>{task.date}</Text>
        </View>
      </View>
      <Feather name="chevron-right" size={24} color="#A98CCF" />
    </TouchableOpacity>
  );
};

const Separator = () => <View style={styles.separator} />;

// --- Tela Principal ---

export default function ExploreScreen() {
  const router = useRouter();
  const { tasks, loading } = useTasks();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'white', textAlign: 'center', marginTop: 100 }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarBorder}>
            {/* Usando uma imagem de avatar genérica para simular o design */}
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }} 
              style={styles.avatar} 
            />
          </View>
          <Text style={styles.greeting}>Olá de volta,{'\n'}Amanda</Text>
        </View>
        <TouchableOpacity style={styles.bellButton}>
          <FontAwesome name="bell" size={26} color="#8453CC" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      {/* Cards de Estatísticas */}
      <View style={styles.statsRow}>
        <StatCard number={tasks.length.toString()} label="Tarefas" />
        <StatCard number={tasks.filter(t => !t.completed).length.toString()} label="Pendentes" />
        <StatCard number={tasks.filter(t => t.completed).length.toString()} label="Concluídas" />
      </View>

      {/* Lista de Tarefas */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Próximas Tarefas</Text>
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {tasks.length === 0 ? (
            <Text style={{ color: '#A98CCF', textAlign: 'center', marginTop: 50 }}>
              Nenhuma tarefa ainda. Adicione uma nova tarefa!
            </Text>
          ) : (
            tasks.map((task, index) => (
              <React.Fragment key={task.id}>
                <TaskCard task={task} />
                {index < tasks.length - 1 && <Separator />}
              </React.Fragment>
            ))
          )}
        </ScrollView>
      </View>

      {/* Bottom Navigation Customizada */}
      <View style={styles.bottomNav}>
        <TouchableOpacity><Feather name="home" size={28} color="#00A8FF" /></TouchableOpacity>
        <TouchableOpacity><Feather name="check-square" size={28} color="#00A8FF" /></TouchableOpacity>
        
        {/* Botão FAB Central */}
        <View style={styles.fabWrapper}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/task')}>
            <LinearGradient 
              colors={['#69CCF0', '#979FE0', '#C96CD1']} 
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabOuter}
            >
              <View style={styles.fabInner}>
                <Feather name="plus" size={36} color="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity><Feather name="list" size={28} color="#00A8FF" /></TouchableOpacity>
        <TouchableOpacity><Feather name="user" size={28} color="#00A8FF" /></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C2A1E8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60, // Ajuste para SafeArea dependendo do dispositivo
    paddingBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBorder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FADDF3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginRight: 12,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  greeting: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 24,
  },
  bellButton: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    backgroundColor: '#FF6BE4',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#C2A1E8',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F4ECFC',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#6D42A4',
  },
  statLabel: {
    fontSize: 12,
    color: '#A98CCF',
    fontStyle: 'italic',
    fontWeight: '600',
    marginTop: 2,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#5B2D90',
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 100, // Espaço para não ficar atrás do menu inferior
  },
  taskCard: {
    backgroundColor: '#F8F4FD',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskIconContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6D42A4',
  },
  taskTitleBlue: {
    color: '#00A8FF',
    textDecorationLine: 'underline',
  },
  taskSubtitle: {
    fontSize: 12,
    color: '#A98CCF',
    fontWeight: '600',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: '60%',
    alignSelf: 'center',
    marginVertical: 12,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: width,
    backgroundColor: '#F4ECFC',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 16,
    paddingBottom: 30, // SafeArea bottom
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  fabWrapper: {
    position: 'relative',
    top: -30, // Faz o botão flutuar acima da barra
  },
  fabOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  fabInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
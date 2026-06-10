import { Task, useTasks } from '@/contexts/TaskContext';
import { Feather, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUser } from '../../src/hooks/useUser';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 400;
const isMediumScreen = width >= 400 && width < 900;
const isLargeScreen = width >= 900;

const categoryIcons: Record<string, { icon: string; family: any; color: string }> = {
  users: { icon: 'users', family: Feather, color: '#00A8FF' },
  dumbbell: { icon: 'dumbbell', family: MaterialCommunityIcons, color: '#FF4DE4' },
  heart: { icon: 'heart', family: FontAwesome, color: '#00A8FF' },
  briefcase: { icon: 'briefcase', family: Feather, color: '#8453CC' },
};

const StatCard = ({ number, label }: { number: string; label: string }) => (
  <View style={styles.statCard}>
    <Text style={styles.statNumber}>{number}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const Separator = () => <View style={styles.separator} />;

export default function ExploreScreen() {
  const router = useRouter();
  const { tasks, loading, toggleTaskCompleted } = useTasks();
  const { user } = useUser();

  const sortedTasks = useMemo(() => [...tasks].sort((a, b) => a.date.localeCompare(b.date)), [tasks]);
  const pendingTasks = useMemo(() => sortedTasks.filter(task => !task.completed), [sortedTasks]);
  const completedTasks = useMemo(() => sortedTasks.filter(task => task.completed), [sortedTasks]);

  const TaskCard = ({ task }: { task: Task }) => {
    const categoryInfo = categoryIcons[task.category] || categoryIcons.users;
    const IconFamily = categoryInfo.family;

    return (
      <View style={[styles.taskCard, task.completed && styles.taskCardCompleted]}>
        <TouchableOpacity
          style={styles.taskCardContent}
          activeOpacity={0.8}
          onPress={() => router.push({ pathname: '/task', params: { taskId: task.id } })}
        >
          <View style={styles.taskCardLeft}>
            <View style={styles.taskIconContainer}>
              <IconFamily name={categoryInfo.icon as any} size={24} color={categoryInfo.color} />
            </View>
            <View>
              <Text style={styles.taskTitle}>{task.name}</Text>
              <Text style={styles.taskSubtitle}>{task.date}</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={24} color="#A98CCF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.completeAction,
            task.completed ? styles.completeActionCompleted : styles.completeActionPending,
          ]}
          activeOpacity={0.8}
          onPress={() => void toggleTaskCompleted(task.id)}
        >
          <Feather name={task.completed ? 'rotate-ccw' : 'check'} size={16} color="white" />
          <Text style={styles.completeActionText}>
            {task.completed ? 'Reabrir' : 'Concluir'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando tarefas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarBorder}>
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.greeting}>Olá de volta,{'\n'}{user?.name || 'Usuário'}</Text>
        </View>
        <View style={styles.notificationWrapper}>
          <FontAwesome name="bell" size={26} color="#8453CC" />
          <View style={styles.notificationDot} />
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatCard number={tasks.length.toString()} label="Total" />
        <StatCard number={pendingTasks.length.toString()} label="Pendentes" />
        <StatCard number={completedTasks.length.toString()} label="Concluídas" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pendentes</Text>
            <Text style={styles.sectionSubtitle}>{pendingTasks.length} tarefa(s)</Text>
          </View>

          {pendingTasks.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma tarefa pendente no momento.</Text>
          ) : (
            pendingTasks.map(task => (
              <React.Fragment key={task.id}>
                <TaskCard task={task} />
                <Separator />
              </React.Fragment>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Concluídas</Text>
            <Text style={styles.sectionSubtitle}>{completedTasks.length} tarefa(s)</Text>
          </View>

          {completedTasks.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma tarefa concluída ainda.</Text>
          ) : (
            completedTasks.map(task => (
              <React.Fragment key={task.id}>
                <TaskCard task={task} />
                <Separator />
              </React.Fragment>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C2A1E8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C2A1E8',
  },
  loadingText: {
    color: 'white',
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isLargeScreen ? 40 : isSmallScreen ? 12 : 24,
    paddingTop: isLargeScreen ? 40 : 60,
    paddingBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBorder: {
    width: isSmallScreen ? 50 : 60,
    height: isSmallScreen ? 50 : 60,
    borderRadius: isSmallScreen ? 25 : 30,
    backgroundColor: '#FADDF3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginRight: isSmallScreen ? 8 : 12,
  },
  avatar: {
    width: isSmallScreen ? 44 : 54,
    height: isSmallScreen ? 44 : 54,
    borderRadius: isSmallScreen ? 22 : 27,
  },
  greeting: {
    color: 'white',
    fontSize: isSmallScreen ? 16 : 20,
    fontWeight: '900',
    lineHeight: isSmallScreen ? 20 : 24,
  },
  notificationWrapper: {
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
    paddingHorizontal: isLargeScreen ? 40 : isSmallScreen ? 12 : 24,
    marginBottom: 24,
    gap: isSmallScreen ? 8 : 12,
    maxWidth: isLargeScreen ? 900 : undefined,
    alignSelf: isLargeScreen ? 'center' : undefined,
    width: isLargeScreen ? '100%' : undefined,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F4ECFC',
    borderRadius: 24,
    paddingVertical: isSmallScreen ? 12 : 16,
    paddingHorizontal: isSmallScreen ? 8 : 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: '900',
    color: '#6D42A4',
  },
  statLabel: {
    fontSize: isSmallScreen ? 10 : 12,
    color: '#A98CCF',
    fontStyle: 'italic',
    fontWeight: '600',
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 40,
    maxWidth: isLargeScreen ? 900 : undefined,
    alignSelf: isLargeScreen ? 'center' : undefined,
    width: isLargeScreen ? '100%' : undefined,
  },
  section: {
    paddingHorizontal: isLargeScreen ? 40 : isSmallScreen ? 12 : 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: isSmallScreen ? 18 : 22,
    fontWeight: '900',
    color: '#5B2D90',
  },
  sectionSubtitle: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#7D6FA0',
  },
  emptyText: {
    color: '#A98CCF',
    textAlign: 'center',
    marginTop: 12,
    fontSize: isSmallScreen ? 14 : 16,
  },
  taskCard: {
    backgroundColor: '#F8F4FD',
    borderRadius: 24,
    padding: isSmallScreen ? 12 : 16,
    marginBottom: 14,
  },
  taskCardCompleted: {
    opacity: 0.8,
    backgroundColor: '#E9E6FF',
  },
  taskCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskIconContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: isSmallScreen ? 8 : 12,
  },
  taskTitle: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '800',
    color: '#472877',
  },
  taskSubtitle: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#7E6AAC',
    marginTop: 4,
  },
  completeAction: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallScreen ? 10 : 12,
    borderRadius: 20,
  },
  completeActionPending: {
    backgroundColor: '#6B46EE',
  },
  completeActionCompleted: {
    backgroundColor: '#3EA55B',
  },
  completeActionText: {
    color: 'white',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: isSmallScreen ? 12 : 14,
  },
  separator: {
    height: 12,
  },
});

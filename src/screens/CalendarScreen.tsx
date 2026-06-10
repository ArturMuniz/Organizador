import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CalendarView } from '../components/Calendar/CalendarView';
import { useTasks } from '../hooks/useTasks';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 400;
const isLargeScreen = width > 900;

export const CalendarScreen: React.FC = () => {
  const { tasks, getTasksByDate, loading } = useTasks();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando tarefas...</Text>
      </View>
    );
  }

  const selectedTasks = selectedDate ? getTasksByDate(selectedDate) : [];

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Calendário</Text>
      <CalendarView
        currentMonth={new Date()}
        tasks={tasks}
        onSelectDate={setSelectedDate}
      />

      <View style={styles.taskSection}>
        {selectedDate ? (
          <>
            <Text style={styles.taskTitle}>Tarefas de {selectedDate}</Text>
            {selectedTasks.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma tarefa registrada para este dia.</Text>
            ) : (
              <ScrollView contentContainerStyle={styles.taskList} showsVerticalScrollIndicator={false}>
                {selectedTasks.map(task => (
                  <View key={task.id} style={styles.taskCard}>
                    <Text style={styles.taskCardTitle}>{task.name}</Text>
                    <Text style={styles.taskCardDate}>{task.date}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </>
        ) : (
          <Text style={styles.emptyText}>Toque em um dia do calendário para ver as tarefas.</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
  },
  loadingText: {
    color: '#6F5AE0',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
  },
  screenTitle: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: '800',
    color: '#3D2C8D',
    marginTop: isLargeScreen ? 24 : 16,
    marginLeft: isLargeScreen ? 40 : isSmallScreen ? 12 : 24,
  },
  taskSection: {
    flex: 1,
    marginTop: isSmallScreen ? 12 : 16,
    paddingHorizontal: isLargeScreen ? 40 : isSmallScreen ? 12 : 24,
  },
  taskTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '700',
    color: '#422C99',
    marginBottom: 12,
  },
  taskList: {
    paddingBottom: 24,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: isSmallScreen ? 12 : 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(141, 96, 198, 0.14)',
  },
  taskCardTitle: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '700',
    color: '#2D1D83',
    marginBottom: 6,
  },
  taskCardDate: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#7D7A9A',
  },
  emptyText: {
    color: '#7D7A9A',
    fontSize: isSmallScreen ? 14 : 16,
    marginTop: 10,
  },
});

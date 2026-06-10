import { useTasks } from '@/contexts/TaskContext';
import React, { useMemo } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 400;
const isLargeScreen = width > 900;
const chartWidth = Math.min(width - 30, 600);

const categoryMap = {
  users: { label: 'Pessoal', color: '#4CAF50' },
  dumbbell: { label: 'Fitness', color: '#FFB300' },
  heart: { label: 'Saúde', color: '#F44336' },
  briefcase: { label: 'Trabalho', color: '#5E35B1' },
};

export default function DashboardScreen() {
  const { tasks, loading } = useTasks();

  const completedTasks = useMemo(() => tasks.filter(task => task.completed).length, [tasks]);
  const pendingTasks = useMemo(() => tasks.filter(task => !task.completed).length, [tasks]);
  const totalTasks = useMemo(() => tasks.length, [tasks]);

  const weeklyData = useMemo(() => {
    const today = new Date();
    const dates = Array.from({ length: 5 }, (_, index) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (4 - index));
      const label = day.toLocaleDateString('pt-BR', { weekday: 'short' });
      const dateKey = day.toISOString().split('T')[0];
      return { label, dateKey };
    });

    return dates.map(dateEntry => {
      const count = tasks.filter(task => task.date === dateEntry.dateKey).length;
      return { label: dateEntry.label, count };
    });
  }, [tasks]);

  const performanceData = {
    labels: weeklyData.map(item => item.label),
    datasets: [{ data: weeklyData.map(item => item.count) }],
  };

  const statusData = [
    {
      name: 'Concluídas',
      population: completedTasks,
      color: '#4CAF50',
      legendFontColor: '#333',
      legendFontSize: isSmallScreen ? 10 : 12,
    },
    {
      name: 'Pendentes',
      population: pendingTasks,
      color: '#F44336',
      legendFontColor: '#333',
      legendFontSize: isSmallScreen ? 10 : 12,
    },
  ];

  const categoryData = useMemo(() => 
    Object.entries(categoryMap).map(([key, value]) => ({
      name: value.label,
      population: tasks.filter(task => task.category === key).length,
      color: value.color,
      legendFontColor: '#333',
      legendFontSize: isSmallScreen ? 10 : 12,
    })),
    [tasks]
  );

  const productivityData = {
    labels: categoryData.map(item => item.name),
    datasets: [{ data: categoryData.map(item => item.population) }],
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Dashboard</Text>

      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tarefas</Text>
          <Text style={styles.cardValue}>{totalTasks}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Concluídas</Text>
          <Text style={styles.cardValue}>{completedTasks}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pendentes</Text>
          <Text style={styles.cardValue}>{pendingTasks}</Text>
        </View>
      </View>

      <Text style={styles.chartTitle}>Desempenho Semanal</Text>
      {Platform.OS !== 'web' ? (
        <LineChart
          data={performanceData}
          width={chartWidth}
          height={isSmallScreen ? 180 : 220}
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: () => '#333',
            style: { borderRadius: 16 },
          }}
          bezier
          style={styles.chart}
        />
      ) : (
        <View style={styles.webChartPlaceholder}>
          <Text>Gráfico não disponível em web</Text>
        </View>
      )}

      <Text style={styles.chartTitle}>Status das Tarefas</Text>
      {Platform.OS !== 'web' ? (
        <PieChart
          data={statusData}
          width={chartWidth}
          height={isSmallScreen ? 180 : 220}
          chartConfig={{ color: () => '#000' }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      ) : (
        <View style={styles.webChartPlaceholder}>
          <Text>Gráfico não disponível em web</Text>
        </View>
      )}

      <Text style={styles.chartTitle}>Categorias de Tarefas</Text>
      {Platform.OS !== 'web' ? (
        <BarChart
          data={productivityData}
          width={chartWidth}
          height={isSmallScreen ? 180 : 220}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            labelColor: () => '#333',
          }}
          style={styles.chart}
        />
      ) : (
        <View style={styles.webChartPlaceholder}>
          <Text>Gráfico não disponível em web</Text>
        </View>
      )}

      <Text style={styles.chartTitle}>Tarefas por Categoria</Text>
      {completedTasks === 0 ? (
        <Text style={styles.emptyText}>Nenhuma tarefa concluída ainda.</Text>
      ) : (
        categoryData
          .filter(item => item.population > 0)
          .map(item => (
            <View key={item.name} style={styles.timelineCard}>
              <Text style={styles.timelineLabel}>{item.name}</Text>
              <Text style={styles.timelineValue}>{item.population} tarefa(s)</Text>
            </View>
          ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: 40,
    maxWidth: isLargeScreen ? 900 : undefined,
    alignSelf: isLargeScreen ? 'center' : undefined,
    width: isLargeScreen ? '100%' : undefined,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    color: '#6D42A4',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
  },
  title: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: 'bold',
    marginBottom: 20,
    paddingHorizontal: isLargeScreen ? 40 : isSmallScreen ? 12 : 15,
    color: '#333',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: isLargeScreen ? 40 : isSmallScreen ? 12 : 15,
    gap: isSmallScreen ? 8 : 12,
  },
  card: {
    backgroundColor: '#fff',
    flex: 1,
    paddingVertical: isSmallScreen ? 14 : 18,
    paddingHorizontal: isSmallScreen ? 10 : 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardTitle: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#666',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: 'bold',
    color: '#2D1E74',
  },
  chartTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: 'bold',
    paddingHorizontal: isLargeScreen ? 40 : isSmallScreen ? 12 : 15,
    color: '#333',
  },
  chart: {
    borderRadius: 16,
    marginHorizontal: isLargeScreen ? 40 : isSmallScreen ? 12 : 15,
  },
  webChartPlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: isLargeScreen ? 40 : isSmallScreen ? 12 : 15,
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: isLargeScreen ? 40 : isSmallScreen ? 12 : 15,
    marginTop: 12,
    borderRadius: 16,
    padding: isSmallScreen ? 12 : 16,
    borderWidth: 1,
    borderColor: 'rgba(141, 96, 198, 0.14)',
  },
  timelineLabel: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '700',
    color: '#2D1D83',
  },
  timelineValue: {
    marginTop: 8,
    fontSize: isSmallScreen ? 12 : 14,
    color: '#7D7A9A',
  },
  emptyText: {
    marginHorizontal: isLargeScreen ? 40 : isSmallScreen ? 12 : 15,
    marginTop: 12,
    fontSize: isSmallScreen ? 14 : 16,
    color: '#7D7A9A',
  },
});

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { Task } from '@/contexts/TaskContext';

const categoryLabels: Record<string, string> = {
  users: 'Pessoal',
  dumbbell: 'Fitness',
  heart: 'Saude',
  briefcase: 'Trabalho',
};

export async function generatePerformanceReport(tasks: Task[]) {
  const html = buildPerformanceReportHtml(tasks);
  const file = await Print.printToFileAsync({
    html,
    base64: false,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Relatorio de desempenho',
      UTI: 'com.adobe.pdf',
    });
  }

  return file.uri;
}

function buildPerformanceReportHtml(tasks: Task[]) {
  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  const completionRate = tasks.length > 0
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;
  const generatedAt = new Date().toLocaleString('pt-BR');

  const completedRows = completedTasks
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(task => `
      <tr>
        <td>${escapeHtml(task.name)}</td>
        <td>${formatDate(task.date)}</td>
        <td>${escapeHtml(categoryLabels[task.category] ?? task.category)}</td>
        <td>${task.attachments?.length ?? 0}</td>
      </tr>
    `)
    .join('');

  const historyRows = [...tasks]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(task => `
      <tr>
        <td>${formatDate(task.date)}</td>
        <td>${escapeHtml(task.name)}</td>
        <td>${task.completed ? 'Concluida' : 'Pendente'}</td>
        <td>${escapeHtml(categoryLabels[task.category] ?? task.category)}</td>
      </tr>
    `)
    .join('');

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            color: #2B2164;
            font-family: Arial, sans-serif;
            padding: 28px;
          }
          h1 {
            color: #6F5AE0;
            font-size: 28px;
            margin-bottom: 4px;
          }
          h2 {
            color: #3D2C8D;
            font-size: 18px;
            margin-top: 28px;
          }
          .muted {
            color: #777;
            font-size: 12px;
          }
          .cards {
            display: flex;
            gap: 12px;
            margin-top: 22px;
          }
          .card {
            background: #F5F3FF;
            border: 1px solid #E5E0FF;
            border-radius: 12px;
            flex: 1;
            padding: 14px;
          }
          .label {
            color: #6F5AE0;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .value {
            font-size: 26px;
            font-weight: bold;
            margin-top: 8px;
          }
          table {
            border-collapse: collapse;
            margin-top: 10px;
            width: 100%;
          }
          th, td {
            border-bottom: 1px solid #E8E3F7;
            font-size: 12px;
            padding: 9px 8px;
            text-align: left;
          }
          th {
            background: #F5F3FF;
            color: #3D2C8D;
          }
          .empty {
            background: #F9F8FC;
            border-radius: 10px;
            color: #777;
            padding: 14px;
          }
        </style>
      </head>
      <body>
        <h1>Relatorio de desempenho</h1>
        <div class="muted">Gerado em ${generatedAt}</div>

        <div class="cards">
          <div class="card">
            <div class="label">Total</div>
            <div class="value">${tasks.length}</div>
          </div>
          <div class="card">
            <div class="label">Concluidas</div>
            <div class="value">${completedTasks.length}</div>
          </div>
          <div class="card">
            <div class="label">Pendentes</div>
            <div class="value">${pendingTasks.length}</div>
          </div>
          <div class="card">
            <div class="label">Conclusao</div>
            <div class="value">${completionRate}%</div>
          </div>
        </div>

        <h2>Tarefas concluidas</h2>
        ${completedTasks.length === 0 ? '<div class="empty">Nenhuma tarefa concluida.</div>' : `
          <table>
            <thead>
              <tr>
                <th>Tarefa</th>
                <th>Prazo</th>
                <th>Categoria</th>
                <th>Anexos</th>
              </tr>
            </thead>
            <tbody>${completedRows}</tbody>
          </table>
        `}

        <h2>Historico de atividades</h2>
        ${tasks.length === 0 ? '<div class="empty">Nenhuma atividade registrada.</div>' : `
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tarefa</th>
                <th>Status</th>
                <th>Categoria</th>
              </tr>
            </thead>
            <tbody>${historyRows}</tbody>
          </table>
        `}
      </body>
    </html>
  `;
}

function formatDate(date: string) {
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

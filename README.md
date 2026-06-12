# Organizador

Aplicativo Expo/React Native para cadastro, organizacao e acompanhamento de tarefas.

## Rodar o projeto

```bash
npm install
npx expo start
```

Para usar recursos nativos como notificacoes, anexos e relatorios em PDF, recrie a build nativa:

```bash
npx expo prebuild --clean
npx expo run:android
```

No iOS:

```bash
npx expo run:ios
```

## Notificacoes

As notificacoes de tarefas sao locais e agendadas para as 09:00 do dia do prazo da tarefa. No Android, o Expo Go nao oferece suporte completo ao modulo nativo de notificacoes em SDKs recentes, entao use uma development build.

## Anexos de tarefas

Na tela de criar/editar tarefa, use "Adicionar imagens" para anexar fotos. As imagens sao copiadas para o armazenamento do app e aparecem como miniaturas na lista e no formulario da tarefa. Toque em uma miniatura para visualizar a imagem em tamanho maior.

## Relatorios

No Dashboard, toque em "Gerar relatorio PDF" para criar um relatorio de desempenho com totais, tarefas concluidas e historico de atividades. O app gera o PDF com `expo-print` e abre o compartilhamento quando disponivel.

## Validacao

```bash
npm exec tsc -- --noEmit
npm run lint
```

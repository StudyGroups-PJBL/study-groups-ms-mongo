export const eventsDocsSpec = {
  service: 'study-groups-ms-mongo',
  title: 'Documentação de Eventos Assíncronos (RabbitMQ)',
  version: '1.0.0',
  description:
    'Contratos de mensageria assíncrona consumidos pelo microsserviço de Grupos de Estudo e Mural de Mensagens.',
  broker: {
    protocol: 'AMQP 0-9-1 (RabbitMQ)',
    exchange: {
      name: 'study_groups.events',
      type: 'topic',
      durable: true
    },
    queue: {
      name: 'ms_mongo.task_updates',
      durable: true,
      routingKey: 'task.status.changed'
    }
  },
  consumedEvents: [
    {
      eventType: 'task.status.changed',
      summary: 'Notificação de alteração de status de uma tarefa no quadro Kanban',
      description:
        'Quando uma tarefa muda de status no microsserviço de Kanban, este evento é consumido e gera automaticamente uma mensagem de sistema (SYSTEM_EVENT) com autor "Sistema Kanban" no mural do grupo de estudo correspondente.',
      schema: {
        eventId: 'string (UUID do evento)',
        eventType: 'string (task.status.changed)',
        occurredAt: 'string (Data ISO-8601)',
        payload: {
          taskId: 'string (Identificador da tarefa)',
          groupId: 'string (Identificador do grupo de estudo)',
          title: 'string (Título da tarefa)',
          oldStatus: 'string (Status anterior, ex: TODO, DOING)',
          newStatus: 'string (Novo status, ex: DOING, DONE)'
        }
      },
      example: {
        eventId: 'evt-9012-abcd-3456',
        eventType: 'task.status.changed',
        occurredAt: '2026-10-27T18:30:00.000Z',
        payload: {
          taskId: 'task-4501',
          groupId: 'b3b8c7c2-4f1a-4b9e-9c2a-1d3f5e7a9b0c',
          title: 'Implementar Consumidor RabbitMQ',
          oldStatus: 'DOING',
          newStatus: 'DONE'
        }
      },
      resultingSystemMessageExample: {
        groupId: 'b3b8c7c2-4f1a-4b9e-9c2a-1d3f5e7a9b0c',
        authorName: 'Sistema Kanban',
        type: 'SYSTEM_EVENT',
        content:
          'A tarefa "Implementar Consumidor RabbitMQ" teve seu status alterado de "DOING" para "DONE".'
      }
    }
  ]
};

export function renderEventsDocsHtml(): string {
  const examplePayload = JSON.stringify(eventsDocsSpec.consumedEvents[0].example, null, 2);
  const resultingMessage = JSON.stringify(
    eventsDocsSpec.consumedEvents[0].resultingSystemMessageExample,
    null,
    2
  );

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${eventsDocsSpec.title}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 32px 16px;
      line-height: 1.6;
    }
    .container {
      max-width: 920px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
    }
    h1 {
      margin-top: 0;
      color: #1e293b;
      font-size: 1.8rem;
    }
    h2 {
      color: #334155;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
      margin-top: 28px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      background-color: #dbeafe;
      color: #1d4ed8;
      margin-right: 8px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin: 16px 0;
    }
    .meta-card {
      background: #f1f5f9;
      padding: 12px 16px;
      border-radius: 8px;
    }
    .meta-card strong {
      display: block;
      font-size: 0.8rem;
      text-transform: uppercase;
      color: #475569;
    }
    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 0.9rem;
    }
    a {
      color: #2563eb;
      text-decoration: none;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge">AMQP 0-9-1 / RabbitMQ</span>
    <span class="badge">Consumidor EDA</span>
    <h1>${eventsDocsSpec.title}</h1>
    <p>${eventsDocsSpec.description}</p>
    <p><a href="/events-docs.json">Ver especificação bruta em JSON (/events-docs.json)</a> | <a href="/api-docs">Ver Swagger REST (/api-docs)</a></p>

    <h2>Configuração de Topologia RabbitMQ</h2>
    <div class="meta-grid">
      <div class="meta-card">
        <strong>Exchange</strong>
        <span>${eventsDocsSpec.broker.exchange.name} (${eventsDocsSpec.broker.exchange.type}, durável)</span>
      </div>
      <div class="meta-card">
        <strong>Fila Consumida</strong>
        <span>${eventsDocsSpec.broker.queue.name} (durável)</span>
      </div>
      <div class="meta-card">
        <strong>Routing Key</strong>
        <span>${eventsDocsSpec.broker.queue.routingKey}</span>
      </div>
    </div>

    <h2>Evento Consumido: ${eventsDocsSpec.consumedEvents[0].eventType}</h2>
    <p>${eventsDocsSpec.consumedEvents[0].description}</p>

    <h3>Exemplo de Payload Recebido da Fila</h3>
    <pre>${examplePayload}</pre>

    <h3>Mensagem Automática Gerada no Mural (MongoDB)</h3>
    <pre>${resultingMessage}</pre>
  </div>
</body>
</html>`;
}

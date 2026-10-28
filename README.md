# study-groups-ms-mongo — Microsserviço de Grupos de Estudo e Mural de Mensagens

Microsserviço responsável pelo domínio de **Grupos de Estudo** e **Mural de Mensagens**, desenvolvido com **Node.js 20**, **TypeScript**, **Express**, **MongoDB (Mongoose)** e **RabbitMQ (AMQPLib)** seguindo **Clean Architecture**, **Vertical Slice Architecture** e **Event-Driven Architecture (EDA)**.

---

## Arquitetura do Projeto

O projeto organiza suas responsabilidades em camadas concêntricas de **Clean Architecture** combinadas com **Vertical Slices** na camada de aplicação:

```text
src/
├── domain/
│   ├── entities/
│   │   ├── StudyGroup.ts
│   │   └── GroupMessage.ts
│   └── repositories/
│       ├── IStudyGroupRepository.ts
│       └── IGroupMessageRepository.ts
├── application/
│   └── features/
│       ├── groups/
│       │   ├── create-group/
│       │   ├── list-groups/
│       │   ├── get-group-by-id/
│       │   ├── update-group/
│       │   └── delete-group/
│       └── messages/
│           ├── create-message/
│           ├── list-group-messages/
│           └── handle-task-event/
├── infrastructure/
│   ├── database/
│   │   └── mongodb.ts
│   ├── persistence/
│   │   ├── StudyGroupModel.ts
│   │   ├── GroupMessageModel.ts
│   │   ├── MongoStudyGroupRepository.ts
│   │   └── MongoGroupMessageRepository.ts
│   └── messaging/
│       └── RabbitMqConsumer.ts
└── api/
    ├── docs/
    │   ├── openapiSpec.ts
    │   └── eventsDocs.ts
    ├── middlewares/
    │   └── errorHandler.ts
    ├── routes/
    │   ├── groupRoutes.ts
    │   └── messageRoutes.ts
    ├── app.ts
    └── server.ts
```

### Integração Orientada a Eventos (RabbitMQ)
- **Exchange**: `study_groups.events` (`topic`, `durable: true`)
- **Fila**: `ms_mongo.task_updates` (`durable: true`)
- **Routing Key**: `task.status.changed`
- **Comportamento**: Quando uma tarefa tem seu status alterado no microsserviço de Kanban, o consumidor `RabbitMqConsumer` processa o evento `TaskStatusChangedEvent` através do `HandleTaskEventHandler` e publica automaticamente uma mensagem de sistema (`type: 'SYSTEM_EVENT'`, `authorName: 'Sistema Kanban'`) no mural do grupo de estudo correspondente.

---

## Tecnologias Utilizadas

- **Runtime**: Node.js 20+
- **Linguagem**: TypeScript 5
- **Servidor HTTP**: Express 4 + CORS
- **Banco de Dados**: MongoDB + Mongoose 8
- **Mensageria Assíncrona**: RabbitMQ + AMQPLib
- **Validação de Dados**: Zod
- **Documentação**: Swagger UI Express (OpenAPI 3.0) + Documentação HTML/JSON de Eventos
- **Testes Automatizados**: Vitest (Testes Unitários) + TsArch (Testes de Arquitetura Limpa)
- **Containerização**: Docker Multi-Stage (`node:20-alpine` com execução não-root)

---

## Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` na raiz do projeto e configure as credenciais:

```env
PORT=3001
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/studygroups_db?retryWrites=true&w=majority
RABBITMQ_URL=amqps://usuario:senha@host.rmq.cloudamqp.com/vhost
```

| Variável | Descrição | Exemplo / Padrão |
| :--- | :--- | :--- |
| `PORT` | Porta HTTP onde o servidor Express será iniciado | `3001` |
| `MONGODB_URI` | String de conexão do banco de dados MongoDB | `mongodb+srv://...` |
| `RABBITMQ_URL` | URL de conexão AMQP/AMQPS com o broker RabbitMQ | `amqps://...` |

---

## Como Executar Localmente

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure o arquivo `.env` a partir de `.env.example`.

3. Inicie em modo de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Para compilar e executar a versão de produção:
   ```bash
   npm run build
   npm start
   ```

---

## Como Executar com Docker

1. Construa a imagem Docker multi-stage:
   ```bash
   docker build -t study-groups-ms-mongo .
   ```

2. Execute o container passando o arquivo `.env`:
   ```bash
   docker run -d --name study-groups-ms-mongo -p 3001:3001 --env-file .env study-groups-ms-mongo
   ```

---

## Endpoints e Documentação

- **Health Check**: `GET /health`
- **Swagger UI (OpenAPI 3.0)**: `GET /api-docs` e `GET /api-docs.json`
- **Documentação de Eventos Assíncronos**: `GET /events-docs` e `GET /events-docs.json`
- **Grupos de Estudo**:
  - `POST /api/groups`
  - `GET /api/groups`
  - `GET /api/groups/:id`
  - `PUT /api/groups/:id`
  - `DELETE /api/groups/:id`
- **Mural de Mensagens**:
  - `POST /api/groups/:groupId/messages`
  - `GET /api/groups/:groupId/messages`
  - `GET /api/messages`

---

## Testes Automatizados

O projeto possui suíte de testes unitários (domínio, aplicação e eventos) e testes de regras de arquitetura com `tsarch`:

```bash
npm test
npm run test:unit
npm run test:arch
```

---

## Autores

- **Giuseppe Nunes**
- **João Gabriel Cintra**
- **Lara Bredow**
- **Viktor Trawinski**

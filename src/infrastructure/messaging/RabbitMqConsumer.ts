import amqplib, { Channel, ConsumeMessage } from 'amqplib';
import { HandleTaskEventHandler } from '../../application/features/messages/handle-task-event/HandleTaskEventHandler';

export class RabbitMqConsumer {
  public static readonly EXCHANGE_NAME = 'study_groups.events';
  public static readonly QUEUE_NAME = 'ms_mongo.task_updates';
  public static readonly ROUTING_KEY = 'task.status.changed';

  private connection: Awaited<ReturnType<typeof amqplib.connect>> | null = null;
  private channel: Channel | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isStopped = false;

  constructor(
    private readonly handleTaskEventHandler: HandleTaskEventHandler,
    private readonly rabbitMqUrl: string = process.env.RABBITMQ_URL || '',
    private readonly reconnectDelayMs: number = 5000
  ) {}

  public async start(): Promise<void> {
    this.isStopped = false;

    if (!this.rabbitMqUrl) {
      console.log(
        'Variável RABBITMQ_URL não configurada. Consumidor RabbitMQ em modo de espera.'
      );
      return;
    }

    try {
      console.log('Iniciando conexão com o broker RabbitMQ...');
      const conn = await amqplib.connect(this.rabbitMqUrl);
      this.connection = conn;

      conn.on('error', (err: Error) => {
        console.error('Erro na conexão com o RabbitMQ:', err.message);
      });

      conn.on('close', () => {
        if (!this.isStopped) {
          console.log('Conexão com o RabbitMQ encerrada. Agendando reconexão automática...');
          this.scheduleReconnect();
        }
      });

      const ch = await conn.createChannel();
      this.channel = ch;

      await ch.assertExchange(RabbitMqConsumer.EXCHANGE_NAME, 'topic', { durable: true });
      await ch.assertQueue(RabbitMqConsumer.QUEUE_NAME, { durable: true });
      await ch.bindQueue(
        RabbitMqConsumer.QUEUE_NAME,
        RabbitMqConsumer.EXCHANGE_NAME,
        RabbitMqConsumer.ROUTING_KEY
      );

      console.log(
        `Consumidor RabbitMQ inscrito na fila "${RabbitMqConsumer.QUEUE_NAME}" com a chave "${RabbitMqConsumer.ROUTING_KEY}".`
      );

      await ch.consume(RabbitMqConsumer.QUEUE_NAME, async (msg: ConsumeMessage | null) => {
        if (!msg) {
          return;
        }

        try {
          const rawContent = msg.content.toString('utf-8');
          const parsedEvent = JSON.parse(rawContent);
          const createdMessage = await this.handleTaskEventHandler.execute(parsedEvent);
          console.log(
            `Evento de tarefa processado e registrado no mural do grupo "${createdMessage.groupId}".`
          );
          ch.ack(msg);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          console.error('Falha ao processar mensagem da fila RabbitMQ:', errorMessage);
          ch.nack(msg, false, false);
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(
        'Não foi possível conectar ao RabbitMQ. O servidor HTTP permanece ativo. Motivo:',
        errorMessage
      );
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.isStopped || this.reconnectTimer) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.start().catch((err: Error) => {
        console.error('Erro inesperado na tentativa de reconexão ao RabbitMQ:', err.message);
      });
    }, this.reconnectDelayMs);
  }

  public async stop(): Promise<void> {
    this.isStopped = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      console.log('Consumidor RabbitMQ encerrado com sucesso.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao encerrar consumidor RabbitMQ:', errorMessage);
    }
  }
}

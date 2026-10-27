export const openapiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API de Grupos de Estudo e Mural de Mensagens (study-groups-ms-mongo)',
    version: '1.0.0',
    description:
      'Microsserviço REST e orientado a eventos para gerenciamento de Grupos de Estudo e Mural de Mensagens com Clean Architecture, Vertical Slice e MongoDB.'
  },
  servers: [
    {
      url: '/',
      description: 'Servidor Local do Microsserviço'
    }
  ],
  tags: [
    { name: 'Saúde', description: 'Verificação de integridade e disponibilidade do serviço' },
    { name: 'GruposDeEstudo', description: 'Gerenciamento completo de grupos de estudo' },
    { name: 'MuralDeMensagens', description: 'Publicação e consulta de mensagens no mural dos grupos' },
    { name: 'EventosAssíncronos', description: 'Documentação dos contratos de eventos RabbitMQ' }
  ],
  components: {
    schemas: {
      StudyGroup: {
        type: 'object',
        description: 'Representação de um Grupo de Estudo',
        properties: {
          id: {
            type: 'string',
            description: 'Identificador único do grupo de estudo',
            example: 'b3b8c7c2-4f1a-4b9e-9c2a-1d3f5e7a9b0c'
          },
          name: {
            type: 'string',
            description: 'Nome do grupo de estudo',
            example: 'Grupo de Estudos de Arquitetura Limpa'
          },
          subject: {
            type: 'string',
            description: 'Assunto ou disciplina principal do grupo',
            example: 'Arquitetura de Software'
          },
          description: {
            type: 'string',
            description: 'Descrição detalhada dos objetivos do grupo',
            example: 'Encontros semanais para discussão prática de DDD, TDD e Clean Architecture.'
          },
          membersCount: {
            type: 'integer',
            description: 'Quantidade atual de membros participantes no grupo',
            example: 5
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Data e hora de criação do grupo'
          }
        }
      },
      CreateStudyGroupRequest: {
        type: 'object',
        required: ['name', 'subject'],
        properties: {
          name: {
            type: 'string',
            minLength: 3,
            description: 'Nome do grupo de estudo (mínimo de 3 caracteres)',
            example: 'Grupo de Estudos de Arquitetura Limpa'
          },
          subject: {
            type: 'string',
            description: 'Assunto obrigatório do grupo de estudo',
            example: 'Arquitetura de Software'
          },
          description: {
            type: 'string',
            description: 'Descrição complementar do grupo de estudo',
            example: 'Encontros semanais para discussão prática de DDD, TDD e Clean Architecture.'
          },
          membersCount: {
            type: 'integer',
            minimum: 1,
            description: 'Quantidade inicial de membros (mínimo 1)',
            example: 1
          }
        }
      },
      UpdateStudyGroupRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 3,
            description: 'Novo nome do grupo de estudo',
            example: 'Grupo Avançado de Arquitetura Limpa e EDA'
          },
          subject: {
            type: 'string',
            description: 'Novo assunto do grupo de estudo',
            example: 'Engenharia de Software'
          },
          description: {
            type: 'string',
            description: 'Nova descrição do grupo de estudo',
            example: 'Discussões focadas em microsserviços orientados a eventos com RabbitMQ.'
          },
          membersCount: {
            type: 'integer',
            minimum: 1,
            description: 'Quantidade atualizada de membros',
            example: 4
          }
        }
      },
      GroupMessage: {
        type: 'object',
        description: 'Mensagem publicada no mural de um grupo de estudo',
        properties: {
          id: {
            type: 'string',
            description: 'Identificador único da mensagem',
            example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
          },
          groupId: {
            type: 'string',
            description: 'Identificador do grupo de estudo ao qual a mensagem pertence',
            example: 'b3b8c7c2-4f1a-4b9e-9c2a-1d3f5e7a9b0c'
          },
          authorName: {
            type: 'string',
            description: 'Nome do autor da mensagem ou identificador do sistema',
            example: 'Lara Bredow'
          },
          content: {
            type: 'string',
            description: 'Conteúdo textual da mensagem no mural',
            example: 'Pessoal, revisei os exercícios sobre entidades e invariantes de domínio!'
          },
          type: {
            type: 'string',
            enum: ['USER', 'SYSTEM_EVENT'],
            description: 'Tipo da mensagem (enviada por usuário ou evento automático do sistema)',
            example: 'USER'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Data e hora de publicação da mensagem'
          }
        }
      },
      CreateGroupMessageRequest: {
        type: 'object',
        required: ['authorName', 'content'],
        properties: {
          authorName: {
            type: 'string',
            description: 'Nome do estudante autor da mensagem',
            example: 'Lara Bredow'
          },
          content: {
            type: 'string',
            description: 'Conteúdo da mensagem a ser publicada no mural',
            example: 'Pessoal, revisei os exercícios sobre entidades e invariantes de domínio!'
          },
          type: {
            type: 'string',
            enum: ['USER', 'SYSTEM_EVENT'],
            default: 'USER',
            description: 'Tipo da mensagem publicada'
          }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        tags: ['Saúde'],
        summary: 'Verifica o estado de saúde do microsserviço',
        description: 'Retorna o status operacional do servidor e o horário atual.',
        responses: {
          '200': {
            description: 'Serviço operando normalmente'
          }
        }
      }
    },
    '/api/groups': {
      post: {
        tags: ['GruposDeEstudo'],
        summary: 'Cria um novo grupo de estudo',
        description: 'Valida os dados enviados e cadastra um novo grupo de estudo no MongoDB.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateStudyGroupRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Grupo de estudo criado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StudyGroup' }
              }
            }
          },
          '400': { description: 'Erro de validação nos dados informados' }
        }
      },
      get: {
        tags: ['GruposDeEstudo'],
        summary: 'Lista os grupos de estudo cadastrados',
        description: 'Retorna todos os grupos de estudo, permitindo filtragem opcional por assunto.',
        parameters: [
          {
            name: 'subject',
            in: 'query',
            required: false,
            description: 'Filtro opcional pelo assunto do grupo de estudo',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Lista de grupos de estudo retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/StudyGroup' }
                }
              }
            }
          }
        }
      }
    },
    '/api/groups/{id}': {
      get: {
        tags: ['GruposDeEstudo'],
        summary: 'Busca um grupo de estudo pelo identificador',
        description: 'Retorna os detalhes de um grupo de estudo específico a partir do seu ID.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Identificador único do grupo de estudo',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Grupo de estudo encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StudyGroup' }
              }
            }
          },
          '404': { description: 'Grupo de estudo não encontrado' }
        }
      },
      put: {
        tags: ['GruposDeEstudo'],
        summary: 'Atualiza os dados de um grupo de estudo',
        description: 'Atualiza nome, assunto, descrição ou quantidade de membros de um grupo existente.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Identificador único do grupo de estudo',
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateStudyGroupRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Grupo de estudo atualizado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StudyGroup' }
              }
            }
          },
          '400': { description: 'Erro de validação nos dados enviados' },
          '404': { description: 'Grupo de estudo não encontrado' }
        }
      },
      delete: {
        tags: ['GruposDeEstudo'],
        summary: 'Remove um grupo de estudo pelo identificador',
        description: 'Exclui o grupo de estudo e remove as mensagens vinculadas ao seu mural.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Identificador único do grupo de estudo',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '204': { description: 'Grupo de estudo removido com sucesso' },
          '404': { description: 'Grupo de estudo não encontrado' }
        }
      }
    },
    '/api/groups/{groupId}/messages': {
      post: {
        tags: ['MuralDeMensagens'],
        summary: 'Publica uma nova mensagem no mural de um grupo',
        description: 'Valida a existência do grupo de estudo e registra uma nova mensagem no mural.',
        parameters: [
          {
            name: 'groupId',
            in: 'path',
            required: true,
            description: 'Identificador do grupo de estudo destinatário',
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateGroupMessageRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Mensagem criada com sucesso no mural',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GroupMessage' }
              }
            }
          },
          '400': { description: 'Erro de validação nos dados da mensagem' },
          '404': { description: 'Grupo de estudo não encontrado' }
        }
      },
      get: {
        tags: ['MuralDeMensagens'],
        summary: 'Lista todas as mensagens do mural de um grupo específico',
        description: 'Retorna o histórico de mensagens de usuários e eventos do sistema de um grupo.',
        parameters: [
          {
            name: 'groupId',
            in: 'path',
            required: true,
            description: 'Identificador do grupo de estudo',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Lista de mensagens do grupo retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/GroupMessage' }
                }
              }
            }
          }
        }
      }
    },
    '/api/messages': {
      get: {
        tags: ['MuralDeMensagens'],
        summary: 'Lista as últimas mensagens gerais de todos os murais',
        description: 'Permite consultar as mensagens mais recentes ou filtrar opcionalmente por grupo.',
        parameters: [
          {
            name: 'groupId',
            in: 'query',
            required: false,
            description: 'Filtro opcional por identificador do grupo de estudo',
            schema: { type: 'string' }
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Quantidade máxima de mensagens retornadas (padrão 50)',
            schema: { type: 'integer', default: 50 }
          }
        ],
        responses: {
          '200': {
            description: 'Lista das últimas mensagens retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/GroupMessage' }
                }
              }
            }
          }
        }
      }
    }
  }
};

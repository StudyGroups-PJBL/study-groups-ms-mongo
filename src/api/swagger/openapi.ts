export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Study Groups & Message Board Microservice API',
    version: '1.0.0',
    description:
      'REST API for managing Study Groups and Group Message Boards using Clean Architecture, Vertical Slice and MongoDB.'
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Local Development Server'
    }
  ],
  tags: [
    { name: 'Health', description: 'Service health check' },
    { name: 'StudyGroups', description: 'Study Groups management' },
    { name: 'GroupMessages', description: 'Group Message Board operations' }
  ],
  components: {
    schemas: {
      StudyGroup: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'b3b8c7c2-4f1a-4b9e-9c2a-1d3f5e7a9b0c' },
          name: { type: 'string', example: 'Clean Architecture Study Group' },
          subject: { type: 'string', example: 'Software Architecture' },
          description: { type: 'string', example: 'Weekly discussions on DDD and Clean Architecture' },
          membersCount: { type: 'integer', example: 5 },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      CreateStudyGroupRequest: {
        type: 'object',
        required: ['name', 'subject'],
        properties: {
          name: { type: 'string', minLength: 3, example: 'Clean Architecture Study Group' },
          subject: { type: 'string', example: 'Software Architecture' },
          description: { type: 'string', example: 'Weekly discussions on DDD and Clean Architecture' },
          membersCount: { type: 'integer', minimum: 1, example: 1 }
        }
      },
      UpdateStudyGroupRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 3, example: 'Advanced Clean Architecture' },
          subject: { type: 'string', example: 'Software Engineering' },
          description: { type: 'string', example: 'Updated group description' },
          membersCount: { type: 'integer', minimum: 1, example: 3 }
        }
      },
      GroupMessage: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
          groupId: { type: 'string', example: 'b3b8c7c2-4f1a-4b9e-9c2a-1d3f5e7a9b0c' },
          authorName: { type: 'string', example: 'Lara Bredow' },
          content: { type: 'string', example: 'Welcome to the study group!' },
          type: { type: 'string', enum: ['USER', 'SYSTEM_EVENT'], example: 'USER' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      CreateGroupMessageRequest: {
        type: 'object',
        required: ['authorName', 'content'],
        properties: {
          authorName: { type: 'string', example: 'Lara Bredow' },
          content: { type: 'string', example: 'Welcome to the study group!' },
          type: { type: 'string', enum: ['USER', 'SYSTEM_EVENT'], default: 'USER' }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check endpoint',
        responses: {
          '200': {
            description: 'Service is healthy'
          }
        }
      }
    },
    '/api/groups': {
      post: {
        tags: ['StudyGroups'],
        summary: 'Create a new study group',
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
            description: 'Study group created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StudyGroup' }
              }
            }
          },
          '400': { description: 'Validation error' }
        }
      },
      get: {
        tags: ['StudyGroups'],
        summary: 'List all study groups',
        parameters: [
          {
            name: 'subject',
            in: 'query',
            required: false,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'List of study groups',
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
        tags: ['StudyGroups'],
        summary: 'Get a study group by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Study group found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StudyGroup' }
              }
            }
          },
          '404': { description: 'Study group not found' }
        }
      },
      put: {
        tags: ['StudyGroups'],
        summary: 'Update a study group by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
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
            description: 'Study group updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StudyGroup' }
              }
            }
          },
          '400': { description: 'Validation error' },
          '404': { description: 'Study group not found' }
        }
      },
      delete: {
        tags: ['StudyGroups'],
        summary: 'Delete a study group by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '204': { description: 'Study group deleted' },
          '404': { description: 'Study group not found' }
        }
      }
    },
    '/api/groups/{groupId}/messages': {
      post: {
        tags: ['GroupMessages'],
        summary: 'Post a new message to a study group board',
        parameters: [
          {
            name: 'groupId',
            in: 'path',
            required: true,
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
            description: 'Message created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GroupMessage' }
              }
            }
          },
          '400': { description: 'Validation error' },
          '404': { description: 'Study group not found' }
        }
      },
      get: {
        tags: ['GroupMessages'],
        summary: 'List all messages for a specific study group',
        parameters: [
          {
            name: 'groupId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'List of group messages',
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
        tags: ['GroupMessages'],
        summary: 'List latest messages across all study groups',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 50 }
          }
        ],
        responses: {
          '200': {
            description: 'List of latest messages',
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

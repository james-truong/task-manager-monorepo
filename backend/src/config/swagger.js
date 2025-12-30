module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Task Manager API',
    version: '1.0.0',
    description: 'A RESTful API for task management with user authentication',
    contact: {
      name: 'API Support',
      url: 'https://github.com/james-truong/task-manager-monorepo'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token from login/signup response'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'User ID'
          },
          name: {
            type: 'string',
            description: 'User name'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email'
          },
          avatar: {
            type: 'string',
            description: 'Avatar filename',
            nullable: true
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation timestamp'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp'
          }
        }
      },
      Task: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Task ID'
          },
          description: {
            type: 'string',
            description: 'Task description'
          },
          completed: {
            type: 'boolean',
            description: 'Task completion status'
          },
          dueDate: {
            type: 'string',
            format: 'date-time',
            description: 'Task due date',
            nullable: true
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: 'Task priority level'
          },
          owner: {
            type: 'string',
            description: 'User ID of task owner'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Task creation timestamp'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message'
          }
        }
      },
      UserSignup: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: {
            type: 'string',
            description: 'User name',
            example: 'John Doe'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email (must contain @)',
            example: 'john@example.com'
          },
          password: {
            type: 'string',
            format: 'password',
            description: 'User password (minimum 6 characters)',
            minLength: 6,
            example: 'password123'
          }
        }
      },
      UserLogin: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email',
            example: 'john@example.com'
          },
          password: {
            type: 'string',
            format: 'password',
            description: 'User password',
            example: 'password123'
          }
        }
      },
      TaskInput: {
        type: 'object',
        required: ['description'],
        properties: {
          description: {
            type: 'string',
            description: 'Task description',
            example: 'Complete project documentation'
          },
          completed: {
            type: 'boolean',
            description: 'Task completion status',
            default: false,
            example: false
          },
          dueDate: {
            type: 'string',
            format: 'date-time',
            description: 'Task due date',
            example: '2025-12-31T23:59:59Z'
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: 'Task priority level',
            default: 'medium',
            example: 'high'
          }
        }
      }
    }
  },
  paths: {
    '/': {
      get: {
        summary: 'API information',
        description: 'Get API version and available endpoints',
        tags: ['Info'],
        responses: {
          '200': {
            description: 'API information',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string'
                    },
                    version: {
                      type: 'string'
                    },
                    endpoints: {
                      type: 'object'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/users/signup': {
      post: {
        summary: 'Create a new user account',
        description: 'Register a new user with name, email, and password',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserSignup'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      $ref: '#/components/schemas/User'
                    },
                    token: {
                      type: 'string',
                      description: 'JWT authentication token'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                examples: {
                  duplicateEmail: {
                    value: {
                      error: 'Email already exists'
                    }
                  },
                  invalidEmail: {
                    value: {
                      error: 'Email must contain @'
                    }
                  },
                  shortPassword: {
                    value: {
                      error: 'Password must be at least 6 characters'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/users/login': {
      post: {
        summary: 'Login to existing account',
        description: 'Authenticate user with email and password',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserLogin'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      $ref: '#/components/schemas/User'
                    },
                    token: {
                      type: 'string',
                      description: 'JWT authentication token'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  error: 'Invalid login credentials'
                }
              }
            }
          }
        }
      }
    },
    '/users/logout': {
      post: {
        summary: 'Logout from current session',
        description: 'Removes current authentication token',
        tags: ['Authentication'],
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'Logout successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Logged out successfully'
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  error: 'Please authenticate'
                }
              }
            }
          }
        }
      }
    },
    '/users/logoutAll': {
      post: {
        summary: 'Logout from all devices',
        description: 'Removes all authentication tokens for the user',
        tags: ['Authentication'],
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'Logged out from all devices',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Logged out from all devices'
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/users/me': {
      get: {
        summary: 'Get current user profile',
        description: 'Retrieve authenticated user information',
        tags: ['User Profile'],
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'User profile',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      patch: {
        summary: 'Update user profile',
        description: 'Update name, email, or password',
        tags: ['User Profile'],
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    example: 'Jane Doe'
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'jane@example.com'
                  },
                  password: {
                    type: 'string',
                    format: 'password',
                    minLength: 6,
                    example: 'newpassword123'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Profile updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          },
          '400': {
            description: 'Invalid updates',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      delete: {
        summary: 'Delete user account',
        description: 'Permanently delete account and all associated tasks',
        tags: ['User Profile'],
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'Account deleted successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/users/me/avatar': {
      post: {
        summary: 'Upload profile picture',
        description: 'Upload an avatar image (max 5MB, jpeg/jpg/png/gif)',
        tags: ['Avatar'],
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  avatar: {
                    type: 'string',
                    format: 'binary',
                    description: 'Image file (jpeg, jpg, png, gif) - Max 5MB'
                  }
                },
                required: ['avatar']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Avatar uploaded successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Avatar uploaded successfully'
                    },
                    avatar: {
                      type: 'string',
                      example: 'avatar.jpg'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid file type',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  error: 'Only image files are allowed (jpeg, jpg, png, gif)'
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      delete: {
        summary: 'Delete profile picture',
        description: 'Remove current avatar image',
        tags: ['Avatar'],
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'Avatar deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Avatar deleted successfully'
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/users/{id}/avatar': {
      get: {
        summary: 'Get user avatar',
        description: 'Retrieve avatar image for a specific user',
        tags: ['Avatar'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            },
            description: 'User ID'
          }
        ],
        responses: {
          '200': {
            description: 'Avatar image',
            content: {
              'image/jpeg': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              },
              'image/png': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              },
              'image/gif': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          },
          '404': {
            description: 'Avatar not found'
          }
        }
      }
    },
    '/tasks': {
      get: {
        summary: 'Get all tasks',
        description: 'Retrieve all tasks for the authenticated user with optional filtering and sorting',
        tags: ['Tasks'],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'completed',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['true', 'false']
            },
            description: 'Filter by completion status'
          },
          {
            name: 'limit',
            in: 'query',
            schema: {
              type: 'integer',
              minimum: 0
            },
            description: 'Maximum number of results (0 = no limit)'
          },
          {
            name: 'skip',
            in: 'query',
            schema: {
              type: 'integer',
              minimum: 0
            },
            description: 'Number of results to skip (for pagination)'
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string'
            },
            description: 'Sort results (format: field:order, e.g., createdAt:desc)',
            example: 'createdAt:desc'
          }
        ],
        responses: {
          '200': {
            description: 'List of tasks',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Task'
                  }
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create a new task',
        description: 'Create a task with description, priority, and due date',
        tags: ['Tasks'],
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TaskInput'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Task created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Task'
                }
              }
            }
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/tasks/{id}': {
      get: {
        summary: 'Get task by ID',
        description: 'Retrieve a specific task',
        tags: ['Tasks'],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            },
            description: 'Task ID'
          }
        ],
        responses: {
          '200': {
            description: 'Task details',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Task'
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '404': {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  error: 'Task not found'
                }
              }
            }
          }
        }
      },
      patch: {
        summary: 'Update a task',
        description: 'Update task description, completion status, priority, or due date',
        tags: ['Tasks'],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            },
            description: 'Task ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  description: {
                    type: 'string'
                  },
                  completed: {
                    type: 'boolean'
                  },
                  priority: {
                    type: 'string',
                    enum: ['low', 'medium', 'high']
                  },
                  dueDate: {
                    type: 'string',
                    format: 'date-time'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Task updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Task'
                }
              }
            }
          },
          '400': {
            description: 'Invalid updates',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '404': {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      delete: {
        summary: 'Delete a task',
        description: 'Permanently delete a task',
        tags: ['Tasks'],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            },
            description: 'Task ID'
          }
        ],
        responses: {
          '200': {
            description: 'Task deleted successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Task'
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '404': {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    }
  }
};

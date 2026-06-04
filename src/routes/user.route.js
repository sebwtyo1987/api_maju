const userController = require('../controller/user.controller');

async function userRoutes(fastify) {
  const userSchema = {
    type: 'object',
    properties: {
      user_id: { type: 'integer', description: 'ID User' },
      username: { type: 'string', description: 'Username' },
      nama: { type: 'string', description: 'Nama Lengkap User' },
      role: { type: 'string', description: 'Peran User (admin, kasir, dll)' },
      menu: { type: 'string', description: 'Akses Menu User' },
    }
  };

  const errorSchema = {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'error' },
      message: { type: 'string' }
    }
  };

  // GET: Ambil semua user
  fastify.get('/', {
    schema: {
      description: 'Mengambil daftar semua user.',
      tags: ['Users'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: {
              type: 'array',
              items: userSchema
            }
          }
        }
      }
    }
  }, userController.getUsers);

  // GET: Ambil user berdasarkan ID
  fastify.get('/:id', {
    schema: {
      description: 'Mengambil detail user berdasarkan ID.',
      tags: ['Users'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID User' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: userSchema
          }
        },
        404: errorSchema
      }
    }
  }, userController.getUserById);

  // POST: Buat user baru
  fastify.post('/', {
    schema: {
      description: 'Menambahkan user baru ke database.',
      tags: ['Users'],
      body: {
        type: 'object',
        properties: {
          username: { type: 'string', description: 'Username', example: 'john.doe' },
          password: { type: 'string', description: 'Password (akan di-hash)', example: 'password123' },
          nama: { type: 'string', description: 'Nama Lengkap', example: 'John Doe' },
          role: { type: 'string', description: 'Peran user', enum: ['admin', 'kasir', 'gudang'], example: 'kasir' },
          menu: { type: 'string', description: 'Akses menu (opsional)', example: 'user' }
        },
        required: ['username', 'password', 'nama', 'role']
      },
      response: {
        201: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string', example: 'User berhasil dibuat' },
            data: { type: 'object', properties: { id: { type: 'integer' } } }
          }
        },
        500: errorSchema
      }
    }
  }, userController.createUser);

  // PUT: Update user berdasarkan ID
  fastify.put('/:id', {
    schema: {
      description: 'Memperbarui data user berdasarkan ID.',
      tags: ['Users'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID User' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          username: { type: 'string', description: 'Username', example: 'john.doe.updated' },
          password: { type: 'string', description: 'Password baru (akan di-hash)', example: 'newpassword' },
          nama: { type: 'string', description: 'Nama Lengkap', example: 'John Doe Updated' },
          role: { type: 'string', description: 'Peran user', enum: ['admin', 'kasir', 'gudang'], example: 'admin' },
          menu: { type: 'string', description: 'Akses menu (opsional)', example: 'admin' }
        }
      },
      response: {
        200: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        500: errorSchema
      }
    }
  }, userController.updateUser);

  // DELETE: Hapus user berdasarkan ID
  fastify.delete('/:id', {
    schema: {
      description: 'Menghapus user berdasarkan ID.',
      tags: ['Users'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID User' }
        },
        required: ['id']
      },
      response: {
        200: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        500: errorSchema
      }
    }
  }, userController.deleteUser);
}

module.exports = userRoutes;

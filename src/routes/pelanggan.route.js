const pelangganController = require('../controller/pelanggan.controller');

async function pelangganRoutes(fastify) {
  const pelangganSchema = {
    type: 'object',
    properties: {
      pelanggan_id: { type: 'integer', description: 'ID Pelanggan' },
      nama_pelanggan: { type: 'string', description: 'Nama Pelanggan' },
      alamat: { type: 'string', description: 'Alamat Pelanggan' },
      no_telepon: { type: 'string', description: 'Nomor Telepon Pelanggan' },
      aktif: { type: 'integer', description: 'Status Aktif (1=aktif, 0=tidak aktif)' },
      created_at: { type: 'string', nullable: true, description: 'Tanggal Dibuat' },
    }
  };

  const errorSchema = {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'error' },
      message: { type: 'string' }
    }
  };

  // GET: Ambil semua pelanggan atau cari berdasarkan ID/keyword
  fastify.get('/', {
    schema: {
      description: 'Mengambil daftar semua pelanggan, atau mencari pelanggan berdasarkan ID atau kata kunci.',
      tags: ['Pelanggan'],
      querystring: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID Pelanggan spesifik' },
          search: { type: 'string', description: 'Kata kunci pencarian (nama, alamat, telepon)' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: {
              type: 'array',
              items: pelangganSchema
            }
          }
        },
        404: errorSchema
      }
    }
  }, pelangganController.getPelanggan);

  // GET: Ambil pelanggan berdasarkan ID di parameter
  fastify.get('/:id', {
    schema: {
      description: 'Mengambil detail pelanggan berdasarkan ID.',
      tags: ['Pelanggan'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID Pelanggan' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: {
              type: 'array',
              items: pelangganSchema
            }
          }
        },
        404: errorSchema
      }
    }
  }, pelangganController.getPelanggan);

  // POST: Buat pelanggan baru
  fastify.post('/', {
    schema: {
      description: 'Menambahkan pelanggan baru ke database.',
      tags: ['Pelanggan'],
      body: {
        type: 'object',
        properties: {
          nama_pelanggan: { type: 'string', description: 'Nama pelanggan', example: 'Budi Santoso' },
          alamat: { type: 'string', description: 'Alamat pelanggan', example: 'Jl. Merdeka No. 10' },
          no_telepon: { type: 'string', description: 'Nomor telepon pelanggan', example: '081234567890' }
        },
        required: ['nama_pelanggan']
      },
      response: {
        200: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        400: errorSchema,
        500: errorSchema
      }
    }
  }, pelangganController.createPelanggan);

  // PUT: Update pelanggan berdasarkan ID
  fastify.put('/:id', {
    schema: {
      description: 'Memperbarui data pelanggan berdasarkan ID.',
      tags: ['Pelanggan'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID Pelanggan' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          nama_pelanggan: { type: 'string', description: 'Nama pelanggan', example: 'Budi Santoso Updated' },
          alamat: { type: 'string', description: 'Alamat pelanggan', example: 'Jl. Merdeka No. 15' },
          no_telepon: { type: 'string', description: 'Nomor telepon pelanggan', example: '081211122233' }
        }
      },
      response: {
        200: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        400: errorSchema,
        500: errorSchema
      }
    }
  }, pelangganController.updatePelanggan);

  // DELETE: Hapus pelanggan (soft delete) berdasarkan ID
  fastify.delete('/:id', {
    schema: {
      description: 'Menghapus pelanggan (mengubah status aktif menjadi 0) berdasarkan ID.',
      tags: ['Pelanggan'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID Pelanggan' }
        },
        required: ['id']
      },
      response: {
        200: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        400: errorSchema,
        404: errorSchema
      }
    }
  }, pelangganController.deletePelanggan);
}

module.exports = pelangganRoutes;

const suplierController = require('../controller/suplier.controller');

async function suplierRoutes(fastify) {
  const suplierSchema = {
    type: 'object',
    properties: {
      suplier_id: { type: 'integer', description: 'ID Suplier' },
      kode_suplier: { type: 'string', description: 'Kode Suplier' },
      nama_suplier: { type: 'string', description: 'Nama Suplier' },
      alamat: { type: 'string', description: 'Alamat Suplier' },
      telepon: { type: 'string', description: 'Nomor Telepon Suplier' },
      email: { type: 'string', format: 'email', description: 'Email Suplier' },
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

  // GET: Ambil semua suplier atau cari berdasarkan ID/keyword
  fastify.get('/', {
    schema: {
      description: 'Mengambil daftar semua suplier dengan opsi pencarian dan pagination.',
      tags: ['Suplier'],
      querystring: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Kata kunci pencarian (nama, kode, alamat, email)' },
          page: { type: 'integer', default: 1, description: 'Nomor halaman' },
          limit: { type: 'integer', default: 10, description: 'Jumlah item per halaman' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: {
              type: 'array',
              items: suplierSchema
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total_rows: { type: 'integer' },
                total_pages: { type: 'integer' },
              }
            }
          }
        },
        500: errorSchema
      }
    }
  }, suplierController.getSuplier);

  // GET: Ambil suplier berdasarkan ID di parameter
  fastify.get('/:id', {
    schema: {
      description: 'Mengambil detail suplier berdasarkan ID.',
      tags: ['Suplier'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID Suplier' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: suplierSchema
          }
        },
        404: errorSchema
      }
    }
  }, suplierController.getSuplier);

  // POST: Buat suplier baru
  fastify.post('/', {
    schema: {
      description: 'Menambahkan suplier baru ke database.',
      tags: ['Suplier'],
      body: {
        type: 'object',
        properties: {
          nama_suplier: { type: 'string', description: 'Nama suplier', example: 'PT. Maju Jaya' },
          alamat: { type: 'string', description: 'Alamat suplier', example: 'Jl. Industri No. 5' },
          telepon: { type: 'string', description: 'Nomor telepon suplier', example: '021123456' },
          email: { type: 'string', format: 'email', description: 'Email suplier', example: 'info@majujaya.com' }
        },
        required: ['nama_suplier']
      },
      response: {
        201: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' }, id: { type: 'integer' } } },
        400: errorSchema,
        500: errorSchema
      }
    }
  }, suplierController.createSuplier);

  // PUT: Update suplier berdasarkan ID
  fastify.put('/:id', {
    schema: {
      description: 'Memperbarui data suplier berdasarkan ID.',
      tags: ['Suplier'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID Suplier' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          kode_suplier: { type: 'string', description: 'Kode suplier', example: 'SUP001' },
          nama_suplier: { type: 'string', description: 'Nama suplier', example: 'PT. Maju Jaya Abadi' },
          alamat: { type: 'string', description: 'Alamat suplier', example: 'Jl. Industri No. 10' },
          telepon: { type: 'string', description: 'Nomor telepon suplier', example: '021987654' },
          email: { type: 'string', format: 'email', description: 'Email suplier', example: 'admin@majujaya.com' }
        }
      },
      response: {
        200: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        400: errorSchema,
        500: errorSchema
      }
    }
  }, suplierController.updateSuplier);

  // DELETE: Hapus suplier (soft delete) berdasarkan ID
  fastify.delete('/:id', {
    schema: {
      description: 'Menghapus suplier (mengubah status aktif menjadi 0) berdasarkan ID.',
      tags: ['Suplier'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID Suplier' }
        },
        required: ['id']
      },
      response: {
        200: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        400: errorSchema,
        404: errorSchema
      }
    }
  }, suplierController.deleteSuplier);
}

module.exports = suplierRoutes;

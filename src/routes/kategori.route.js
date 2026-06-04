const kategoriController = require('../controller/kategori.controller');

async function kategoriRoutes(fastify) {
  const kategoriSchema = {
    type: 'object',
    properties: {
      kategori_id: { type: 'integer', description: 'ID Kategori' },
      nama_kategori: { type: 'string', description: 'Nama Kategori' },
      deskripsi: { type: 'string', description: 'Deskripsi Kategori' },
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

  // GET: Ambil semua kategori atau cari berdasarkan ID/keyword
  fastify.get('/', {
    schema: {
      description: 'Mengambil daftar semua kategori, atau mencari kategori berdasarkan ID atau kata kunci.',
      tags: ['Kategori'],
      querystring: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID Kategori spesifik' },
          search: { type: 'string', description: 'Kata kunci pencarian (nama, deskripsi)' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: {
              type: 'array',
              items: kategoriSchema
            }
          }
        },
        404: errorSchema
      }
    }
  }, kategoriController.getKategori);

  // GET: Ambil kategori berdasarkan ID di parameter
  fastify.get('/:id', {
    schema: {
      description: 'Mengambil detail kategori berdasarkan ID.',
      tags: ['Kategori'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID Kategori' }
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
              items: kategoriSchema
            }
          }
        },
        404: errorSchema
      }
    }
  }, kategoriController.getKategori);

  // POST: Buat kategori baru
  fastify.post('/', {
    schema: {
      description: 'Menambahkan kategori baru ke database.',
      tags: ['Kategori'],
      body: {
        type: 'object',
        properties: {
          nama_kategori: { type: 'string', description: 'Nama kategori', example: 'MAKANAN' },
          deskripsi: { type: 'string', description: 'Deskripsi kategori', example: 'Produk makanan dan minuman' }
        },
        required: ['nama_kategori']
      },
      response: {
        200: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        400: errorSchema,
        500: errorSchema
      }
    }
  }, kategoriController.createKategori);

  // PUT: Update kategori berdasarkan ID
  fastify.put('/:id', {
    schema: {
      description: 'Memperbarui data kategori berdasarkan ID.',
      tags: ['Kategori'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID Kategori' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          nama_kategori: { type: 'string', description: 'Nama kategori', example: 'MINUMAN' },
          deskripsi: { type: 'string', description: 'Deskripsi kategori', example: 'Produk minuman kemasan' }
        }
      },
      response: {
        200: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        400: errorSchema,
        500: errorSchema
      }
    }
  }, kategoriController.updateKategori);

  // DELETE: Hapus kategori (soft delete) berdasarkan ID
  fastify.delete('/:id', {
    schema: {
      description: 'Menghapus kategori (mengubah status aktif menjadi 0) berdasarkan ID.',
      tags: ['Kategori'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID Kategori' }
        },
        required: ['id']
      },
      response: {
        200: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        400: errorSchema,
        404: errorSchema
      }
    }
  }, kategoriController.deleteKategori);
}

module.exports = kategoriRoutes;

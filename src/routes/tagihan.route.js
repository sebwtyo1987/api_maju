const tagihanController = require('../controller/tagihan.controller');

async function tagihanRoutes(fastify) {
  const tagihanSchema = {
    type: 'object',
    properties: {
      tagihan_id: { type: 'integer' },
      tagihan_tanggal: { type: 'string', format: 'date' },
      tagihan_nama: { type: 'string' },
      tagihan_jumlah: { type: 'integer' },
      tagihan_total: { type: 'number' },
      tagihan_setor: { type: 'number' },
      tagihan_sisa: { type: 'number' },
      tagihan_aktif: { type: 'integer' },
      details: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            detail_tagihan_id: { type: 'integer' },
            tagihan_id: { type: 'integer' },
            penjualan_id: { type: 'integer' },
            tagihan_pelanggan_id: { type: 'integer' },
            tagihan_subtotal: { type: 'number' },
            tagihan_lunas: { type: 'integer' },
            nama_pelanggan: { type: 'string' },
            tanggal_penjualan: { type: 'string', format: 'date' }
          }
        }
      }
    }
  };

  const errorSchema = {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'error' },
      message: { type: 'string' }
    }
  };

  // GET: Semua tagihan
  fastify.get('/', {
    schema: {
      description: 'Mengambil daftar tagihan',
      tags: ['Tagihan'],
      querystring: {
        type: 'object',
        properties: {
          search: { type: 'string' },
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 10 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            data: { type: 'array', items: tagihanSchema },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total_rows: { type: 'integer' },
                total_pages: { type: 'integer' }
              }
            }
          }
        }
      }
    }
  }, tagihanController.getTagihan);

  // GET: Berdasarkan ID
  fastify.get('/:id', {
    schema: {
      description: 'Detail tagihan berdasarkan ID',
      tags: ['Tagihan'],
      params: {
        type: 'object',
        properties: { id: { type: 'integer' } },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            data: tagihanSchema
          }
        },
        404: errorSchema
      }
    }
  }, tagihanController.getTagihan);

  // POST: Buat Tagihan
  fastify.post('/', {
    schema: {
      description: 'Membuat tagihan baru',
      tags: ['Tagihan'],
      body: {
        type: 'object',
        required: ['tagihan_nama', 'tagihan_total'],
        properties: {
          tagihan_id: { type: 'integer', description: 'ID Tagihan jika ingin menghapus yang lama dan membuat baru' },
          tagihan_tanggal: { type: 'string', format: 'date' },
          tagihan_nama: { type: 'string' },
          tagihan_jumlah: { type: 'integer' },
          tagihan_total: { type: 'number' },
          tagihan_setor: { type: 'number' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: { status: { type: 'string' }, message: { type: 'string' }, id: { type: 'integer' } }
        }
      }
    }
  }, tagihanController.createTagihan);

  // PUT: Update Tagihan
  fastify.put('/:id', {
    schema: {
      description: 'Memperbarui tagihan berdasarkan ID',
      tags: ['Tagihan'],
      params: {
        type: 'object',
        properties: { id: { type: 'integer' } },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          tagihan_tanggal: { type: 'string', format: 'date' },
          tagihan_nama: { type: 'string' },
          tagihan_jumlah: { type: 'integer' },
          tagihan_total: { type: 'number' },
          tagihan_setor: { type: 'number' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                detail_tagihan_id: { type: 'integer' },
                penjualan_id: { type: ['integer', 'null'] },
                tagihan_pelanggan_id: { type: ['integer', 'null'] },
                tagihan_subtotal: { type: 'number' },
                tagihan_lunas: { type: 'integer' }
              }
            }
          }
        }
        // Tidak ada 'required' di sini karena PUT bisa untuk partial update
      },
      response: {
        200: {
          type: 'object',
          properties: { status: { type: 'string' }, message: { type: 'string' } }
        },
        404: errorSchema
      }
    }
  }, tagihanController.updateTagihan);

  // POST: Update Tagihan (Legacy/Alternative support)
  fastify.post('/:id', {
    schema: {
      description: 'Memperbarui tagihan menggunakan method POST',
      tags: ['Tagihan'],
      params: {
        type: 'object',
        properties: { id: { type: 'integer' } },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          tagihan_tanggal: { type: 'string', format: 'date' },
          tagihan_nama: { type: 'string' },
          tagihan_jumlah: { type: 'integer' },
          tagihan_total: { type: 'number' },
          tagihan_setor: { type: 'number' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                detail_tagihan_id: { type: 'integer' },
                penjualan_id: { type: ['integer', 'null'] },
                tagihan_pelanggan_id: { type: ['integer', 'null'] },
                tagihan_subtotal: { type: 'number' },
                tagihan_lunas: { type: 'integer' }
              }
            }
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: { status: { type: 'string' }, message: { type: 'string' } }
        },
        404: errorSchema
      }
    }
  }, tagihanController.updateTagihan);

  // DELETE: Hapus Tagihan
  fastify.delete('/:id', {
    schema: {
      description: 'Menghapus tagihan (soft delete) berdasarkan ID',
      tags: ['Tagihan'],
      params: {
        type: 'object',
        properties: { id: { type: 'integer' } },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: { status: { type: 'string' }, message: { type: 'string' } }
        },
        404: errorSchema
      }
    }
  }, tagihanController.deleteTagihan);
}

module.exports = tagihanRoutes;

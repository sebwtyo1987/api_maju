const barangController = require('../controller/barang.controller');

async function barangRoutes(fastify) {
  const barangSchema = {
    type: 'object',
    properties: {
      barang_id: { type: 'integer', description: 'ID Barang' },
      barcode: { type: 'string', description: 'Kode Barcode' },
      nama_barang: { type: 'string', description: 'Nama Barang' },
      kategori_id: { type: 'integer', description: 'ID Kategori' },
      nama_kategori: { type: 'string', description: 'Nama Kategori' },
      harga_hna: { type: 'number', format: 'float', description: 'Harga HNA' },
      harga_beli: { type: 'number', format: 'float', description: 'Harga Beli' },
      stok: { type: 'integer', description: 'Jumlah Stok' },
      satuan: { type: 'string', description: 'Satuan Barang' },
      aktif: { type: 'integer', description: 'Status Aktif (1=aktif, 0=tidak aktif)' },
      gambar: { type: 'string', nullable: true, description: 'URL atau path gambar barang' },
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

  // GET: Ambil semua barang atau cari berdasarkan ID/keyword
  fastify.get('/', {
    schema: {
      description: 'Mengambil daftar semua barang, atau mencari barang berdasarkan ID atau kata kunci.',
      tags: ['Barang'],
      querystring: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID Barang spesifik' },
          search: { type: 'string', description: 'Kata kunci pencarian (nama, barcode, kategori)' },
          page: { type: 'integer', description: 'Nomor halaman' },
          limit: { type: 'integer', description: 'Jumlah item per halaman' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: {
              type: 'array',
              items: barangSchema
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
        404: errorSchema
      }
    }
  }, barangController.getBarang);

  // GET: Ambil barang berdasarkan ID di parameter
  fastify.get('/:id', {
    schema: {
      description: 'Mengambil detail barang berdasarkan ID.',
      tags: ['Barang'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID Barang' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: barangSchema
          }
        },
        404: errorSchema
      }
    }
  }, barangController.getBarang);

  // POST: Buat barang baru
  fastify.post('/', {
    schema: {
      description: 'Menambahkan barang baru ke database.',
      tags: ['Barang'],
      body: {
        type: 'object',
        properties: {
          barcode: { type: 'string', description: 'Barcode barang', example: 'BRC001' },
          nama_barang: { type: 'string', description: 'Nama barang', example: 'Susu Cair' },
          kategori_id: { type: 'integer', description: 'ID Kategori barang', example: 1 },
          harga_hna: { type: 'number', format: 'float', description: 'Harga HNA', example: 10000 },
          harga_beli: { type: 'number', format: 'float', description: 'Harga Beli', example: 8000 },
          stok: { type: 'integer', description: 'Jumlah stok awal', example: 50 },
          satuan: { type: 'string', description: 'Satuan barang', example: 'PCS' },
          gambar: { type: 'string', description: 'URL atau path gambar barang', example: 'img/susu.jpg' }
        },
        required: ['barcode', 'nama_barang', 'kategori_id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string', example: 'Barang berhasil ditambahkan.' },
            data: { type: 'object', properties: { barang_id: { type: 'integer' } } }
          }
        },
        400: errorSchema,
        409: errorSchema, // ER_DUP_ENTRY
        500: errorSchema
      }
    }
  }, barangController.createBarang);

  // PUT: Update barang berdasarkan ID
  fastify.put('/:id', {
    schema: {
      description: 'Memperbarui data barang berdasarkan ID.',
      tags: ['Barang'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID Barang' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          barcode: { type: 'string', description: 'Barcode barang', example: 'BRC001' },
          nama_barang: { type: 'string', description: 'Nama barang', example: 'Susu Cair Full Cream' },
          kategori_id: { type: 'integer', description: 'ID Kategori barang', example: 1 },
          harga_hna: { type: 'number', format: 'float', description: 'Harga HNA', example: 11000 },
          harga_beli: { type: 'number', format: 'float', description: 'Harga Beli', example: 8500 },
          stok: { type: 'integer', description: 'Jumlah stok', example: 45 },
          satuan: { type: 'string', description: 'Satuan barang', example: 'PCS' },
          gambar: { type: 'string', description: 'URL atau path gambar barang', example: 'img/susu_new.jpg' }
        }
      },
      response: {
        200: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        400: errorSchema,
        409: errorSchema,
        500: errorSchema
      }
    }
  }, barangController.updateBarang);

  // DELETE: Hapus barang (soft delete) berdasarkan ID
  fastify.delete('/:id', {
    schema: {
      description: 'Menghapus barang (mengubah status aktif menjadi 0) berdasarkan ID.',
      tags: ['Barang'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID Barang' }
        },
        required: ['id']
      },
      response: {
        200: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        400: errorSchema,
        404: errorSchema
      }
    }
  }, barangController.deleteBarang);
}

module.exports = barangRoutes;

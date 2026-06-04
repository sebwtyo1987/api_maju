const historiController = require('../controller/histori.controller');

async function historiRoutes(fastify) {
  //tampilkan semua histori
  fastify.get('/all', {
    schema: {
      description: 'Mengambil daftar semua histori',
      tags: ['Histori'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            jumlah_data: { type: 'integer' },
            data: { type: 'array', items: { type: 'object', additionalProperties: true } }
          }
        }
      }
    }
  }, historiController.tampilSemuaHistori);
  // GET: Cari Histori Berdasarkan Pelanggan
  fastify.get('/cari', {
    schema: {
      description: 'Mencari histori harga barang berdasarkan ID pelanggan',
      tags: ['Histori'],
      querystring: {
        type: 'object',
        properties: {
          id_pelanggan: { type: 'integer' }
        },
        required: ['id_pelanggan']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            jumlah_data: { type: 'integer' },
            data: { type: 'array', items: { type: 'object', additionalProperties: true } }
          }
        }
      }
    }
  }, historiController.cariPelanggan);

  // POST: Ambil Harga Terakhir
  fastify.post('/getHarga', {
    schema: {
      description: 'Mengambil harga terakhir untuk pelanggan dan barang tertentu',
      tags: ['Histori'],
      body: {
        type: 'object',
        properties: {
          id_pelanggan: { type: 'integer' },
          id_barang: { type: 'integer' }
        },
        required: ['id_pelanggan', 'id_barang']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['ada', 'tidak_ada'] },
            harga: { type: 'number' }
          }
        }
      }
    }
  }, historiController.ambilHargaTerakhir);

  // POST: Simpan Histori
  fastify.post('/saveHistori', {
    schema: {
      description: 'Simpan histori harga baru',
      tags: ['Histori'],
      body: {
        type: 'object',
        properties: {
          pelanggan_id: { type: 'integer' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                barang_id: { type: 'integer' },
                harga_satuan: { type: 'number' }
              },
              required: ['barang_id', 'harga_satuan']
            }
          }
        }
      }
    }
  }, historiController.simpanHistori);

  // POST: Edit Histori
  fastify.post('/edit', {
    schema: {
      description: 'Update manual histori harga',
      tags: ['Histori'],
      body: {
        type: 'object',
        properties: {
          id_histori: { type: 'integer' },
          id_pelanggan: { type: 'integer' },
          id_barang: { type: 'integer' },
          harga_satuan: { type: 'number' }
        },
        required: ['id_histori']
      }
    }
  }, historiController.ubahHistori);

  // DELETE: Hapus Berdasarkan Barang
  fastify.post('/delete', {
    schema: {
      description: 'Menghapus histori berdasarkan ID barang',
      tags: ['Histori'],
      body: {
        type: 'object',
        properties: {
          id_barang: { type: 'integer' }
        },
        required: ['id_barang']
      }
    }
  }, historiController.hapusHistori);

  // GET: Hapus Barang (Legacy/Compat)
  fastify.get('/hapus_barang', {
    schema: {
      description: 'Menghapus histori harga barang berdasarkan ID barang (legacy support via GET).',
      tags: ['Histori'],
      querystring: {
        type: 'object',
        properties: {
          barang_id: { type: 'integer' }
        },
        required: ['barang_id']
      },
      response: {
        200: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        400: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } }
      }
    }
  }, historiController.hapusHistori);
}

module.exports = historiRoutes;

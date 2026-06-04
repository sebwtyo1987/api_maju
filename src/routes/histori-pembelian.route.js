const historiPembelianController = require('../controller/histori-pembelian.controller');

async function historiPembelianRoutes(fastify) {
  const tags = ['Histori Pembelian'];

  // GET: Default List
  fastify.get('/', {
    schema: {
      description: 'Mengambil 100 data histori pembelian terakhir',
      tags
    }
  }, historiPembelianController.ambilDaftar);

  // GET: Cari berdasarkan Suplier
  fastify.get('/cari', {
    schema: {
      description: 'Mencari histori pembelian berdasarkan ID Suplier',
      tags,
      querystring: {
        type: 'object',
        properties: {
          id_suplier: { type: 'integer' }
        },
        required: ['id_suplier']
      }
    }
  }, historiPembelianController.cariSuplier);

  // POST: Ambil Harga Terakhir
  fastify.post('/getHarga', {
    schema: {
      description: 'Mengambil harga beli terakhir dari suplier tertentu untuk barang tertentu',
      tags,
      body: {
        type: 'object',
        properties: {
          id_suplier: { type: 'integer' },
          id_barang: { type: 'integer' }
        },
        required: ['id_suplier', 'id_barang']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            harga: { type: 'number' }
          }
        }
      }
    }
  }, historiPembelianController.ambilHargaTerakhir);

  // POST: Simpan Histori
  fastify.post('/saveHistori', {
    schema: {
      description: 'Menyimpan atau memperbarui histori harga beli suplier',
      tags,
      body: {
        type: 'object',
        properties: {
          suplier_id: { type: 'integer' },
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
        },
        required: ['suplier_id', 'items']
      }
    }
  }, historiPembelianController.simpanHistori);

  // POST: Edit Histori (Manual)
  fastify.post('/edit', {
    schema: {
      description: 'Mengubah data histori pembelian secara manual',
      tags,
      body: {
        type: 'object',
        properties: {
          id_histori: { type: 'integer' },
          id_suplier: { type: 'integer' },
          id_barang: { type: 'integer' },
          harga_satuan: { type: 'number' }
        },
        required: ['id_histori']
      }
    }
  }, historiPembelianController.ubahHistori);

  // POST: Delete Histori
  fastify.post('/delete', {
    schema: {
      description: 'Menghapus histori pembelian berdasarkan ID barang',
      tags,
      body: {
        type: 'object',
        properties: {
          id_barang: { type: 'integer' }
        },
        required: ['id_barang']
      }
    }
  }, historiPembelianController.hapusHistori);
}

module.exports = historiPembelianRoutes;

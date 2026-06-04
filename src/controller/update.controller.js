const fs = require('fs').promises;
const path = require('path');

async function checkUpdate(request, reply) {
  try {
    const filePath = path.join(__dirname, '..', 'updates', 'update.json');
    const data = await fs.readFile(filePath, 'utf8');
    
    const updateInfo = JSON.parse(data);

    // Mengambil protokol (http/https) dan host (ip:port) secara dinamis dari request
    const protocol = request.protocol;
    const host = request.hostname; // request.hostname sudah mencakup IP dan Port di Fastify
    
    updateInfo.download_url = `${protocol}://${host}/api/v1/updates/download/${updateInfo.app_name}`;

    return updateInfo;
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ 
      status: 'error', 
      message: 'Gagal membaca konfigurasi update' 
    });
  }
}

module.exports = {
  checkUpdate
};

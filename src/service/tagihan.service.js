function castData(row) {
    if (!row) return null;
    const total = parseFloat(row.tagihan_total || 0);
    const setor = parseFloat(row.tagihan_setor || 0);
    let tagihanTanggal = null;
    if (row.tagihan_tanggal) {
        const d = new Date(row.tagihan_tanggal);
        tagihanTanggal = Number.isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
    }
    return {
        ...row,
        tagihan_id: Number(row.tagihan_id),
        tagihan_jumlah: Number(row.tagihan_jumlah || 0),
        tagihan_total: total,
        tagihan_setor: setor,
        tagihan_sisa: total - setor,
        tagihan_aktif: Number(row.tagihan_aktif),
        tagihan_tanggal: tagihanTanggal,
    };
}

const findById = async (db, id) => {
    const [rows] = await db.query(
        'SELECT tagihan_id, tagihan_tanggal, tagihan_nama, tagihan_jumlah, tagihan_total, tagihan_setor, tagihan_aktif FROM tagihan WHERE tagihan_id = ? AND tagihan_aktif = 1',
        [id]
    );
    return castData(rows[0]);
};

const findDetails = async (db, id) => {
    const [rows] = await db.query(
        `SELECT
            dt.detail_tagihan_id,
            dt.tagihan_id,
            dt.penjualan_id,
            dt.tagihan_pelanggan_id,
            dt.tagihan_subtotal,
            dt.tagihan_lunas,
            p.nama_pelanggan,
            pj.tanggal AS tanggal_penjualan
        FROM
            detail_tagihan dt
        LEFT JOIN
            pelanggan p ON dt.tagihan_pelanggan_id = p.pelanggan_id
        LEFT JOIN
            penjualan pj ON dt.penjualan_id = pj.penjualan_id
        WHERE
            dt.tagihan_id = ?`,
        [id]
    );
    return rows.map(row => ({
        ...row,
        tanggal_penjualan: (() => {
            if (!row.tanggal_penjualan) return null;
            const d = new Date(row.tanggal_penjualan);
            return Number.isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
        })(),
    }));
};

const findAll = async (db, search, limit, offset) => {
    let sql = 'SELECT tagihan_id, tagihan_tanggal, tagihan_nama, tagihan_jumlah, tagihan_total, tagihan_setor, tagihan_aktif FROM tagihan WHERE tagihan_aktif = 1';
    const params = [];
    if (search) {
        sql += ' AND tagihan_nama LIKE ?';
        params.push(`%${search}%`);
    }
    sql += ' ORDER BY tagihan_id DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    const [rows] = await db.query(sql, params);
    return rows.map(castData);
};

const countAll = async (db, search) => {
    let sql = 'SELECT COUNT(tagihan_id) as total FROM tagihan WHERE tagihan_aktif = 1';
    const params = [];
    if (search) {
        sql += ' AND tagihan_nama LIKE ?';
        params.push(`%${search}%`);
    }
    const [rows] = await db.query(sql, params);
    return rows[0].total;
};

const create = async (db, data, existingId = null) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        if (existingId) {
            // Hapus detail tagihan lama
            await connection.query('DELETE FROM detail_tagihan WHERE tagihan_id = ?', [existingId]);
            // Hapus header tagihan lama secara permanen untuk digantikan yang baru
            await connection.query('DELETE FROM tagihan WHERE tagihan_id = ?', [existingId]);
        }

        const { tagihan_tanggal, tagihan_nama, tagihan_jumlah, tagihan_total, tagihan_setor } = data;
        const [result] = await connection.query(
            'INSERT INTO tagihan (tagihan_tanggal, tagihan_nama, tagihan_jumlah, tagihan_total, tagihan_setor, tagihan_aktif) VALUES (?, ?, ?, ?, ?, 1)',
            [tagihan_tanggal || null, tagihan_nama, tagihan_jumlah || 0, tagihan_total || 0, tagihan_setor || 0]
        );

        await connection.commit();
        return result.insertId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const update = async (db, id, data) => {
    const fields = [];
    const params = [];

    if (data.tagihan_tanggal !== undefined) { fields.push('tagihan_tanggal = ?'); params.push(data.tagihan_tanggal); }
    if (data.tagihan_nama !== undefined) { fields.push('tagihan_nama = ?'); params.push(data.tagihan_nama); }
    if (data.tagihan_jumlah !== undefined) { fields.push('tagihan_jumlah = ?'); params.push(data.tagihan_jumlah); }
    if (data.tagihan_total !== undefined) { fields.push('tagihan_total = ?'); params.push(data.tagihan_total); }
    if (data.tagihan_setor !== undefined) { fields.push('tagihan_setor = ?'); params.push(data.tagihan_setor); }

    if (fields.length === 0) {
        return 0; // No fields to update
    }

    params.push(id); // Add id for WHERE clause

    const [result] = await db.query(
        `UPDATE tagihan SET ${fields.join(', ')} WHERE tagihan_id = ?`,
        params
    );
    return result.affectedRows;
};

const updateWithDetails = async (db, id, data) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const affectedRows = await update(connection, id, data);

        if (data.details !== undefined) {
            const details = Array.isArray(data.details) ? data.details : [];
            const keepIds = details
                .map(d => Number(d.detail_tagihan_id))
                .filter(n => Number.isFinite(n) && n > 0);

            if (keepIds.length > 0) {
                const placeholders = keepIds.map(() => '?').join(', ');
                await connection.query(
                    `DELETE FROM detail_tagihan WHERE tagihan_id = ? AND detail_tagihan_id NOT IN (${placeholders})`,
                    [Number(id), ...keepIds]
                );
            } else {
                await connection.query('DELETE FROM detail_tagihan WHERE tagihan_id = ?', [Number(id)]);
            }

            for (const detail of details) {
                const detailId = Number(detail.detail_tagihan_id);
                const payload = [
                    detail.penjualan_id ?? null,
                    detail.tagihan_pelanggan_id ?? null,
                    detail.tagihan_subtotal ?? 0,
                    detail.tagihan_lunas ?? 0,
                ];

                if (Number.isFinite(detailId) && detailId > 0) {
                    await connection.query(
                        'UPDATE detail_tagihan SET penjualan_id = ?, tagihan_pelanggan_id = ?, tagihan_subtotal = ?, tagihan_lunas = ? WHERE detail_tagihan_id = ? AND tagihan_id = ?',
                        [...payload, detailId, Number(id)]
                    );
                } else {
                    await connection.query(
                        'INSERT INTO detail_tagihan (tagihan_id, penjualan_id, tagihan_pelanggan_id, tagihan_subtotal, tagihan_lunas) VALUES (?, ?, ?, ?, ?)',
                        [Number(id), ...payload]
                    );
                }
            }
        }

        await connection.commit();
        return affectedRows;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};


const remove = async (db, id) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Hapus detail tagihan (Hard delete karena tidak ada kolom aktif di detail)
        await connection.query('DELETE FROM detail_tagihan WHERE tagihan_id = ?', [id]);

        // 2. Soft delete header tagihan
        const [result] = await connection.query('UPDATE tagihan SET tagihan_aktif = 0 WHERE tagihan_id = ?', [id]);

        await connection.commit();
        return result.affectedRows;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = { findById, findDetails, findAll, countAll, create, update, updateWithDetails, remove };

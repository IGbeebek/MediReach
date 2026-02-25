/**
 * Medicine Repository — database queries for the medicines table.
 */

const { query } = require('../database/db');

const medicineRepository = {
  /**
   * Get all medicines with optional filtering, sorting, and search.
   */
  async findAll({ search, category, sort = 'name', limit, offset } = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (search) {
      conditions.push(
        `(LOWER(name) LIKE $${idx} OR LOWER(generic_name) LIKE $${idx} OR LOWER(manufacturer) LIKE $${idx})`
      );
      params.push(`%${search.toLowerCase()}%`);
      idx++;
    }

    if (category) {
      conditions.push(`category = $${idx}`);
      params.push(category);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sorting
    const sortMap = {
      name: 'name ASC',
      'price-low': 'price ASC',
      'price-high': 'price DESC',
      stock: 'stock ASC',
      newest: 'created_at DESC',
    };
    const orderBy = sortMap[sort] || 'name ASC';

    let sql = `SELECT * FROM medicines ${where} ORDER BY ${orderBy}`;

    if (limit) {
      sql += ` LIMIT $${idx}`;
      params.push(limit);
      idx++;
    }
    if (offset) {
      sql += ` OFFSET $${idx}`;
      params.push(offset);
      idx++;
    }

    const { rows } = await query(sql, params);
    return rows;
  },

  /**
   * Count medicines (for pagination).
   */
  async count({ search, category } = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (search) {
      conditions.push(
        `(LOWER(name) LIKE $${idx} OR LOWER(generic_name) LIKE $${idx} OR LOWER(manufacturer) LIKE $${idx})`
      );
      params.push(`%${search.toLowerCase()}%`);
      idx++;
    }

    if (category) {
      conditions.push(`category = $${idx}`);
      params.push(category);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await query(`SELECT COUNT(*) AS total FROM medicines ${where}`, params);
    return parseInt(rows[0].total, 10);
  },

  /**
   * Find a single medicine by ID.
   */
  async findById(id) {
    const { rows } = await query('SELECT * FROM medicines WHERE id = $1', [id]);
    return rows[0] || null;
  },

  /**
   * Create a new medicine.
   */
  async create(data) {
    const { rows } = await query(
      `INSERT INTO medicines
         (name, generic_name, category, manufacturer,
          requires_prescription, price, stock, description,
          image_url, expiry_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        data.name,
        data.genericName,
        data.category,
        data.manufacturer,
        data.requiresPrescription || false,
        data.price,
        data.stock || 0,
        data.description || null,
        data.imageUrl || null,
        data.expiryDate || null,
      ]
    );
    return rows[0];
  },

  /**
   * Update an existing medicine.
   */
  async update(id, data) {
    const fields = [];
    const params = [];
    let idx = 1;

    const map = {
      name: 'name',
      genericName: 'generic_name',
      category: 'category',
      manufacturer: 'manufacturer',
      requiresPrescription: 'requires_prescription',
      price: 'price',
      stock: 'stock',
      description: 'description',
      imageUrl: 'image_url',
      expiryDate: 'expiry_date',
    };

    for (const [key, col] of Object.entries(map)) {
      if (data[key] !== undefined) {
        fields.push(`${col} = $${idx}`);
        params.push(data[key]);
        idx++;
      }
    }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    const { rows } = await query(
      `UPDATE medicines SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    return rows[0] || null;
  },

  /**
   * Delete a medicine by ID.
   */
  async remove(id) {
    const { rows } = await query('DELETE FROM medicines WHERE id = $1 RETURNING id', [id]);
    return rows[0] || null;
  },
};

module.exports = medicineRepository;

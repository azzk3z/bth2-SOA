const db = require("../config/db");

const stmt = {
    all: db.prepare("SELECT * FROM products ORDER BY id"),
    one: db.prepare("SELECT * FROM products WHERE id = ?"),
    insert: db.prepare(
        "INSERT INTO products (name, description, price, quantity) VALUES (@name, @description, @price, @quantity)"
    ),
    update: db.prepare(
        `UPDATE products
         SET name = @name, description = @description, price = @price,
             quantity = @quantity, updated_at = CURRENT_TIMESTAMP
         WHERE id = @id`
    ),
    remove: db.prepare("DELETE FROM products WHERE id = ?")
};

// Kiem tra du lieu dau vao. Voi PUT, truong nao thieu se giu gia tri cu (existing).
function validate(body, existing) {
    const errors = [];
    const data = {
        name: body.name !== undefined ? body.name : existing && existing.name,
        description: body.description !== undefined ? body.description : existing ? existing.description : null,
        price: body.price !== undefined ? body.price : existing && existing.price,
        quantity: body.quantity !== undefined ? body.quantity : existing ? existing.quantity : 0
    };

    if (typeof data.name !== "string" || data.name.trim() === "" || data.name.length > 255) {
        errors.push("name bat buoc, la chuoi khong rong, toi da 255 ky tu");
    }
    if (data.description !== null && data.description !== undefined && typeof data.description !== "string") {
        errors.push("description phai la chuoi");
    }
    if (typeof data.price !== "number" || !Number.isFinite(data.price) || data.price < 0 || data.price >= 1e8) {
        errors.push("price bat buoc, la so >= 0 va < 100000000");
    }
    if (!Number.isInteger(data.quantity) || data.quantity < 0) {
        errors.push("quantity phai la so nguyen >= 0");
    }

    if (errors.length) return { errors };

    return {
        data: {
            name: data.name.trim(),
            description: data.description ?? null,
            price: Math.round(data.price * 100) / 100,
            quantity: data.quantity
        }
    };
}

function parseId(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ message: "id khong hop le" });
        return null;
    }
    return id;
}

// GET /products
const getAll = (req, res) => {
    res.json(stmt.all.all());
};

// GET /products/:id
const getById = (req, res) => {
    const id = parseId(req, res);
    if (id === null) return;

    const product = stmt.one.get(id);
    if (!product) return res.status(404).json({ message: "Khong tim thay san pham" });
    res.json(product);
};

// POST /products
const create = (req, res) => {
    const { errors, data } = validate(req.body || {}, null);
    if (errors) return res.status(400).json({ message: "Du lieu khong hop le", errors });

    const result = stmt.insert.run(data);
    res.status(201).json(stmt.one.get(result.lastInsertRowid));
};

// PUT /products/:id
const update = (req, res) => {
    const id = parseId(req, res);
    if (id === null) return;

    const existing = stmt.one.get(id);
    if (!existing) return res.status(404).json({ message: "Khong tim thay san pham" });

    const { errors, data } = validate(req.body || {}, existing);
    if (errors) return res.status(400).json({ message: "Du lieu khong hop le", errors });

    stmt.update.run({ ...data, id });
    res.json(stmt.one.get(id));
};

// DELETE /products/:id
const remove = (req, res) => {
    const id = parseId(req, res);
    if (id === null) return;

    const result = stmt.remove.run(id);
    if (result.changes === 0) return res.status(404).json({ message: "Khong tim thay san pham" });
    res.json({ message: "Xoa san pham thanh cong" });
};

module.exports = { getAll, getById, create, update, remove };

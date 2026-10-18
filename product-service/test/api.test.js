// Kiem thu tu dong: chay Auth Service (BTH2) o cong 3000 va Product Service o cong 3001 truoc.
// Chay: npm test
const BASE = process.env.PRODUCT_URL || "http://localhost:3001";
const AUTH = process.env.AUTH_SERVICE_URL || "http://localhost:3000";

let pass = 0, fail = 0;
function check(name, cond) {
    console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
    cond ? pass++ : fail++;
}
async function call(method, path, token, body) {
    const res = await fetch(BASE + path, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: body ? JSON.stringify(body) : undefined
    });
    return { status: res.status, body: await res.json().catch(() => null) };
}

(async () => {
    const login = await fetch(`${AUTH}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: "123456" })
    }).then(r => r.json());
    const token = login.token;
    check("Dang nhap Auth Service lay duoc token", !!token);

    check("Khong token -> 401", (await call("GET", "/products")).status === 401);
    check("Token sai -> 401", (await call("GET", "/products", "abc")).status === 401);

    const c = await call("POST", "/products", token, { name: "Laptop", description: "Laptop van phong", price: 15990000.5, quantity: 10 });
    check("POST /products -> 201", c.status === 201 && c.body.id > 0);
    const id = c.body && c.body.id;

    check("POST thieu name -> 400", (await call("POST", "/products", token, { price: 1 })).status === 400);
    check("POST gia am -> 400", (await call("POST", "/products", token, { name: "x", price: -5 })).status === 400);

    const list = await call("GET", "/products", token);
    check("GET /products -> 200 va co san pham", list.status === 200 && list.body.some(p => p.id === id));

    const one = await call("GET", `/products/${id}`, token);
    check("GET /products/:id -> 200", one.status === 200 && one.body.name === "Laptop");
    check("GET id khong ton tai -> 404", (await call("GET", "/products/999999", token)).status === 404);
    check("GET id sai dinh dang -> 400", (await call("GET", "/products/abc", token)).status === 400);

    const u = await call("PUT", `/products/${id}`, token, { name: "Laptop Pro", price: 20000000, quantity: 5 });
    check("PUT /products/:id -> 200 va da doi du lieu", u.status === 200 && u.body.name === "Laptop Pro" && u.body.quantity === 5);
    check("PUT id khong ton tai -> 404", (await call("PUT", "/products/999999", token, { name: "x", price: 1 })).status === 404);

    const d = await call("DELETE", `/products/${id}`, token);
    check("DELETE /products/:id -> 200", d.status === 200);
    check("Sau khi xoa GET -> 404", (await call("GET", `/products/${id}`, token)).status === 404);
    check("DELETE lai -> 404", (await call("DELETE", `/products/${id}`, token)).status === 404);

    console.log(`\nKet qua: ${pass} dat, ${fail} loi`);
    process.exit(fail ? 1 : 0);
})();

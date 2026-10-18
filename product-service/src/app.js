const express = require("express");
const productRoutes = require("./routes/products");

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "Product Service dang hoat dong" }));
app.use("/products", productRoutes);

// Route khong ton tai, JSON sai dinh dang, loi chung
app.use((req, res) => res.status(404).json({ message: "Khong tim thay API" }));
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ message: "JSON khong hop le" });
    }
    console.error(err);
    res.status(500).json({ message: "Loi may chu" });
});

module.exports = app;

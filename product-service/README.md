# Bài thực hành số 3 – Dịch vụ quản lý sản phẩm (Product Management)

## 1. Giới thiệu
Xây dựng **Product Service** (CRUD sản phẩm) theo kiến trúc SOA:
- Chạy **độc lập** trên cổng riêng: `http://localhost:3001`
- Có **cơ sở dữ liệu riêng** (SQLite, file `data/products.db`, tự tạo khi chạy)
- **Xác thực qua Auth Service** của bài thực hành số 2 (`http://localhost:3000`): service này không tự giải mã JWT mà chuyển tiếp header `Authorization` sang `GET /hello` của Auth Service để xác thực.

Bài 2: https://github.com/azzk3z/bth2-SOA.git

## 2. Công nghệ
Node.js (>= 18), Express 5, better-sqlite3

## 3. Cấu trúc
```
src/
  config/db.js                    # kết nối DB, tạo bảng products
  controllers/productController.js# nghiệp vụ + truy vấn dữ liệu
  middleware/authMiddleware.js    # gọi Auth Service để xác thực token
  routes/products.js              # định tuyến API
  app.js, server.js
test/api.test.js                  # kiểm thử tự động
```

## 4. Bảng products
| Cột | Kiểu | Mô tả |
|---|---|---|
| id | INT (PK, tự tăng) | ID sản phẩm |
| name | VARCHAR(255) | Tên sản phẩm |
| description | TEXT | Mô tả |
| price | DECIMAL(10,2) | Giá |
| quantity | INT | Số lượng trong kho |
| created_at | TIMESTAMP | Ngày tạo |
| updated_at | TIMESTAMP | Ngày cập nhật cuối |

## 5. API (yêu cầu `Authorization: Bearer <token>`)
| Method | Đường dẫn | Chức năng | Mã trả về |
|---|---|---|---|
| GET | /products | Danh sách sản phẩm | 200 |
| GET | /products/:id | Chi tiết sản phẩm | 200, 400, 404 |
| POST | /products | Thêm sản phẩm | 201, 400 |
| PUT | /products/:id | Cập nhật sản phẩm | 200, 400, 404 |
| DELETE | /products/:id | Xóa sản phẩm | 200, 404 |

Lỗi xác thực: `401` (thiếu/sai/hết hạn token), `503` (Auth Service chưa chạy).

Ví dụ body POST/PUT:
```json
{ "name": "Laptop", "description": "Laptop văn phòng", "price": 15990000, "quantity": 10 }
```
(PUT: trường nào không gửi sẽ giữ nguyên giá trị cũ.)

## 6. Cách chạy
1. Chạy Auth Service (bài 2) ở cổng 3000:
   ```bash
   cd bth2-SOA && npm install && node server.js
   ```
2. Chạy Product Service:
   ```bash
   cd product-service && npm install && npm start
   ```
3. Đăng nhập lấy token (Postman):
   ```
   POST http://localhost:3000/api/login
   { "username": "admin", "password": "123456" }
   ```
4. Gọi API sản phẩm với header `Authorization: Bearer <token>`.

Đổi cấu hình bằng biến môi trường: `PORT`, `AUTH_SERVICE_URL`, `DB_FILE` (xem `.env.example`).

## 7. Kiểm thử tự động
Khi cả hai service đang chạy: `npm test` (15 test case: xác thực, CRUD, dữ liệu sai, id không tồn tại).

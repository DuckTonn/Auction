# Đồ án cuối kỳ – Môn *Lập trình Ứng dụng Web*

## Trường Đại học Khoa học Tự nhiên – ĐHQG TP.HCM  
**Chuyên ngành: Kỹ Thuật Phần Mềm**

---

## Thành viên Nhóm

| STT | Họ và Tên               | MSSV      |
|-----|--------------------------|------------|
| 1   | **Nguyễn Nhật Nam**       | 23127092 |
| 2   | **Lê Quang Phúc**         | 23127102 |
| 3   | **Nguyễn Quang Đăng Khoa** | 23127212 |
| 4   | **Đỗ Thành Minh**         | 23127420 |
| 5   | **Phạm Đức Toàn**         | 23127540 |

---

## Giới thiệu Dự án

**Online Auction Platform** là một hệ thống đấu giá trực tuyến cho phép người dùng đăng ký, đăng bán sản phẩm, tham gia đấu giá, và quản lý các giao dịch. Hệ thống hỗ trợ đấu giá tự động, quản lý danh mục sản phẩm, xác thực người dùng đa nền tảng, và gửi thông báo qua email.

### Tính năng chính

- **Đăng ký & Xác thực**: Đăng ký 2 bước với OTP qua email, đăng nhập bằng JWT hoặc Social Account (Google, Github, Facebook)
- **Quản lý Sản phẩm**: Tạo, chỉnh sửa, hủy bỏ sản phẩm đấu giá với hình ảnh lưu trên Cloudinary
- **Đấu giá Tự động**: Hệ thống auto-bid, cấm bidder, mua ngay (buy-it-now)
- **Danh mục**: Quản lý danh mục sản phẩm theo cấp bậc
- **Đánh giá & Xếp hạng**: Hệ thống đánh giá người bán/mua
- **Thông báo Email**: Gửi email thông báo kết quả đấu giá, cập nhật sản phẩm
- **Cron Jobs**: Tự động kết thúc phiên đấu giá và xử lý kết quả
- **Chat**: Hệ thống chat realtime cho Q&A sản phẩm

---

## Cấu trúc Dự án

```
Online-Auction-Platform/
├── backend/          # Node.js Express API
│   ├── config/       # Configuration files (Cloudinary, Passport, System)
│   ├── controllers/  # Request handlers
│   ├── middleware/   # Auth, validation, logging
│   ├── repositories/ # Database access layer
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   └── utils/        # Utility functions
├── db/               # Database setup & seeding
│   ├── schema.js     # MongoDB schemas
│   ├── seed.js       # Seed data
│   └── updates.js    # Schema updates
├── frontend/         # React + Vite application
│   ├── public/       # Static assets
│   └── src/          # React components & pages
├── design/           # UI/UX wireframes
└── docs/             # API documentation
```

---

## Cài đặt & Chạy Dự án

### Yêu cầu hệ thống
- Node.js >= 18.x
- MongoDB >= 6.x
- npm hoặc yarn

### 1. Clone Repository

```bash
git clone <repository-url>
cd Online-Auction-Platform
```

### 2. Cài đặt Backend

```bash
cd backend
npm install
```

Tạo file `.env` từ `sample.env` và điền các thông tin cần thiết.

### 3. Khởi tạo Database

```bash
cd ../db
npm install
```

Tạo file `.env` trong thư mục `db/` (copy từ `sample.env`) và chạy:

```bash
# Tạo schema
node schema.js

# Seed dữ liệu mẫu
node seed.js
```

### 4. Cài đặt Frontend

```bash
cd ../frontend
npm install
```

Tạo file `.env` từ `sample.env`:

```env
VITE_API_URL=http://localhost:5000
```

### 5. Chạy Ứng dụng

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Ứng dụng sẽ chạy tại:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## License

This project is for educational purposes only.
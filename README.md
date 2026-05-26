🛒 Fullstack Product Management App

Ứng dụng quản lý sản phẩm Fullstack được xây dựng với NestJS + React, hỗ trợ xác thực JWT, CRUD sản phẩm, upload ảnh Cloudinary, tìm kiếm, lọc, sắp xếp và phân trang.

📌 Mục lục
Giới thiệu
Tính năng
Công nghệ sử dụng
Cấu trúc thư mục
Cài đặt và chạy dự án
Biến môi trường
API chính
Các lỗi đã xử lý
Packages quan trọng
Kết quả đạt được
📖 Giới thiệu

Dự án Fullstack Product Management App là hệ thống quản lý sản phẩm hiện đại gồm:

Backend: NestJS + TypeORM + PostgreSQL
Frontend: ReactJS
Authentication: JWT
Image Upload: Cloudinary

Hệ thống cho phép:

Đăng ký / đăng nhập người dùng
Quản lý sản phẩm đầy đủ CRUD
Upload ảnh sản phẩm
Tìm kiếm, lọc giá, sắp xếp
Phân trang dữ liệu
Bảo vệ route bằng JWT
✅ Các tính năng
🔹 Backend (NestJS + PostgreSQL)
CRUD sản phẩm
Thêm sản phẩm
Sửa sản phẩm
Xóa sản phẩm
Xem danh sách
Xem chi tiết
Xác thực JWT
Đăng ký
Đăng nhập
Bảo vệ route bằng Bearer Token
Upload ảnh lên Cloudinary
Multer
Cloudinary SDK
Hỗ trợ:
Phân trang (page, limit)
Tìm kiếm theo tên (ILIKE)
Lọc khoảng giá (minPrice, maxPrice)
Sắp xếp:
Tên A-Z / Z-A
Giá tăng / giảm
Validation dữ liệu (class-validator)
Mã hóa mật khẩu bằng bcrypt
CORS enabled
🔹 Frontend (React)
Đăng nhập / Đăng ký
Lưu JWT token bằng localStorage
CRUD sản phẩm đầy đủ
Upload ảnh sản phẩm
Giao diện đồng bộ màu vàng nâu
Skeleton loading shimmer effect
Search debounce 500ms
Lọc và sắp xếp realtime
Phân trang
Toast notification (react-hot-toast)
Route protection:
Chưa đăng nhập → chuyển hướng /login
🛠 Công nghệ sử dụng
Thành phần	Công nghệ
Backend	NestJS, TypeORM, PostgreSQL
Authentication	JWT, Passport, bcrypt
Upload ảnh	Cloudinary, Multer
Frontend	React, Axios, React Router
Notification	react-hot-toast
Validation	class-validator
Database	PostgreSQL
📁 Cấu trúc thư mục
fullstack-product-app/
├── Backend/
│   ├── src/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── jwt.strategy.ts
│   │   │
│   │   ├── users/
│   │   │   ├── user.entity.ts
│   │   │   └── users.service.ts
│   │   │
│   │   ├── products/
│   │   │   ├── product.entity.ts
│   │   │   ├── dto/
│   │   │   ├── products.controller.ts
│   │   │   └── products.service.ts
│   │   │
│   │   ├── upload/
│   │   │   └── upload.service.ts
│   │   │
│   │   ├── app.module.ts
│   │   └── main.ts
│   │
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── ProductManager.js
│   │   │   └── ProductManager.css
│   │   │
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   │
│   └── package.json
│
└── README.md
🚀 Cài đặt và chạy dự án
1️⃣ Clone project
git clone <your-repository-url>
cd fullstack-product-app
2️⃣ Chạy Backend
cd Backend
npm install
Tạo file .env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=product_db

JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=1d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
Start backend
npm run start:dev

Backend chạy tại:

http://localhost:3000
3️⃣ Chạy Frontend
cd frontend
npm install
npm start

Frontend chạy tại:

http://localhost:3001
🔐 Các API chính
Method	Endpoint	Mô tả	Auth
POST	/auth/register	Đăng ký tài khoản	❌
POST	/auth/login	Đăng nhập	❌
GET	/products	Danh sách sản phẩm	❌
GET	/products/:id	Chi tiết sản phẩm	❌
POST	/products	Thêm sản phẩm	✅ JWT
PUT	/products/:id	Cập nhật sản phẩm	✅ JWT
DELETE	/products/:id	Xóa sản phẩm	✅ JWT
POST	/products/upload/:id	Upload ảnh	✅ JWT
🔍 Query hỗ trợ cho /products
Phân trang
/products?page=1&limit=5
Tìm kiếm
/products?search=iphone
Lọc giá
/products?minPrice=100&maxPrice=500
Sắp xếp
/products?sortBy=price&order=ASC
/products?sortBy=name&order=DESC
🐞 Các lỗi đã xử lý
TypeORM where undefined
if (!username) return null;
bcrypt missing salt
Kiểm tra password trước khi hash
ValidationPipe làm mất dữ liệu body
Tạm tắt pipe
Dùng:
@Body() body: any
JWT_SECRET undefined
Kiểm tra .env
Kiểm tra ConfigModule
Cloudinary upload lỗi
Xử lý Promise đúng cách
CORS blocked
app.enableCors();
Sắp xếp không hoạt động

Frontend gửi:

ASC

Backend so sánh chữ thường:

order.toUpperCase()
react-scripts not recognized
npm install react-scripts@5.0.1
Skeleton loading
Tự viết CSS shimmer effect
Không dùng thư viện ngoài
📦 Packages quan trọng
Backend
{
  "@nestjs/typeorm": "^10",
  "typeorm": "^0.3",
  "pg": "^8",
  "@nestjs/jwt": "^10",
  "@nestjs/passport": "^10",
  "passport": "^0.7",
  "passport-jwt": "^4",
  "bcrypt": "^5",
  "cloudinary": "^2",
  "multer": "^1",
  "sharp": "^0.33",
  "class-validator": "^0.14",
  "class-transformer": "^0.5"
}
Frontend
{
  "axios": "^1",
  "react-router-dom": "^6",
  "react-hot-toast": "^2",
  "react-scripts": "5.0.1"
}
🎯 Kết quả đạt được

✅ Hệ thống hoạt động ổn định local

✅ CRUD sản phẩm đầy đủ

✅ Xác thực JWT an toàn

✅ Upload ảnh lên Cloudinary

✅ Tìm kiếm + lọc + sắp xếp + phân trang

✅ Giao diện responsive đẹp mắt

✅ Skeleton loading mượt mà

✅ Sẵn sàng deploy:

Backend → Render
Frontend → Vercel
📌 Hướng phát triển tiếp theo
Phân quyền Admin/User
Refresh Token
Dark Mode
Giỏ hàng & Thanh toán
Dashboard thống kê
Docker & CI/CD
Unit Test / E2E Test
👨‍💻 Tác giả

Thiên
Fullstack Developer Project using NestJS + React 🚀
# Seed Data Structure

Thư mục này chứa dữ liệu mẫu đã được tách riêng để dễ maintain và update.

## Cấu trúc Files

### 1. `sample-assets.data.js`
Chứa các links ảnh mẫu sử dụng cho products:
- `sampleThumbnail`: Ảnh thumbnail mặc định
- `sampleImages`: Mảng ảnh sản phẩm

### 2. `users.data.js`
Dữ liệu users mẫu bao gồm:
- 5 sellers (seller1 - seller5)
- 3 bidders (bidder1 - bidder3)
- 1 admin

**Export**: Function nhận `hashedPassword` và trả về mảng user objects

### 3. `categories.data.js`
Dữ liệu categories với cấu trúc cây:
- 3 danh mục cha: Đồ Điện Tử, Thời Trang, Nội Thất
- 3 danh mục con: Laptop, Điện Thoại, Giày Dép

**Export**: Async function nhận `Category` model và trả về object chứa các categories đã tạo

### 4. `products.data.js`
Dữ liệu products chia thành 2 loại:
- `activeProducts`: Các sản phẩm đang đấu giá
- `soldProducts`: Các sản phẩm đã bán

**Export**: Function nhận object `{ sellers, categories, assets }` và trả về object chứa 2 mảng products

### 5. `relations.data.js`
Dữ liệu quan hệ giữa các entities:
- `watchLists`: Danh sách theo dõi
- `qnas`: Câu hỏi & trả lời
- `auctionResultsData`: Function tạo kết quả đấu giá
- `ratings`: Function tạo đánh giá
- `userStatsUpdates`: Cập nhật điểm user

**Export**: Function nhận `{ users, products, auctionResults }` và trả về object chứa các dữ liệu quan hệ

## Cách sử dụng

Xem file `db/seed.js` để biết cách import và sử dụng các file data này.

## Update dữ liệu

Khi cần update dữ liệu:
1. Mở file data tương ứng
2. Chỉnh sửa hoặc thêm/xóa entries trong mảng
3. Chạy lại seed: `node db/seed.js`

## Lợi ích

- ✅ Dễ tìm và chỉnh sửa dữ liệu theo từng loại
- ✅ Tránh file seed.js quá dài và khó đọc
- ✅ Có thể tái sử dụng data cho testing
- ✅ Dễ dàng thêm dữ liệu mới mà không làm rối file chính

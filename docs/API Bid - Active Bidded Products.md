# API Bid - Active Bidded Products

- `GET /api/bids/active-bidded-products`

## 1) Base URL & Auth

- **Base URL (local):** `http://localhost:5000/api`
- **Full path:** `/bids/active-bidded-products`

## 2) Mục đích API

Trả về **danh sách sản phẩm đang ở trạng thái đấu giá `active`** mà user hiện tại đã từng bid.

Backend lấy danh sách productId từ collection `Bid` theo `user`, sau đó query các `Product` có:
- `_id` thuộc danh sách đó
- `auction_status = 'active'`

Với mỗi product, backend tính thêm `user_bid_info` dựa trên 2 map trong Product:
- `bid_counts[userId]` → số lần user đã bid trên sản phẩm đó
- `auto_bid_map[userId]` → max bid (mức bid tối đa) user đã đặt

## 3) API chi tiết

### 3.1 GET /api/bids/active-bidded-products

- **Method:** GET
- **URL:** `/api/bids/active-bidded-products`
- **Headers:**
  - `Authorization: Bearer <accessToken>`
- **Query params:** không có
- **Body:** không có

#### Response 200

```json
{
  "message": "Lấy danh sách sản phẩm đang bid thành công",
  "data": [
    {
      "_id": "<productId>",
      "product_name": "...",
      "thumbnail": "...",
      "start_price": 0,
      "bid_increment": 10000,
      "auction_start_time": "2025-12-12T00:00:00.000Z",
      "auction_end_time": "2025-12-13T00:00:00.000Z",
      "auction_status": "active",

      "current_highest_price": 123,
      "current_highest_bidder": {
        "_id": "...",
        "full_name": "...",
        "email": "...",
        "rating_score": 0,
        "rating_count": 0
      },

      "seller": {
        "_id": "...",
        "full_name": "...",
        "email": "...",
        "rating_score": 0,
        "rating_count": 0
      },
      "category": {
        "_id": "...",
        "category_name": "...",
        "slug": "..."
      },

      "user_bid_info": {
        "bid_count": 3,
        "max_bid": 500000
      },

      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

Ghi chú:
- Response là danh sách `Product` đã được `populate` các trường: `seller`, `category`, `current_highest_bidder`.
- Backend **đã loại bỏ** `auto_bid_map` khỏi output và thay bằng `user_bid_info.max_bid`.
- Một số field Map khác của Product (ví dụ `bid_counts`) có thể vẫn xuất hiện trong JSON (tuỳ `toObject()`/serialize). Frontend nên dựa vào `user_bid_info` thay vì parse Map.

#### Errors

- **401 Unauthorized** (từ `checkAuth`): thiếu token hoặc token không hợp lệ

```json
{ "message": "Không được phép. Vui lòng đăng nhập." }
```

- **403 Forbidden** (từ `checkNotAdmin`): user là admin

```json
{ "message": "Admin không được phép truy cập!" }
```

- **400 Bad Request** (từ controller catch): lỗi nghiệp vụ/hệ thống

```json
{ "message": "<error message>" }
```

## 4) Ví dụ gọi từ frontend

### 4.1 Axios (JS)

```js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export async function getActiveBiddedProducts(accessToken) {
  const res = await api.get('/bids/active-bidded-products', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data; // { message, data }
}
```

### 4.2 UI gợi ý hiển thị

- Hiển thị `product_name`, `thumbnail`, `current_highest_price`, `current_highest_bidder`, `auction_end_time`
- Hiển thị thêm cho user:
  - `user_bid_info.bid_count`
  - `user_bid_info.max_bid`
- Nếu `USER === CURRENT_HIGHEST_BIDDER`: Thêm giao diện khác với các product khác.
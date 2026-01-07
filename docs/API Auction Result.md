# API Auction Result

## 1) Thông tin chung

- **Base URL (local):** `http://localhost:5000/api`
- **Prefix:** `/auction-results`

## 2) Model & trạng thái đơn hàng

### 2.1 AuctionResult (schema chính)
Các trường quan trọng (backend trả về có thể kèm thêm `_id`, `createdAt`, `updatedAt`):

- `product` (populate): `{ _id, product_name, thumbnail }`
- `winning_bidder` (populate): `{ _id, full_name, email, rating_score, rating_count }`
- `seller` (populate): `{ _id, full_name, email, rating_score, rating_count }`
- `final_price`: number
- `status`: string enum
  - `pending_payment`: người thắng chưa gửi địa chỉ + bằng chứng thanh toán
  - `pending_shipment`: người thắng đã submit thanh toán, chờ người bán gửi hàng
  - `shipping`: người bán đã xác nhận gửi hàng
  - `completed`: người mua xác nhận đã nhận
  - `cancelled`: người bán huỷ giao dịch
- `shipping_address`: string | null
- `payment_proof`: string | null (URL ảnh Cloudinary)
- `shipping_proof`: string | null (URL ảnh Cloudinary)
- `cancellation_reason`: string | null
- `cancelled_at`: string (ISO date) | null

### 2.2 Luồng trạng thái

- `pending_payment` → (buyer) **submit payment** → `pending_shipment`
- `pending_shipment` → (seller) **confirm shipment** → `shipping`
- `shipping` → (buyer) **confirm receipt** → `completed`
- Bất kỳ trạng thái nào (trừ `completed`, `cancelled`) → (seller) **cancel transaction** → `cancelled`

## 3) Danh sách API

### 3.1 Lấy danh sách đơn hàng thắng cuộc (buyer)

- **GET** `/auction-results/winner`
- **Auth:** Yes
- **Role:** bidder/seller (không phải admin)
- **Response 200**

```json
{
  "message": "Lấy danh sách đơn hàng đấu giá thắng cuộc thành công",
  "data": [
    {
      "_id": "...",
      "product": { "_id": "...", "product_name": "...", "thumbnail": "..." },
      "seller": { "_id": "...", "full_name": "...", "email": "...", "rating_score": 0, "rating_count": 0 },
      "winning_bidder": "(có thể không được populate trong list này)",
      "final_price": 123,
      "status": "pending_payment",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

- **Lỗi thường gặp**
  - `401` nếu thiếu/invalid token
  - `403` nếu role = admin

### 3.2 Lấy danh sách đơn hàng bán được (seller)

- **GET** `/auction-results/seller`
- **Auth:** Yes
- **Response 200**

```json
{
  "message": "Lấy danh sách đơn hàng đấu giá bán thành công",
  "data": [
    {
      "_id": "...",
      "product": { "_id": "...", "product_name": "...", "thumbnail": "..." },
      "winning_bidder": { "_id": "...", "full_name": "...", "email": "...", "rating_score": 0, "rating_count": 0 },
      "final_price": 123,
      "status": "pending_shipment"
    }
  ]
}
```

### 3.3 Lấy chi tiết đơn hàng theo `orderId`

- **GET** `/auction-results/:orderId`
- **Auth:** Yes
- **Quyền truy cập:** chỉ **buyer (winning_bidder)** hoặc **seller** của đơn hàng mới xem được

- **Response 200**: trả về thẳng object AuctionResult (không wrap `message`)

```json
{
  "_id": "...",
  "product": { "_id": "...", "product_name": "...", "thumbnail": "..." },
  "winning_bidder": { "_id": "...", "full_name": "...", "email": "...", "rating_score": 0, "rating_count": 0 },
  "seller": { "_id": "...", "full_name": "...", "email": "...", "rating_score": 0, "rating_count": 0 },
  "final_price": 123,
  "status": "shipping",
  "shipping_address": "...",
  "payment_proof": "https://...",
  "shipping_proof": "https://...",
  "cancellation_reason": null,
  "cancelled_at": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

- **Error 400**
  - `"Đơn hàng không tồn tại"`
  - `"Bạn không có quyền xem đơn hàng này"`

### 3.4 Lấy đơn hàng theo `productId`

- **GET** `/auction-results/by-product/:productId`
- **Auth:** Yes
- **Quyền truy cập:** chỉ buyer hoặc seller của đơn hàng
- **Response 200:** trả về object AuctionResult
- **Error 400**
  - `"Sản phẩm đã chọn không có đơn hàng đấu giá tương ứng"`
  - `"Bạn không có quyền xem đơn hàng này"`

### 3.5 Buyer submit thanh toán

- **POST** `/auction-results/:orderId/submit-payment`
- **Auth:** Yes
- **Quyền:** chỉ buyer (winning_bidder)
- **Điều kiện trạng thái:** chỉ khi `status = pending_payment`
- **Content-Type:** `multipart/form-data`

**Form fields**
- `address` (string): địa chỉ nhận hàng
- `paymentProof` (file): ảnh bằng chứng thanh toán (**bắt buộc**)

- **Response 200:** trả về AuctionResult sau update (status sẽ thành `pending_shipment`)

- **Error 400**
  - `"Vui lòng tải lên bằng chứng thanh toán."`
  - `"Bạn không phải người thắng cuộc của sản phẩm này"`
  - `"Trạng thái đơn hàng không hợp lệ để thanh toán"`

### 3.6 Seller xác nhận đã gửi hàng

- **POST** `/auction-results/:orderId/confirm-shipment`
- **Auth:** Yes
- **Quyền:** chỉ seller
- **Điều kiện trạng thái:** chỉ khi `status = pending_shipment`
- **Content-Type:** `multipart/form-data`

**Form fields**
- `shippingProof` (file): ảnh bằng chứng vận chuyển (**bắt buộc**)

- **Response 200:** trả về AuctionResult sau update (status sẽ thành `shipping`)

- **Error 400**
  - `"Vui lòng tải lên bằng chứng vận chuyển."`
  - `"Bạn không phải người bán sản phẩm này"`
  - `"Người mua chưa thanh toán hoặc đơn hàng đã được xử lý"`

### 3.7 Buyer xác nhận đã nhận hàng

- **POST** `/auction-results/:orderId/confirm-receipt`
- **Auth:** Yes
- **Body:** không yêu cầu
- **Quyền:** chỉ buyer
- **Điều kiện trạng thái:** chỉ khi `status = shipping`

- **Response 200:** trả về AuctionResult sau update (status sẽ thành `completed`)

- **Error 400**
  - `"Không có quyền thực hiện"`
  - `"Đơn hàng chưa được gửi đi hoặc đã hoàn tất"`

### 3.8 Seller huỷ giao dịch

- **POST** `/auction-results/:orderId/cancel-transaction`
- **Auth:** Yes
- **Content-Type:** `application/json`

**Body**
```json
{ "reason": "..." }
```

- **Quyền:** chỉ seller
- **Điều kiện trạng thái:** không cho phép nếu đã `completed` hoặc `cancelled`

- **Response 200:** trả về AuctionResult sau update (status sẽ thành `cancelled`)

- **Side-effect:** backend tự động tạo rating `-1` cho bidder (nếu `reason` rỗng sẽ mặc định: `Người thắng không thanh toán`).

- **Error 400**
  - `"Bạn không có quyền huỷ đơn hàng này"`
  - `"Không thể huỷ đơn hàng đã hoàn tất hoặc đã huỷ trước đó"`

## 4) Gợi ý tích hợp frontend

### 4.1 Axios mẫu

```js
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export function setAccessToken(token) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}
```

### 4.2 Upload mẫu (submit payment)

```js
const form = new FormData();
form.append('address', address);
form.append('paymentProof', file);

await api.post(`/auction-results/${orderId}/submit-payment`, form, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

---

Nếu bạn muốn, mình có thể viết luôn wrapper service phía frontend (trong `frontend/src/services/auctionResult.service.js`) theo đúng style project hiện tại.
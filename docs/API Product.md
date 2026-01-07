# Product API Documentation

Tài liệu hướng dẫn tích hợp API Quản lý Sản phẩm.

## GHI CHÚ CHO FRONTEND
1. **Xử lý ảnh**:
    - Input: Dạng file
    - Output: Dạng text
    - Khi gọi API `/create`, nhớ set header `Content-Type` là `undefined` (nếu dùng axios) hoặc để trình duyệt tự set boundary cho `FormData`. Đừng set thủ công là `application/json`.
2. **Thời gian**: Server trả về chuẩn ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`). Frontend cần dùng thư viện (như `date-fns` hoặc `momentjs`) để format lại cho đẹp (Ví dụ: "Còn 2 ngày 5 giờ").
3. **Hướng dẫn xử lý Query Parameters**
* Nguyên tắc chung
    - Query Param luôn bắt đầu bằng dấu `?` và nối với nhau bằng dấu `&`
    - Sai: `/products/search/iphone/1` hoặc `/products/search?keyword=iphone?page=1`
    - Đúng: `/products/search?keyword=iphone&page=1`
* Gợi ý: Sử dụng Axios hỗ trợ tự động ghép chuỗi query hoặc nếu dùng `fetch` mặc định của JS, phải tự dùng Template Literal (dấu backtick `) để ghép chuỗi.
---

## Cấu hình
* **API URL**:
    * File môi trường (.env) của frontend có biết VITE_API_URL
    * API_URL của `product`: `VITE_API_URL/products`
* **Authentication**:
    * Với các API yêu cầu quyền, vui lòng gửi kèm **Access Token** vào Header.
    * Format header: `Authorization: Bearer <your_access_token>`

---

## 1. Seller Routes (Yêu cầu đăng nhập & quyền Seller)

### 1.1. Tạo sản phẩm mới (Create Product)
* **URL**: `VITE_API_URL/products/create`
* **Method**: `POST`
* **Role**: `Seller`
* **Content-Type**: `multipart/form-data` 
  > **QUAN TRỌNG**: Không gửi JSON thuần. Phải dùng `FormData` để gửi kèm file ảnh
  
  > **LƯU Ý**: 2 key `thumbnail` và `images` cần input dạng file không phải text.

#### Input (Form-Data)

| Key | Type | Required | Mô tả |
| :--- | :--- | :--- | :--- |
| `product_name` | Text | ✅ | Tên sản phẩm đầy đủ |
| `start_price` | Number | ✅ | Giá khởi điểm (VNĐ) |
| `bid_increment` | Number | ✅ | Bước giá tối thiểu mỗi lần đấu |
| `buy_it_now_price`| Number | ❌ | Giá mua ngay (Optional) |
| `thumbnail` | **File** | ✅ | Ảnh đại diện (Bắt buộc **1 file**) |
| `images` | **File** | ✅ | Ảnh chi tiết (Chọn nhiều file, tối thiểu **3 ảnh**) |
| `category` | Text | ✅ | **ID** của danh mục (ObjectId string) |
| `auction_end_time`| Text | ✅ | Thời gian kết thúc (Format ISO: `2025-12-31T23:59:00.000Z`) |
| `description` | Text | ✅ | Mô tả chi tiết (HTML hoặc Text) |
| `auto_renew` | Boolean| ❌ | Tự động gia hạn (Default: false) |

#### Output Ví dụ (JSON Success - Status: 201)
```json
{
    "message": "Tạo sản phẩm thành công!",
    "data": {
        "_id": "6927d0b500c978b0d0efb963",
        "product_name": "iPhone 15 Pro Max",
        "thumbnail": "[https://res.cloudinary.com/demo/image/upload/v1/product_thumb.jpg](https://res.cloudinary.com/demo/image/upload/v1/product_thumb.jpg)",
        "images": [
            "[https://res.cloudinary.com/demo/image/upload/v1/img1.jpg](https://res.cloudinary.com/demo/image/upload/v1/img1.jpg)",
            "[https://res.cloudinary.com/demo/image/upload/v1/img2.jpg](https://res.cloudinary.com/demo/image/upload/v1/img2.jpg)",
            "[https://res.cloudinary.com/demo/image/upload/v1/img3.jpg](https://res.cloudinary.com/demo/image/upload/v1/img3.jpg)"
        ],
        "start_price": 24000000,
        "seller": "6927d0b400c978b0d0efb943", 
        "category": "6927d0b500c978b0d0efb952",
        "createdAt": "2025-11-27T04:16:54.048Z"
    }
}
```

#### Trường hợp thất bại (JSON Failed - Status: 400): 
* Lí do: Gửi dữ liệu sai hoặc thiếu theo bảng input ở trên

### 1.2. Lấy danh sách sản phẩm của Seller hiện tại
* **URL**: `VITE_API_URL/products/seller`
* **Method**: `GET`
* **Role**: `Seller`
* **Query Params**: `?page=1 (Optional)` (Hỗ trợ lấy theo trang nếu có nhiều sản phẩm, ví dụ: có 12 sản phẩm thì trang 1 chỉ hiện thị 8/12, trang 2 hiển thị 4/12 sản phẩm còn lại)
* **Mô tả**: Lấy danh sách các sản phẩm mà user đang đăng nhập đã đăng bán

#### Input: Không cần

#### Output (JSON)
* Trả về mảng danh sách sản phẩm (Cấu trúc giống bên trên)
---

## 2. Public Routes (Không cần đăng nhập)

### 2.1. Chi tiết sản phẩm (Product Detail)
* **URL**: `VITE_API_URL/products/:id` (Ví dụ: `VITE_API_URL/products/6927d0b500c978b0d0efb963`)
* **Method**: `GET`
* **Mô tả**: Lấy thông tin chi tiết của 1 sản phẩm cụ thể.

#### Input: Không cần

#### Output (JSON Success - 200)
> Trả về 1 Object duy nhất
```json
{
    "message": "Lấy thông tin sản phẩm thành công!",
    "data": {
        "_id": "692a6bf7e651e71ecc09dce3",
        "product_name": "Samsung Galaxy S22 Ultra",
        "description": "Bút S-Pen đầy đủ, màn hình bị ám nhẹ, bán giá xác cho anh em.",
        "start_price": 8000000,
        "bid_increment": 100000,
        "thumbnail": "https://thanhnien.mediacdn.vn/uploaded/thuthao/2018_11_10/14_ZHRV.jpg",
        "images": [
            "https://cdn.tgdd.vn/Files/2020/06/22/1264873/9bestportabletechgadgetsforeverydayuse_800x450.jpg",
            "https://cdn.tgdd.vn/Files/2020/06/22/1264873/9bestportabletechgadgetsforeverydayuse_800x450.jpg",
            "https://cdn.tgdd.vn/Files/2020/06/22/1264873/9bestportabletechgadgetsforeverydayuse_800x450.jpg"
        ],
        "auction_end_time": "2025-12-01T03:43:51.208Z",
        "max_bids_per_bidder": 2,
        "bid_count": 2,
        "auto_bid_map": {
            "692a6bf5e651e71ecc09dcc5": 9000000,
            "692a6bf5e651e71ecc09dcc6": 8800000
        },
        "bid_counts": {
            "692a6bf5e651e71ecc09dcc5": 1,
            "692a6bf5e651e71ecc09dcc6": 1
        },
        "auction_status": "active",
        "auto_renew": false,
        "seller": {
            "_id": "692a6bf5e651e71ecc09dcc3",
            "full_name": "Nguyễn Văn Bán (Seller 1)"
        },
        "category": {
            "_id": "692a6bf6e651e71ecc09dcda",
            "category_name": "Điện Thoại"
        },
        "banned_bidder": [],
        "auction_start_time": "2025-11-29T03:43:51.218Z",
        "current_highest_price": 8800000,
        "current_highest_bidder": {
            "_id": "692a6bf5e651e71ecc09dcc5",
            "full_name": "Lê Văn Mua (Bidder 1)"
        }
    }
}
```

### 2.2. Các API danh sách (Homepage & Filter)
* **Mô tả**: Các API dưới đây đều trả về cấu trúc Mảng sản phẩm bên trong `data`
* **BẢNG API DANH SÁNH:**

| Chức năng | URL | Method | Query Params | Mô tả |
| :--- | :--- | :---: | :--- | :--- |
| **Top sắp hết hạn** | `VITE_API_URL/products/top-ending` | `GET` | N/A | Lấy 5 sản phẩm có thời gian kết thúc gần nhất (cho Homepage). |
| **Top giá cao nhất** | `VITE_API_URL/products/top-price` | `GET` | N/A | Lấy 5 sản phẩm đang có giá cao nhất. |
| **Top nhiều lượt bid**| `VITE_API_URL/products/top-bidded` | `GET` | N/A | Lấy 5 sản phẩm "hot" nhất (nhiều người đấu giá). |
| **Tìm kiếm** | `VITE_API_URL/products/search` | `GET` | `?keyword=...` & `page=1` | Tìm kiếm theo tên hoặc mô tả. |
| **Theo danh mục** | `VITE_API_URL/products/category/:slug` | `GET` | `?page=1` | Lấy danh sách sản phẩm thuộc 1 danh mục (kèm phân trang). |
| **Random theo DM** | `VITE_API_URL/products/category/:slug/random`| `GET` | N/A | Lấy ngẫu nhiên 5 SP cùng danh mục (dùng cho phần "Sản phẩm liên quan"). |


#### Input: Không cần

#### Output (JSON Success - 200)
> Trả về mảng các sản phẩm
```json
{
    "message": "Lấy danh sách giá cao nhất thành công",
    "data": [
        {
            "_id": "6927d0b500c978b0d0efb963",
            "product_name": "Sofa Da Bò Ý",
            "description": "Sofa nhập khẩu nguyên chiếc, da thật 100%, ngồi rất êm.",
            "start_price": 25000000,
            "bid_increment": 1000000,
            "thumbnail": "https://thanhnien.mediacdn.vn/.../14_ZHRV.jpg",
            "images": [
                "https://cdn.tgdd.vn/.../reverydayuse_800x450.jpg",
                "https://cdn.tgdd.vn/.../tsforedayuse_800x450.jpg",
                "https://cdn.tgdd.vn/.../reverydayuse_800x450.jpg"
            ],
            "auction_end_time": "2025-12-11T04:16:53.901Z",
            "max_bids_per_bidder": 2,
            "bid_count": 0,
            "auto_bid_map": {},
            "bid_counts": {},
            "auction_status": "ended",
            "auto_renew": false,
            "seller": {
                "_id": "6927d0b400c978b0d0efb943",
                "full_name": "Trần Thị Buôn (Seller 2)"
            },
            "category": {
                "_id": "6927d0b500c978b0d0efb952",
                "category_name": "Nội Thất"
            },
            "banned_bidder": [],
            "auction_start_time": "2025-11-27T04:16:53.908Z",
            "current_highest_price": 25000000
        },
        {
            "_id": "692a6bf7e651e71ecc09dce3",
            "product_name": "Samsung Galaxy S22 Ultra",
            "description": "Bút S-Pen đầy đủ, màn hình bị ám nhẹ, bán giá xác cho anh em.",
            "start_price": 8000000,
            "bid_increment": 100000,
            "thumbnail": "https://thanhnien.mediacdn.vn/uploaded/thuthao/2018_11_10/14_ZHRV.jpg",
            "images": [
                "https://cdn.tgdd.vn/Files/2020/06/22/1264873/9bestportabletechgadgetsforeverydayuse_800x450.jpg",
                "https://cdn.tgdd.vn/Files/2020/06/22/1264873/9bestportabletechgadgetsforeverydayuse_800x450.jpg",
                "https://cdn.tgdd.vn/Files/2020/06/22/1264873/9bestportabletechgadgetsforeverydayuse_800x450.jpg"
            ],
            "auction_end_time": "2025-12-01T03:43:51.208Z",
            "max_bids_per_bidder": 2,
            "bid_count": 2,
            "auto_bid_map": {
                "692a6bf5e651e71ecc09dcc5": 9000000,
                "692a6bf5e651e71ecc09dcc6": 8800000
            },
            "bid_counts": {
                "692a6bf5e651e71ecc09dcc5": 1,
                "692a6bf5e651e71ecc09dcc6": 1
            },
            "auction_status": "active",
            "auto_renew": false,
            "seller": {
                "_id": "692a6bf5e651e71ecc09dcc3",
                "full_name": "Nguyễn Văn Bán (Seller 1)"
            },
            "category": {
                "_id": "692a6bf6e651e71ecc09dcda",
                "category_name": "Điện Thoại"
            },
            "banned_bidder": [],
            "auction_start_time": "2025-11-29T03:43:51.218Z",
            "current_highest_price": 8800000,
            "current_highest_bidder": {
                "_id": "692a6bf5e651e71ecc09dcc5",
                "full_name": "Lê Văn Mua (Bidder 1)"
            }
        }
    ]
}
```
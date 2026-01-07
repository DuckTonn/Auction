# Category API Documentation

Tài liệu hướng dẫn tích hợp API Quản lý danh mục.

## Cấu hình
* **API URL**:
    * File môi trường (.env) của frontend có biết VITE_API_URL
    * API_URL của `category`: `VITE_API_URL/categories`
* **Authentication**:
    * Với các API yêu cầu quyền, vui lòng gửi kèm **Access Token** vào Header.
    * Format header: `Authorization: Bearer <your_access_token>`

---

## 1. Public Routes (Không cần đăng nhập)

### 1.1. Tất cả danh mục
* **URL**: `VITE_API_URL/categories`
* **Method**: `GET`
* **Mô tả**: Lấy tất cả danh mục

#### Input: Không cần

#### Output (JSON Success - 200)
> Trả về mảng các danh mục

> Đối với danh mục có danh mục cha sẽ được thể hiện trong biến `.parent` (=`null` tức là danh mục đó không có danh mục cha)
```json
{
    "message": "Lấy danh mục thành công!",
    "data": [
        {
            "_id": "6927d0b500c978b0d0efb95a",
            "category_name": "Giày Dép",
            "description": "Giày thể thao, giày da",
            "parent": {
                "_id": "6927d0b500c978b0d0efb950",
                "category_name": "Thời Trang"
            },
            "slug": "giay-dep",
            "__v": 0
        },
        {
            "_id": "6927d0b500c978b0d0efb954",
            "category_name": "Laptop",
            "description": "Máy tính xách tay các loại",
            "parent": {
                "_id": "6927d0b500c978b0d0efb94e",
                "category_name": "Đồ Điện Tử"
            },
            "slug": "laptop",
            "__v": 0
        },
        {
            "_id": "6927d0b500c978b0d0efb952",
            "category_name": "Nội Thất",
            "description": "Bàn ghế, tủ giường",
            "parent": null,
            "slug": "noi-that",
            "__v": 0
        },
        {
            "_id": "6927d0b500c978b0d0efb950",
            "category_name": "Thời Trang",
            "description": "Quần áo, giày dép",
            "parent": null,
            "slug": "thoi-trang",
            "__v": 0
        },
        {
            "_id": "6927d0b500c978b0d0efb957",
            "category_name": "Điện Thoại",
            "description": "Smartphones",
            "parent": {
                "_id": "6927d0b500c978b0d0efb94e",
                "category_name": "Đồ Điện Tử"
            },
            "slug": "dien-thoai",
            "__v": 0
        },
        {
            "_id": "6927d0b500c978b0d0efb94e",
            "category_name": "Đồ Điện Tử",
            "description": "Các thiết bị điện tử",
            "parent": null,
            "slug": "do-dien-tu",
            "__v": 0
        }
    ]
}
```
### 1.2. Chi tiết danh mục
* **URL**: `VITE_API_URL/categories/:id` (Ví dụ: `VITE_API_URL/categories/6927d0b500c978b0d0efb95a`)
* **Method**: `GET`
* **Mô tả**: Lấy chi tiết cụ thể 1 danh mục

#### Input: Không cần

#### Output (JSON Success - 200)
> Trả về 1 Object DUY NHẤT

> Đối với danh mục có danh mục cha sẽ được thể hiện trong biến `.parent` (=`null` tức là danh mục đó không có danh mục cha)
```json
{
    "message": "Lấy danh mục thành công!",
    "data": {
        "_id": "6927d0b500c978b0d0efb95a",
        "category_name": "Giày Dép",
        "description": "Giày thể thao, giày da",
        "parent": {
            "_id": "6927d0b500c978b0d0efb950",
            "category_name": "Thời Trang"
        },
        "slug": "giay-dep",
        "__v": 0
    }
}
```
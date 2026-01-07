# Hướng dẫn Tích hợp Quy trình Đăng Ký Mới (2 Steps)

## Thay đổi quan trọng
Hiện tại, logic chuyển sang quy trình **xác thực OTP trước khi tạo tài khoản**.

---

## User Flow Mới

Thay vì chỉ có 1 màn hình `Register`, luồng đi sẽ chia làm 2 bước logic (Frontend có thể xử lý trên cùng 1 màn hình hoặc dùng Modal):

1.  **Bước 1 (Nhập thông tin):** User điền `email`, `password`, `full_name`, `address` -> Bấm nút **"Tiếp tục"** hoặc **"Lấy mã xác thực"**.
2.  **Bước 2 (Nhập OTP):** Hệ thống gửi OTP về email. User nhập mã 6 số -> Bấm **"Đăng ký"**.

---

## API Specification

### 1. Bước 1: Yêu cầu gửi mã OTP
API này sẽ lưu tạm OTP ở backend và gửi email cho người dùng. Chưa có User nào được tạo ở bước này.

- **Endpoint:** `POST /api/auth/send-otp`
- **Body - Input:**
    ```json
    {
        "email": "nguoidung@example.com"
    }
    ```
- **Output thành công - 200:**
    ```json
    {
        "message": "OTP xác thực đã được gửi tới email của bạn."
    }
    ```
- **Output thất bại - 400:**
    ```json
    {
        "message": "Email đã tồn tại trong hệ thống!"
    }
    ```
    => Người dùng đã đăng ký bằng tài khoản này rồi - ra cảnh báo kêu người dùng đăng nhập!
### 2. Bước 2: Hoàn tất Đăng ký
Mục đích: Gửi thông tin đăng ký kèm mã OTP để backend kiểm tra và tạo tài khoản.

- **Endpoint:** `POST /api/auth/register`
- **Body - Input:**
    ```json
    {
        {
            "email": "nguoidung@example.com",
            "password": "matkhau123",
            "full_name": "Nguyen Van A",
            "address": "TP HCM",
            "otp": "123456"
        }
    }
    ```
- **Output thành công - 201:**
    ```json
    {
        "message": "Đăng ký tài khoản thành công!",
        "data": {
            "full_name": ...
            ...
        }
    }
    ```
- **Output thất bại - 400:**
    > "Mã OTP không chính xác!" -> Báo đỏ ô nhập OTP.

    > "OTP đã hết hạn!" -> Yêu cầu user bấm nút gửi lại mã (gọi lại API bước 1).
### Lưu ý Logic Frontend (Quan trọng)
1. State Management:
- Khi User bấm xong Bước 1: KHÔNG ĐƯỢC RESET FORM.
- Phải lưu các biến password, full_name, address vào State.
- Chỉ clear form hoặc redirect sang trang Login khi API Bước 2 trả về 201 Created.

2. Loading Indicator:
- API send-otp có thể mất 1-3 giây để gửi mail. Cần hiển thị Loading Spinner và disable nút bấm để tránh User spam request.

3. Resend OTP:
- Ở màn hình nhập OTP, nên có nút "Gửi lại mã". Nút này sẽ gọi lại API /api/auth/send-otp với email đang có trong state.
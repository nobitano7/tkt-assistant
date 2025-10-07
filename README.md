# Trợ lý Nghiệp vụ TKT - Hướng dẫn Cài đặt & Chạy dự án

Đây là dự án đã được cấu trúc lại với Frontend và Backend riêng biệt để đảm bảo an toàn và dễ dàng triển khai.

## Yêu cầu

-   Node.js (phiên bản 18 trở lên)
-   npm (thường đi kèm với Node.js)

## Cài đặt

### Bước 1: Cài đặt Backend

1.  Mở một cửa sổ dòng lệnh (terminal), di chuyển vào thư mục `backend`:
    ```bash
    cd backend
    ```

2.  Tạo một file có tên là `.env` trong thư mục `backend`.

3.  Mở file `.env` vừa tạo và dán Gemini API Key của bạn vào theo định dạng sau:
    ```
    API_KEY=AIzaSy...YOUR_API_KEY_HERE...
    ```

4.  Cài đặt các gói phụ thuộc:
    ```bash
    npm install
    ```

5.  Khởi động máy chủ backend:
    ```bash
    npm run dev
    ```

    Máy chủ sẽ chạy ở địa chỉ `http://localhost:3001`. **Hãy để cửa sổ terminal này chạy.**

### Bước 2: Cài đặt Frontend

1.  Mở một cửa sổ dòng lệnh (terminal) **mới**.
2.  Di chuyển vào thư mục `frontend`:
    ```bash
    cd frontend
    ```

3.  Cài đặt các gói phụ thuộc:
    ```bash
    npm install
    ```

4.  Khởi động ứng dụng frontend:
    ```bash
    npm run dev
    ```

    Ứng dụng sẽ tự động mở trong trình duyệt của bạn ở địa chỉ `http://localhost:5173` (hoặc một cổng khác nếu 5173 đã được sử dụng).

## Sử dụng

Bây giờ bạn đã có:
-   **Backend** đang chạy ở `http://localhost:3001`
-   **Frontend** đang chạy ở `http://localhost:5173`

Frontend sẽ tự động gửi yêu cầu đến backend, và bạn có thể sử dụng ứng dụng như bình thường mà không cần nhập API Key trên giao diện.
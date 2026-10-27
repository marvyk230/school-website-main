# CLB Connect — Quản lý câu lạc bộ trường học

Ứng dụng Nuxt 3 tiếng Việt để khám phá câu lạc bộ, đăng ký hoạt động và quản lý lịch sinh hoạt/điểm danh.

## Yêu cầu

- Node.js 20 trở lên
- pnpm 9

## Chạy lần đầu trên Windows

Mở PowerShell tại thư mục `app`, sau đó chạy:

```powershell
pnpm setup:local
pnpm install
pnpm exec prisma migrate deploy
pnpm db:seed
pnpm dev
```

Mở `http://localhost:3000`. Dữ liệu mặc định được lưu bằng SQLite tại `app/prisma/dev.db`; không cần tài khoản MySQL hoặc dịch vụ Sanity.

## Chia sẻ website

GitHub lưu và chia sẻ mã nguồn, không tự chạy ứng dụng Nuxt có API. Khi chỉ chạy `pnpm dev` trên máy cá nhân, người khác không thể truy cập qua Internet và website ngừng hoạt động khi máy/server dừng.

Để mọi người sử dụng API và dữ liệu ổn định trên Vercel, cần một PostgreSQL production. Project có schema/migration PostgreSQL riêng cho Neon; database SQLite local vẫn giữ nguyên.

### Triển khai lên Vercel với Neon

1. Tạo một project PostgreSQL miễn phí trên Neon. Trong Vercel, đặt **Root Directory** thành `app` và bật **Include files outside the Root Directory** nếu có.
2. Trong Neon, lấy cả pooled connection string (host thường có `-pooler`) và direct connection string. Trong Vercel → **Settings → Environment Variables**, thêm các biến sau cho **Production** (và Preview nếu cần):
   - `DATABASE_URL`: pooled Neon URL.
   - `DIRECT_URL`: direct Neon URL.
   - `NUXT_JWT_ACCESS_SECRET`: chuỗi ngẫu nhiên dài, riêng cho production.
   - `NUXT_JWT_REFRESH_SECRET`: một chuỗi ngẫu nhiên khác.
3. Build command của project `app/vercel.json` sẽ sinh Prisma Client từ schema PostgreSQL rồi build Nuxt. Redeploy sau khi lưu Environment Variables.
4. Tạo hai connection string trong PowerShell từ prompt (không gửi chúng qua chat, không đưa vào Git):

   ```powershell
   $env:DATABASE_URL = Read-Host "Paste pooled Neon connection string"
   $env:DIRECT_URL = Read-Host "Paste direct Neon connection string"
   ```

5. Từ thư mục `app`, áp dụng schema và tạo dữ liệu khởi đầu. Dùng mật khẩu admin mạnh, không dùng lại mật khẩu `123456`:

   ```powershell
   pnpm db:deploy:postgres
   $env:ADMIN_USERNAME = "viendinhhao"
   $env:ADMIN_EMAIL = "admin@example.com"
   $env:ADMIN_PASSWORD = Read-Host "Enter a new strong admin password"
   pnpm db:seed:postgres
   ```

   Lưu mật khẩu admin an toàn. Lệnh seed chỉ dùng cho database Neon mới/chưa có admin; không chạy lại để reset mật khẩu hiện có.
6. Sau khi hoàn tất, kiểm tra `/api/clubs`, `/api/activities`, đăng ký học sinh và đăng nhập trên domain Vercel.

Tất cả tài khoản, CLB, yêu cầu thành viên, thông báo, hoạt động và điểm danh sẽ dùng chung Neon database. SQLite local hiện tại không tự được sao chép lên Neon; seed tạo các CLB/hoạt động mẫu và tài khoản admin ban đầu. Chỉ chuyển thêm dữ liệu SQLite cũ nếu cần, bằng một quy trình migration riêng.

Không đưa `.env`, mật khẩu admin, connection strings, JWT secrets hoặc database vào GitHub. GitHub Pages không chạy được API/backend này.

Lệnh tạo dữ liệu mẫu tạo tài khoản quản trị và học sinh mẫu. Mật khẩu ban đầu được sinh ngẫu nhiên và ghi một lần vào `app/.admin-credentials.txt` (đã được Git ignore). Hãy đăng nhập bằng tài khoản quản trị rồi đổi mật khẩu khi triển khai cho người dùng thật. Học sinh mới có thể đăng ký tài khoản ngay trên website.

## Chức năng

- Tài khoản học sinh, đăng nhập/đăng xuất, mật khẩu băm bằng bcrypt và phiên refresh token.
- Người dùng đã đăng nhập có thể đổi mật khẩu ở liên kết trên thanh tài khoản; các phiên refresh bị thu hồi và yêu cầu đăng nhập lại.
- Trang quên mật khẩu hướng dẫn liên hệ quản trị viên; admin có thể cấp mật khẩu tạm thời dùng một lần, buộc đổi ngay sau đăng nhập.
- Vai trò quản trị viên, cán bộ phụ trách, chủ nhiệm câu lạc bộ và học sinh.
- Tra cứu câu lạc bộ; gửi yêu cầu tham gia, hủy yêu cầu hoặc rời CLB sau khi được duyệt.
- Quản trị viên phân quyền tài khoản và phân công chủ nhiệm; ban điều hành duyệt yêu cầu thành viên.
- Trang riêng cho từng câu lạc bộ với danh sách thành viên dành cho ban quản lý, hoạt động và thông báo chỉ hiển thị với thành viên đã được duyệt.
- Tạo, cập nhật, xóa CLB.
- Lập lịch hoạt động; học sinh đăng ký hoặc hủy đăng ký.
- Xem danh sách đăng ký và điểm danh; giới hạn thao tác theo vai trò.
- Dữ liệu nằm trong SQLite và được dùng chung giữa các tài khoản trên cùng máy chủ.

## Cấu hình

`app/.env.example` là mẫu cho cài đặt mới. Tạo `app/.env` với `DATABASE_URL`, `JWT_ACCESS_TOKEN_SECRET` và `JWT_REFRESH_TOKEN_SECRET`; hai khóa JWT phải khác nhau và đủ ngẫu nhiên. Không đưa `.env`, file thông tin đăng nhập hoặc database chứa dữ liệu thật vào Git.

Sau khi cập nhật Prisma schema và thêm migration, áp dụng migration bằng:

```powershell
pnpm exec prisma migrate deploy
```

Nên sao lưu `app/prisma/dev.db` trước khi cập nhật schema hoặc chuyển dữ liệu.

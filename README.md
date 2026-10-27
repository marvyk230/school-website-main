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

Để mọi người truy cập công khai, hãy đẩy mã nguồn lên repository GitHub rồi triển khai ứng dụng Nuxt lên hosting hỗ trợ Node.js. Ứng dụng dùng API và SQLite, vì vậy hosting phải có ổ đĩa bền vững để giữ database (ví dụ VPS hoặc dịch vụ hỗ trợ persistent disk); hosting web tĩnh/GitHub Pages không chạy được phần API và database này. Không đưa `.env`, mật khẩu admin hay database lên GitHub. Trước khi mở công khai, hãy đổi mật khẩu quản trị mặc định và đặt JWT secrets riêng trong cấu hình bảo mật của hosting.

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

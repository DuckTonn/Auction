const mongoose = require('mongoose');
const connectDB = require('./connect'); // Import hàm kết nối
const { User } = require('./schema'); // Import model User

const runUpdates = async () => {
  try {
    // 1. Kết nối DB
    await connectDB();
    console.log("--- Đã kết nối MongoDB! ---");

    // Lấy 1 user từ DB để làm ví dụ
    // Chúng ta sẽ cập nhật user "Nguyễn Anh Dũng" (buyer1 từ file seed)
    const emailToUpdate = "dung.nguyen@example.com";

    // --- CÁCH 1: DÙNG `findOneAndUpdate` (Phổ biến nhất) ---
    // Cách này tìm và cập nhật trong 1 lệnh duy nhất
    console.log(`\n--- 1. Đang cập nhật cho ${emailToUpdate} (Cách 1) ---`);

    const newData = {
      phone_number: "0909123456", // Thêm SĐT mới
      date_of_birth: new Date("1995-10-20") // Cập nhật ngày sinh
    };

    const updatedUser = await User.findOneAndUpdate(
      { email: emailToUpdate }, // 1. Điều kiện tìm (tìm user có email này)
      { $set: newData },        // 2. Dữ liệu mới (cập nhật các trường này)
      { new: true }             // 3. Tùy chọn: Trả về document MỚI (sau khi đã update)
    );

    if (updatedUser) {
      console.log("Cập nhật thành công (Cách 1):");
      console.log(updatedUser);
    } else {
      console.log(`Không tìm thấy user với email: ${emailToUpdate}`);
    }


    // --- CÁCH 2: DÙNG `findOne` RỒI `doc.save()` ---
    // Cách này gồm 2 bước: 1. Tìm, 2. Lưu
    // Nó linh hoạt hơn và kích hoạt các "middleware" (hooks) của Mongoose
    console.log(`\n--- 2. Đang cập nhật cho "Phạm Hoài An" (Cách 2) ---`);
    const emailToUpdate2 = "an.pham@example.com";

    // 2a. Tìm document
    const userToUpdate = await User.findOne({ email: emailToUpdate2 });

    if (userToUpdate) {
      // 2b. Thay đổi giá trị (trực tiếp trên object)
      userToUpdate.full_name = "Phạm Hoài An (Đã đổi tên)";
      userToUpdate.phone_number = "0888999777";

      // 2c. Lưu lại document vào DB
      const savedUser = await userToUpdate.save();

      console.log("Cập nhật thành công (Cách 2):");
      console.log(savedUser);
    } else {
      console.log(`Không tìm thấy user với email: ${emailToUpdate2}`);
    }


  } catch (error) {
    console.error("Lỗi trong quá trình cập nhật:", error);
  } finally {
    // 3. Luôn ngắt kết nối sau khi xong
    await mongoose.disconnect();
    console.log("\n--- Đã ngắt kết nối MongoDB. ---");
  }
};

// Chạy hàm
runUpdates();
import dotenv from 'dotenv';
dotenv.config();

import nodemailer from "nodemailer";

// Cấu hình Transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const maskName = (name) => {
  if (!name || typeof name !== 'string') return 'u***r'; 

  // Lọc bỏ phần trong ngoặc () và khoảng trắng thừa
  const cleanName = name.split('(')[0].trim();
  
  if (!cleanName) return 'u***r';

  const chars = Array.from(cleanName);
  const len = chars.length;

  if (len === 1) {
      return `${chars[0]}***${chars[0]}`;
  }

  // CÔNG THỨC EBAY: Ký tự đầu + *** + Ký tự cuối
  const first = chars[0];
  const last = chars[len - 1];
  const middleLength = Math.min(len - 2, 6); 
  const middle = "*".repeat(middleLength);
  
  return `${first}${middle}${last}`;
};

async function sendMailBase({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"Online Auction" <${process.env.MAIL_USER}>`, 
      to: to, 
      subject: subject,
      html: html
    });
    console.log(`Mail sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Gửi mail thất bại đến ${to}:`, error);
  }
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export async function sendOtp(email, otp) {
  return sendMailBase({
    to: email,
    subject: "Mã xác thực OTP - Online Auction",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #167bffff; color: white; padding: 20px; text-align: center;">
          <h2>Xác thực tài khoản</h2>
        </div>
        <div style="padding: 20px;">
          <p>Mã OTP của bạn là: <strong style="font-size: 1.5em; color: #c0341d;">${otp}</strong></p>
          <p>Mã có hiệu lực trong 10 phút. Tuyệt đối không chia sẻ mã này.</p>
        </div>
      </div>
    `
  });
}

export async function notifyNewBidToSeller(sellerEmail, productName, newPrice, bidderName, productLink) {
  const maskBidderName = maskName(bidderName);

  return sendMailBase({
    to: sellerEmail,
    subject: `[Thông báo] Sản phẩm "${productName}" có lượt ra giá mới`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #167bffff; color: white; padding: 20px; text-align: center;">
          <h2>Sản phẩm <strong>${productName}</strong> của bạn vừa nhận được lượt ra giá mới.</h2>
        </div>
        <div style="padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p>Người đặt: <strong>${maskBidderName}</strong></p>
            <p style="margin: 5px 0; color: #666;">Giá hiện tại:</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #167bffff;">
                ${formatCurrency(newPrice)}
            </p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
              <center>
                <a href="${productLink}" style="background-color: #167bffff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Xem chi tiết sản phẩm
                </a>
              </center>
          </div>
        </div>
      </div>
    `
  });
}

export async function notifyBidSuccess(bidderEmail, productName, holderName, bidderPrice, currentPrice, productLink) {
  const maskHolderName = maskName(holderName);

  return sendMailBase({
    to: bidderEmail,
    subject: `[Xác nhận] Bạn đã ra giá thành công cho "${productName}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #06b231ff; color: white; padding: 20px; text-align: center;">
          <h2>Bạn đã đặt giá thành công cho sản phẩm <strong>${productName}</strong>.</h2>
        </div>
        <div style="padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #666;">Giá đặt của bạn:</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #167bffff;">
                ${formatCurrency(bidderPrice)}
            </p>
            <p style="margin: 5px 0; color: #666;">Giá hiện tại:</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #167bffff;">
                ${formatCurrency(currentPrice)}
            </p>
            <p>Người giữ giá hiện tại: <strong>${maskHolderName}</strong></p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <center>
              <a href="${productLink}" style="background-color: #06b231ff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Theo dõi sản phẩm
              </a>
            </center>
          </div>
        </div>
      </div>
    `
  });
}

export async function notifyHolder(holderEmail, productName, currentPrice, top1Email, productLink) {
  const isStillWinning = holderEmail === top1Email;

    // Cấu hình nội dung dựa trên trạng thái
    let subject = '';
    let title = '';
    let message = '';
    let color = '';
    let actionText = '';

    if (isStillWinning) {
        // VẪN LÀ NGƯỜI GIỮ GIÁ
        subject = `[Cập nhật] Giá sản phẩm "${productName}" vừa thay đổi`;
        title = 'Hệ thống đấu giá tự động';
        color = '#17a2b8';
        message = `
            <p>Đã có người ra giá mới cho sản phẩm này.</p>
            <p>Tuy nhiên, hệ thống <strong>Đấu giá tự động</strong> đã giúp bạn nâng mức giá lên để tiếp tục dẫn đầu.</p>
            <p>Hãy chú ý theo dõi phiên đấu giá nhé!</p>
        `;
        actionText = 'Xem chi tiết sản phẩm';
    } else {
        // BỊ VƯỢT GIÁ
        subject = `[CẢNH BÁO] Bạn đã bị vượt giá món "${productName}"`;
        title = 'Bạn không còn là người giữ giá cao nhất!';
        color = '#dc3545';
        message = `
            <p>Rất tiếc, một người dùng khác đã đặt mức giá cao hơn bạn.</p>
            <p>Để sở hữu sản phẩm này, bạn cần ra mức giá mới ngay lập tức.</p>
        `;
        actionText = 'Đấu giá lại ngay';
    }

    return sendMailBase({
        to: holderEmail,
        subject: subject,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: ${color}; color: white; padding: 20px; text-align: center;">
                    <h2 style="margin: 0;">${title}</h2>
                </div>

                <div style="padding: 20px;">
                    <h3 style="color: #333;">Sản phẩm: ${productName}</h3>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0; color: #666;">Giá hiện tại:</p>
                        <p style="margin: 0; font-size: 24px; font-weight: bold; color: ${color};">
                            ${formatCurrency(currentPrice)}
                        </p>
                    </div>

                    <div style="color: #444; line-height: 1.6;">
                        ${message}
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${productLink}" style="background-color: ${color}; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                            ${actionText}
                        </a>
                    </div>
                </div>
            </div>
        `
    });
}

export async function notifyBidRejected(bidderEmail, productName) {
    return sendMailBase({
        to: bidderEmail,
        subject: `[Thông báo] Quyền đấu giá bị từ chối: ${productName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
                    <h2 style="margin: 0;">Người bán đã từ chối quyền tham gia đấu giá của bạn</h2>
                </div>

                <div style="padding: 20px;">
                    <h3 style="color: #333;">Sản phẩm: ${productName}</h3>

                    <div style="color: #444; line-height: 1.6;">
                        Các lượt ra giá trước đó của bạn (nếu có) đã bị vô hiệu hóa.
                    </div>
                </div>
            </div>
        `
    });
}

export async function notifyAuctionWinner(winnerEmail, productName, finalPrice, checkoutLink) {
    return sendMailBase({
        to: winnerEmail,
        subject: `CHÚC MỪNG! BẠN ĐÃ THẮNG SẢN PHẨM: ${productName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
                <div style="background-color: #28a745; color: white; padding: 30px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">CHÚC MỪNG BẠN!</h1>
                </div>
                
                <div style="padding: 30px;">
                    <p style="font-size: 16px; color: #333;">Xin chào,</p>
                    <p style="font-size: 16px; color: #333;">Bạn đã xuất sắc trở thành người thắng cuộc trong phiên đấu giá sản phẩm:</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
                        <h3 style="margin: 0 0 10px 0; color: #000;">${productName}</h3>
                        <p style="margin: 0; color: #666;">Mức giá đấu thành công</p>
                        <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: bold; color: #28a745;">${formatCurrency(finalPrice)}</p>
                    </div>

                    <p style="color: #666; text-align: center; margin-bottom: 30px;">
                        Bước cuối cùng: Vui lòng hoàn tất thủ tục thanh toán và cung cấp địa chỉ giao hàng.
                    </p>

                    <div style="text-align: center;">
                        <a href="${checkoutLink}" style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
                            THANH TOÁN & NHẬN HÀNG NGAY
                        </a>
                    </div>
                </div>
                
                <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #888;">
                    Cảm ơn bạn đã tham gia đấu giá tại AuctionHub.
                </div>
            </div>
        `
    });
}

export async function notifyBidUnBan(bidderEmail, productName, productLink) {
    return sendMailBase({
        to: bidderEmail,
        subject: `[Thông báo] Bạn đã được khôi phục quyền đấu giá: ${productName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
                    <h2 style="margin: 0;">Quyền đấu giá đã được khôi phục</h2>
                </div>

                <div style="padding: 20px;">
                    <h3 style="color: #333;">Sản phẩm: ${productName}</h3>

                    <div style="color: #444; line-height: 1.6;">
                        <p>Người bán đã khôi phục quyền tham gia đấu giá của bạn.</p>
                        <p>Bạn có thể tiếp tục ra giá cho sản phẩm này.</p>
                    </div>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${productLink}" style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                            XEM SẢN PHẨM
                        </a>
                    </div>
                </div>
            </div>
        `
    });
}

export async function notifyAuctionEndedSold(sellerEmail, productName, winnerName, finalPrice, productLink) {
    return sendMailBase({
        to: sellerEmail,
        subject: `[KẾT THÚC] Sản phẩm "${productName}" đã được bán!`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
                    <h2 style="margin: 0;">ĐẤU GIÁ THÀNH CÔNG</h2>
                </div>

                <div style="padding: 25px;">
                    <p>Chào bạn,</p>
                    <p>Phiên đấu giá sản phẩm <strong>"${productName}"</strong> của bạn đã kết thúc thành công</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px 0; color: #666;">Người mua:</td>
                            <td style="padding: 10px 0; font-weight: bold; text-align: right;">${winnerName}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px 0; color: #666;">Giá chốt:</td>
                            <td style="padding: 10px 0; font-weight: bold; text-align: right; color: #28a745; font-size: 18px;">${formatCurrency(finalPrice)}</td>
                        </tr>
                    </table>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${productLink}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            Xem chi tiết giao dịch
                        </a>
                    </div>
                </div>
            </div>
        `
    });
}

export async function notifyAuctionEndedNoBid(sellerEmail, productName, productLink) {
    return sendMailBase({
        to: sellerEmail,
        subject: `[KẾT THÚC] Sản phẩm "${productName}" không có người mua`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #6c757d; color: white; padding: 20px; text-align: center;">
                    <h2 style="margin: 0;">KẾT THÚC KHÔNG NGƯỜI MUA</h2>
                </div>

                <div style="padding: 25px; text-align: center;">
                    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                        Rất tiếc, phiên đấu giá sản phẩm <strong>"${productName}"</strong> đã kết thúc nhưng chưa có lượt ra giá nào.
                    </p>
                    
                    <div style="background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; font-size: 14px;">
                        💡 <strong>Mẹo:</strong> Hãy thử điều chỉnh giá khởi điểm thấp hơn hoặc bổ sung hình ảnh hấp dẫn hơn khi đăng lại.
                    </div>

                    <a href="${productLink}" style="display: inline-block; margin-top: 15px; color: #007bff; text-decoration: none;">
                        Xem lại sản phẩm →
                    </a>
                </div>
            </div>
        `
    });
}

export async function notifyNewQuestion(sellerEmail, productName, questionContent, productLink) {
    return sendMailBase({
        to: sellerEmail,
        subject: `Câu hỏi mới về sản phẩm: ${productName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #17a2b8; color: white; padding: 15px 25px;">
                    <h3 style="margin: 0;">Bạn có câu hỏi mới!</h3>
                </div>
                
                <div style="padding: 25px;">
                    <p>Khách hàng quan tâm đến sản phẩm <strong>"${productName}"</strong> vừa gửi một câu hỏi:</p>
                    
                    <div style="background-color: #f8f9fa; border-left: 4px solid #17a2b8; padding: 15px; font-style: italic; color: #555; margin: 20px 0;">
                        "${questionContent}"
                    </div>

                    <p>Việc trả lời nhanh chóng sẽ tăng khả năng chốt đơn của bạn.</p>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${productLink}" style="background-color: #17a2b8; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            Xem chi tiết sản phẩm
                        </a>
                    </div>
                </div>
            </div>
        `
    });
}

export async function notifyNewAnswer(recipientsEmails, productName, questionContent, answerContent, productLink) {
    return sendMailBase({
        to: recipientsEmails,
        subject: `[Cập nhật] Người bán đã trả lời về: ${productName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #17a2b8; color: white; padding: 15px 25px;">
                    <h3 style="margin: 0;">Người bán đã trả lời!</h3>
                </div>
                
                <div style="padding: 25px;">
                    <p>Sản phẩm <strong>"${productName}"</strong> có câu trả lời mới từ người bán:</p>
                    
                    <div style="background-color: #f8f9fa; border-left: 4px solid #6c757d; padding: 15px; font-style: italic; color: #555; margin: 20px 0;">
                        <strong>Câu hỏi:</strong> "${questionContent}"
                    </div>

                    <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; color: #155724; margin: 20px 0;">
                        <strong>Trả lời:</strong> ${answerContent}
                    </div>

                    <p>Hãy xem chi tiết để theo dõi thêm thảo luận về sản phẩm này.</p>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${productLink}" style="background-color: #17a2b8; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            Xem chi tiết sản phẩm
                        </a>
                    </div>
                </div>
            </div>
        `
    });
}

export async function notifyAuctionCancelledToSeller(sellerEmail, productName) {
    return sendMailBase({
        to: sellerEmail,
        subject: `[HỦY ĐẤU GIÁ] "${productName}" đã bị hủy đấu giá`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
                    <h2 style="margin: 0;">PHIÊN ĐẤU GIÁ BỊ HỦY</h2>
                </div>

                <div style="padding: 24px;">
                    <p style="color: #333;">Phiên đấu giá cho sản phẩm: <strong>${productName}</strong> đã bị hủy</p>
                    <div style="background-color: #fff3cd; color: #856404; padding: 12px 16px; border-radius: 6px; margin: 16px 0;">
                        Mọi thắc mắc của bạn xin vui lòng liên hệ quản trị viên để được giải đáp.
                    </div>
                </div>
            </div>
        `
    });
}
export async function notifyAuctionCancelled(bidderEmail, productName) {
    return sendMailBase({
        to: bidderEmail,
        subject: `[HỦY ĐẤU GIÁ] "${productName}" đã bị hủy đấu giá`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
                    <h2 style="margin: 0;">PHIÊN ĐẤU GIÁ BỊ HỦY</h2>
                </div>

                <div style="padding: 24px;">
                    <p style="color: #333;">Phiên đấu giá cho sản phẩm: <strong>${productName}</strong> đã bị hủy</p>
                    <div style="background-color: #fff3cd; color: #856404; padding: 12px 16px; border-radius: 6px; margin: 16px 0;">
                        Mọi lượt ra giá trước đó của bạn (nếu có) đã bị vô hiệu hóa. Bạn sẽ không bị tính bất kỳ khoản phí nào.
                    </div>
                </div>
            </div>
        `
    });
}

export async function notifyUpgradeApproved(userEmail) {
    return sendMailBase({
        to: userEmail,
        subject: `[Thông báo]: Nâng cấp tài khoản thành công`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
                    <h2 style="margin: 0;">NÂNG CẤP TÀI KHOẢN THÀNH CÔNG</h2>
                </div> 
                <div style="padding: 25px;">
                    <p style="font-size: 16px; color: #333;">Xin chào,</p>
                    <p style="font-size: 16px; color: #333;">Chúng tôi rất vui thông báo rằng tài khoản của bạn đã được nâng cấp thành công lên vai trò Người bán (Seller).</p>
                    <p style="font-size: 16px; color: #333;">Bây giờ bạn có thể tạo và quản lý các sản phẩm đấu giá của riêng mình trên nền tảng của chúng tôi.</p>
                    <p style="font-size: 16px; color: #333;">Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi!</p>
                </div>
            </div>
        `
    });
}

export async function notifyUpgradeRejected(userEmail) {
    return sendMailBase({
        to: userEmail,
        subject: `[Thông báo]: Yêu cầu nâng cấp tài khoản`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
                    <h2 style="margin: 0;">YÊU CẦU NÂNG CẤP BỊ TỪ CHỐI</h2>
                </div> 
                <div style="padding: 25px;">
                    <p style="font-size: 16px; color: #333;">Xin chào,</p>
                    <p style="font-size: 16px; color: #333;">Chúng tôi rất tiếc phải thông báo rằng yêu cầu nâng cấp tài khoản của bạn lên vai trò Người bán (Seller) đã bị từ chối.</p>
                    <p style="font-size: 16px; color: #333;">Nếu bạn có bất kỳ thắc mắc nào hoặc cần thêm thông tin, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi.</p>
                    <p style="font-size: 16px; color: #333;">Cảm ơn bạn đã quan tâm đến dịch vụ của chúng tôi!</p>
                </div>
            </div>
        `
    });
}

export async function notifyRatingReceived(userEmail, raterName, score, comment, productName) {
    const maskRaterName = maskName(raterName);
    return sendMailBase({
        to: userEmail,
        subject: `[Thông báo]: Bạn vừa nhận được đánh giá mới từ ${maskRaterName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #ffc107; color: white; padding: 20px; text-align: center;">
                    <h2 style="margin: 0;">ĐÁNH GIÁ MỚI NHẬN ĐƯỢC</h2>
                </div> 
                <div style="padding: 25px;">
                    <p style="font-size: 16px; color: #333;">Xin chào,</p>
                    <p style="font-size: 16px; color: #333;">Bạn vừa nhận được một đánh giá mới cho giao dịch sản phẩm <strong>"${productName}"</strong> từ người dùng <strong>${maskRaterName}</strong>.</p>
                    <p style="font-size: 16px; color: #333;">Điểm đánh giá: <strong>${score} / 5</strong></p>
                    <p style="font-size: 16px; color: #333;">Bình luận:</p>
                    <div style="background-color: #f8f9fa; border-left: 4px solid #ffc107; padding: 15px; color: #555; margin: 10px 0;">
                        ${comment}
                    </div>
                </div>
            </div>
        `
    });
}

// Gửi mail thông báo mật khẩu của bạn đã được quản trị viên đặt lại mật khẩu mặt định là password123
export async function notifyPasswordReset(userEmail, temporaryPassword) {
    return sendMailBase({
        to: userEmail,
        subject: `[Thông báo]: Mật khẩu của bạn đã được quản trị viên đặt lại`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #17a2b8; color: white; padding: 20px; text-align: center;">
                    <h2 style="margin: 0;">MẬT KHẨU ĐÃ ĐƯỢC ĐẶT LẠI</h2>
                </div>
                <div style="padding: 25px;">
                    <p style="font-size: 16px; color: #333;">Xin chào,</p>
                    <p style="font-size: 16px; color: #333;">Mật khẩu tài khoản của bạn đã được quản trị viên đặt lại.</p>
                    <p style="font-size: 16px; color: #333;">Mật khẩu tạm thời của bạn là: <strong>${temporaryPassword}</strong></p>
                    <p style="font-size: 16px; color: #333;">Vui lòng đăng nhập và thay đổi mật khẩu ngay để bảo vệ tài khoản của bạn.</p>
                </div>
            </div>
        `
    });
}

// Email thông báo mô tả sản phẩm bạn giữ giá bị thay đổi
export async function notifyProductDescriptionUpdate(bidderEmail, productName, newDescription, productLink) {
    return sendMailBase({
        to: bidderEmail,
        subject: `[Thông báo]: Mô tả sản phẩm "${productName}" đã bị thay đổi`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #ffc107; color: white; padding: 20px; text-align: center;">
                    <h2 style="margin: 0;">MÔ TẢ SẢN PHẨM ĐÃ THAY ĐỔI</h2>
                </div>
                <div style="padding: 25px;">
                    <p style="font-size: 16px; color: #333;">Xin chào,</p>
                    <p style="font-size: 16px;
                    
                    color: #333;">Mô tả của sản phẩm <strong>"${productName}"</strong> mà bạn đang giữ giá đã được người bán cập nhật.</p> 
                    <h4 style="color: #333;">Mô tả mới:</h4>
                    <div style="background-color: #f8f9fa; border-left: 4px solid #28a745; padding: 15px; color: #555; margin: 10px 0;">
                        ${newDescription}
                    </div>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${productLink}" style="background-color: #ffc107; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            XEM SẢN PHẨM
                        </a>
                    </div>
                </div>
            </div>
        `
    });
}
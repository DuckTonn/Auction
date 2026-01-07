import dotenv from 'dotenv';
dotenv.config(); 

import * as mailService from './services/email.service.js';


const TARGET_EMAIL = '<testmail>@gmail.com'; // Thay bằng email của bạn để test
const PRODUCT_LINK = 'http://localhost:3000/products/iphone-15-pro-max';


const mockData = {
    productName: 'iPhone 13 Pro Max 256GB VN/A',
    price: 28500000,
    bidderName: 'Nguyễn Văn A',
    winnerName: 'Trần Thị B',
    otp: '888666',
    question: 'Máy còn bảo hành chính hãng không shop ơi?',
    answer: 'Chào bạn, máy còn bảo hành đến tháng 10/2026 nhé.'
};

async function runDemo() {
    try {
        console.log('5️⃣  Đang test: notifyBidRejected...');
        await mailService.notifyBidRejected(TARGET_EMAIL, mockData.productName);
        console.log('   ✅ Done.');
    } catch (error) {
        console.error('\n❌ Có lỗi xảy ra trong quá trình test:');
        console.error(error);
    }
}

async function runTest() {
    console.log(`🚀 Bắt đầu test gửi mail đến: ${TARGET_EMAIL}\n`);

    try {
        console.log('1️⃣  Đang test: sendOtp...');
        await mailService.sendOtp(TARGET_EMAIL, mockData.otp);
        console.log('   ✅ Done.');

        console.log('2️⃣  Đang test: notifyNewBidToSeller...');
        await mailService.notifyNewBidToSeller(TARGET_EMAIL, mockData.productName, mockData.price, mockData.bidderName, PRODUCT_LINK);
        console.log('   ✅ Done.');

        console.log('3️⃣  Đang test: notifyBidSuccess...');
        await mailService.notifyBidSuccess(TARGET_EMAIL, mockData.productName, mockData.winnerName, mockData.price, mockData.price + 100000, PRODUCT_LINK);
        console.log('   ✅ Done.');

        console.log('4️⃣  Đang test: notifyOutbid...');
        await mailService.notifyHolder(TARGET_EMAIL, mockData.productName, mockData.price + 500000, TARGET_EMAIL, PRODUCT_LINK);
        console.log('   ✅ Done.');

        console.log('5️⃣  Đang test: notifyBidRejected...');
        await mailService.notifyBidRejected(TARGET_EMAIL, mockData.productName);
        console.log('   ✅ Done.');

        console.log('6️⃣  Đang test: notifyAuctionWinner...');
        await mailService.notifyAuctionWinner(TARGET_EMAIL, mockData.productName, mockData.price, PRODUCT_LINK + '/checkout');
        console.log('   ✅ Done.');

        console.log('7️⃣  Đang test: notifyAuctionEndedSold...');
        await mailService.notifyAuctionEndedSold(TARGET_EMAIL, mockData.productName, mockData.winnerName, mockData.price, PRODUCT_LINK);
        console.log('   ✅ Done.');

        console.log('8️⃣  Đang test: notifyAuctionEndedNoBid...');
        await mailService.notifyAuctionEndedNoBid(TARGET_EMAIL, mockData.productName, PRODUCT_LINK);
        console.log('   ✅ Done.');

        console.log('9️⃣  Đang test: notifyNewQuestion...');
        await mailService.notifyNewQuestion(TARGET_EMAIL, mockData.productName, mockData.question, PRODUCT_LINK);
        console.log('   ✅ Done.');

        console.log('🔟 Đang test: notifyNewAnswer...');
        const recipients = [TARGET_EMAIL]; 
        await mailService.notifyNewAnswer(recipients, mockData.productName, mockData.question, mockData.answer, PRODUCT_LINK);
        console.log('   ✅ Done.');

        console.log('\n🎉 --- HOÀN TẤT TOÀN BỘ TEST ---');
        console.log('👉 Hãy kiểm tra hộp thư của bạn (cả mục Spam/Promotions)');

    } catch (error) {
        console.error('\n❌ Có lỗi xảy ra trong quá trình test:');
        console.error(error);
    }
}

// Chạy test
runTest();
//runDemo();
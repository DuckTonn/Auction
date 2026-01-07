// query.js
const mongoose = require('mongoose');
const connectDB = require('./connect');
const {
  User,
  Product,
  Bid,
  WatchList,
  Category,
  QnA,
  Rating,
  UpgradeRequest,
  AuctionResult,
  DeletionHistory,
  RefreshToken
} = require('./schema');

const runQueries = async () => {
  try {
    await connectDB();

    console.log('--- Dang lay du lieu goc (seed data) de test ---');
    const product1 = await Product.findOne({ product_name: "Macbook Pro 2019 (Cũ)" });
    const product5 = await Product.findOne({ product_name: "Laptop Dell XPS 13" });
    const buyer1 = await User.findOne({ email: "dung.nguyen@example.com" });
    const seller1 = await User.findOne({ email: "quang.tran@example.com" });
    
    if (!product1 || !product5 || !buyer1 || !seller1) {
      console.error('LOI: Khong tim thay du lieu seed. Ban da chay "node seed.js" (phien ban ten that) chua?');
      return;
    }
    console.log('Lay du lieu goc thanh cong.\n');


    // --- 1. Query thong tin san pham (Populate Seller & Category) ---
    console.log('--- 1. Query thong tin san pham (Populate Seller & Category) ---');
    const populatedProduct = await Product.findById(product1._id)
                                          .populate('seller_id', 'full_name email')
                                          .populate('category_id', 'category_name');

    if (populatedProduct) {
      console.log('Ten san pham:', populatedProduct.product_name);
      console.log('Ten nguoi ban:', populatedProduct.seller_id.full_name);
      console.log('Email nguoi ban:', populatedProduct.seller_id.email);
      console.log('Ten danh muc:', populatedProduct.category_id.category_name);
    }

    // --- 2. Query tat ca Bid cho san pham (Populate User) ---
    console.log('\n--- 2. Query tat ca Bid cho san pham (Populate User) ---');
    const bids = await Bid.find({ product_id: product5._id })
                          .populate('user_id', 'full_name');

    console.log(`Da tim thay ${bids.length} bid cho san pham "${product5.product_name}":`);
    bids.forEach(bid => {
      console.log(`  - Gia: ${bid.price.toLocaleString('vi-VN')} VND, boi: ${bid.user_id.full_name}`);
    });

    // --- 3. Query WatchList cua mot User (Populate Product) ---
    console.log('\n--- 3. Query WatchList cua mot User (Populate Product) ---');
    const userWatchList = await WatchList.find({ user_id: buyer1._id })
                                         .populate('product_id', 'product_name start_price');
                                         
    console.log(`Watchlist cua ${buyer1.full_name}:`);
    userWatchList.forEach(item => {
      console.log(`  - San pham: ${item.product_id.product_name}`);
      console.log(`    Gia khoi diem: ${item.product_id.start_price.toLocaleString('vi-VN')} VND`);
    });

    // --- 4. Query QnA cua san pham (Populate Asker & Answerer) ---
    console.log('\n--- 4. Query QnA cua san pham (Populate Asker & Answerer) ---');
    const qnaList = await QnA.find({ product_id: product1._id })
                             .populate('asker_id', 'full_name')
                             .populate('answerer_id', 'full_name');
    
    console.log(`Cac cau hoi cho "${product1.product_name}":`);
    qnaList.forEach(qna => {
      console.log(`  - [HOI] ${qna.asker_id.full_name}: ${qna.question_content}`);
      if (qna.answer_content) {
        console.log(`  - [DAP] ${qna.answerer_id.full_name}: ${qna.answer_content}`);
      } else {
        console.log('  - [DAP] (Chua co tra loi)');
      }
    });

    // --- 5. Query tat ca Rating cua Seller (Populate Rater) ---
    console.log('\n--- 5. Query tat ca Rating cua Seller (Populate Rater) ---');
    const ratings = await Rating.find({ rated_user_id: seller1._id })
                                .populate('rater_id', 'full_name');

    console.log(`Cac danh gia cho ${seller1.full_name}:`);
    ratings.forEach(rating => {
      console.log(`  - ${rating.rater_id.full_name} (${rating.rating_type} sao): "${rating.comment}"`);
    });

    // --- 6. Query (Admin) tim UpgradeRequest dang "pending" ---
    console.log('\n--- 6. Query (Admin) tim UpgradeRequest dang "pending" ---');
    const pendingUpgrades = await UpgradeRequest.find({ status: 'pending' })
                                                .populate('user_upgrade_id', 'full_name email');

    console.log(`Cac yeu cau dang cho duyet: ${pendingUpgrades.length}`);
    pendingUpgrades.forEach(req => {
      console.log(`  - User: ${req.user_upgrade_id.full_name} (${req.user_upgrade_id.email})`);
    });

    // --- 7. Query (Aggregation) tinh Rating trung binh cua Seller ---
    console.log('\n--- 7. Query (Aggregation) tinh Rating trung binh cua Seller ---');
    const avgRatingResult = await Rating.aggregate([
      {
        $match: { rated_user_id: seller1._id }
      },
      {
        $group: {
          _id: '$rated_user_id',
          averageRating: { $avg: '$rating_type' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    if (avgRatingResult.length > 0) {
      console.log(`  - Danh gia trung binh: ${avgRatingResult[0].averageRating.toFixed(1)} sao`);
      console.log(`  - Tong so danh gia: ${avgRatingResult[0].totalRatings}`);
    } else {
      console.log(`  - Seller nay chua co danh gia nao.`);
    }

    // --- 8. Query chi tiet AuctionResult (Populate Product & Winner) ---
    console.log('\n--- 8. [MOI] Query chi tiet AuctionResult (Populate Product & Winner) ---');
    const result = await AuctionResult.findOne({ product_id: product1._id })
                                       .populate('product_id', 'product_name')
                                       .populate('winning_bidder_id', 'full_name email');
    if (result) {
      console.log(`  - San pham: ${result.product_id.product_name}`);
      console.log(`  - Nguoi thang: ${result.winning_bidder_id.full_name} (${result.winning_bidder_id.email})`);
      console.log(`  - Gia cuoi: ${result.final_price.toLocaleString('vi-VN')} VND`);
      console.log(`  - Tinh trang thanh toan: ${result.payment_status}`);
    }

    // --- 9. Query (Admin) xem DeletionHistory (Populate Admin & User) ---
    console.log('\n--- 9. [MOI] Query (Admin) xem DeletionHistory (Populate Admin & User) ---');
    const deletions = await DeletionHistory.find({})
                                          .populate('deleter_id', 'full_name')
                                          .populate('user_deleted_id', 'email');
    
    console.log(`Cac tai khoan da bi xoa: ${deletions.length}`);
    deletions.forEach(del => {
      console.log(`  - User: ${del.user_deleted_id.email} (bi xoa boi: ${del.deleter_id.full_name})`);
    });


  } catch (error) {
    console.error('Loi khi query:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDa ngat ket noi MongoDB.');
  }
};

runQueries();
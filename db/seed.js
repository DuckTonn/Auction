const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./connect');
const {
  User,
  UpgradeRequest,
  WatchList,
  Category,
  Product,
  Bid,
  QnA,
  AuctionResult,
  Rating,
  RefreshToken,
  ChatMessage,
  OtpModel,
} = require('./schema');

// Import dữ liệu từ các file đã tách
const getUsersData = require('./data/seeds/users.data');
const getCategoriesData = require('./data/seeds/categories.data');
const getProductsData = require('./data/seeds/products.data');
const getRelationsData = require('./data/seeds/relations.data');
const sampleAssets = require('./data/seeds/sample-assets.data');

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🔌 Đã kết nối MongoDB...');

    // --- 1. DỌN DẸP DỮ LIỆU CŨ ---
    console.log('🧹 Đang xóa dữ liệu cũ...');
    try { await User.collection.drop(); } catch(e) {}
    try { await Category.collection.drop(); } catch(e) {}
    try { await Product.collection.drop(); } catch(e) {}
    try { await Bid.collection.drop(); } catch(e) {}
    try { await WatchList.collection.drop(); } catch(e) {}
    try { await QnA.collection.drop(); } catch(e) {}
    try { await AuctionResult.collection.drop(); } catch(e) {} 
    try { await Rating.collection.drop(); } catch(e) {}
    try { await UpgradeRequest.collection.drop(); } catch(e) {}
    try { await RefreshToken.collection.drop(); } catch(e) {}
    try { await ChatMessage.collection.drop(); } catch(e) {}
    try { await OtpModel.collection.drop(); } catch(e) {}

    console.log('✅ Đã xóa dữ liệu và index cũ.');

    // --- 2. CHUẨN BỊ MẬT KHẨU HASH ---
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    // --- 3. TẠO USERS ---
    console.log('👤 Đang tạo Users...');
    const usersData = getUsersData(hashedPassword);
    const [seller1, seller2, seller3, seller4, seller5, bidder1, bidder2, bidder3, admin] = await User.create(usersData);

    // --- 4. TẠO CATEGORIES ---
    console.log('📂 Đang tạo Categories...');
    const categories = await getCategoriesData(Category);

    // --- 5. TẠO PRODUCTS ---
    console.log('📦 Đang tạo Products...');
    
    const createList = async (dataList) => {
        for (const item of dataList) {
            const { description, ...otherFields } = item;
            const productData = {
                ...otherFields,
                description_history: [{
                    content: `<p>${description}</p>`, 
                    timestamp: new Date()
                }]
            };
            await Product.create(productData);
        }
    };

    // Lấy dữ liệu products
    const sellers = { seller1, seller2, seller3, seller4, seller5 };
    const bidders = { bidder1, bidder2, bidder3 };
    const { activeProducts, soldProducts } = getProductsData({ sellers, categories, assets: sampleAssets, bidders });

    console.log('Đang seed Active Products...');
    await createList(activeProducts);

    console.log('Đang seed Sold Products...');
    await createList(soldProducts);

    // --- 6. TẠO WATCHLIST ---
    console.log('🔄 Đang lấy lại ID sản phẩm từ DB...');
    const currentActiveProducts = await Product.find({ auction_status: 'active' });
    
    // --- 7. TẠO AUCTION RESULTS (Đơn hàng) ---
    console.log('🔄 Đang lấy danh sách sản phẩm ĐÃ BÁN từ DB...');
    const dbSoldProducts = await Product.find({ auction_status: 'sold' });
    
    // Lấy dữ liệu quan hệ
    const users = { seller1, seller2, bidder1, bidder2, bidder3 };
    const relationsData = getRelationsData({ users, products: currentActiveProducts, auctionResults: [] });

    // --- 6.5. TẠO BIDS THÔNG QUA LOGIC ĐẤU GIÁ ---
    console.log('💰 Đang tạo Bids thông qua logic đấu giá...');
    
    // Helper function để random thứ tự bidders
    const shuffleArray = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
    
    // Helper function để tạo bids cho 1 product
    const createBidsForProduct = async (product, productData) => {
      const { start_price, bid_increment } = productData;
      const allBidders = [bidder1, bidder2, bidder3];
      let bidCount = 0;
      
      // Random thứ tự bidders cho 5 lượt đấu giá - đảm bảo không trùng liên tiếp
      const bidSequence = [];
      let lastBidder = null;
      for (let i = 0; i < 5; i++) {
        let availableBidders = lastBidder 
          ? allBidders.filter(b => b._id.toString() !== lastBidder._id.toString())
          : allBidders;
        
        const shuffled = shuffleArray(availableBidders);
        const selectedBidder = shuffled[0];
        bidSequence.push(selectedBidder);
        lastBidder = selectedBidder;
      }
      
      // Tạo đúng 5 lượt đấu giá với logic đơn giản hơn
      for (let i = 0; i < 5; i++) {
        const bidder = bidSequence[i];
        const bidPrice = start_price + (bid_increment * (i + 1));
        const userIdStr = bidder._id.toString();
        
        // Lượt đầu tiên
        if (i === 0) {
          product.current_highest_price = start_price;
          product.current_highest_bidder = bidder._id;
          product.bid_count = 1;
          product.bid_counts.set(userIdStr, 1);
          product.auto_bid_map.set(userIdStr, bidPrice);
          
          await product.save();
          
          await Bid.create({
            user: bidder._id,
            product: product._id,
            price: start_price,
            date: new Date(Date.now() - (5 - i) * 60 * 60 * 1000)
          });
          bidCount++;
        } else {
          // Các lượt sau: luôn thắng vì giá cao hơn
          const currentHolderId = product.current_highest_bidder;
          const currentHolderMaxBid = product.auto_bid_map.get(currentHolderId.toString()) || 0;
          
          product.current_highest_bidder = bidder._id;
          product.current_highest_price = Math.min(bidPrice, currentHolderMaxBid + bid_increment);
          product.bid_count += 1;
          product.bid_counts.set(userIdStr, (product.bid_counts.get(userIdStr) || 0) + 1);
          product.auto_bid_map.set(userIdStr, bidPrice);
          
          await product.save();
          
          await Bid.create({
            user: bidder._id,
            product: product._id,
            price: product.current_highest_price,
            date: new Date(Date.now() - (5 - i) * 60 * 60 * 1000)
          });
          bidCount++;
        }
      }
      
      return bidCount;
    };
    
    // Tạo bids cho tất cả products (giờ đều là active)
    let totalBids = 0;
    const allProducts = await Product.find();
    for (const product of allProducts) {
      // Skip tạo bids cho Laptop HP Pavilion 15 (ended, không có người đấu giá)
      if (product.product_name === "Laptop HP Pavilion 15") {
        console.log(`   ⏭️ Skip tạo bids cho "${product.product_name}" (ended, no bids)`);
        continue;
      }
      const count = await createBidsForProduct(product, product);
      totalBids += count;
    }
    
    console.log(`✅ Đã tạo ${totalBids} bids!`);

    // --- 6.6. CHỌN 9 SẢN PHẨM ĐỂ CHUYỂN THÀNH 'SOLD' VÀ TẠO AUCTION RESULTS ---
    console.log('🔄 Đang chọn 9 sản phẩm để chuyển thành sold...');
    
    // Tìm 9 sản phẩm theo tên cụ thể (các sản phẩm trước đây là soldProducts)
    const productNamesToSell = [
      "Sony PlayStation 5",
      "Sony PlayStation 5 Digital Edition",
      "Sony PlayStation 5 God of War Bundle",
      "Sony PlayStation 5 Slim",
      "Sony PlayStation 5 Disc Edition",
      "Sony PlayStation 5 Spider-Man Edition",
      "Loa Bluetooth Marshall",
      "Bàn Làm Việc Gỗ Cao Su 1m2",
      "iPhone 14 Plus 128GB Blue"
    ];
    
    const productsToSell = await Product.find({ 
      product_name: { $in: productNamesToSell } 
    });
    
    // Chuyển trạng thái sang 'sold'
    for (const product of productsToSell) {
      product.auction_status = 'sold';
      await product.save();
      console.log(`   ✅ Đã chuyển "${product.product_name}" sang sold`);
    }
    
    // Tạo WatchList
    const activeProductsForWatch = await Product.find({ auction_status: 'active' });
    if (activeProductsForWatch.length > 0) {
      console.log('👀 Đang tạo WatchLists...');
      const relationsDataForWatch = getRelationsData({ users, products: activeProductsForWatch, auctionResults: [] });
      await WatchList.create(relationsDataForWatch.watchLists);
    } else {
      console.log('⚠️ Không tìm thấy Active Product nào để tạo WatchList');
    }

    // Tạo Auction Results dựa trên current_highest_bidder và current_highest_price
    let auctionResults = [];
    if (productsToSell.length > 0) {
      console.log('🏆 Đang tạo Auction Results...');
      
      const auctionResultsData = productsToSell.map((product, index) => {
        // Map status theo thứ tự như cũ, thêm cho 5 sản phẩm mới
        const statuses = [
          'completed',           // Sony PlayStation 5
          'completed',           // Sony PlayStation 5 Digital Edition
          'completed',           // Sony PlayStation 5 God of War Bundle
          'completed',           // Sony PlayStation 5 Slim
          'completed',           // Sony PlayStation 5 Disc Edition
          'completed',           // Sony PlayStation 5 Spider-Man Edition
          'pending_payment',     // Loa Bluetooth Marshall
          'pending_shipment',    // Bàn Làm Việc Gỗ Cao Su 1m2
          'shipping'             // iPhone 14 Plus 128GB Blue
        ];
        const shippingAddresses = [
          "123 Đường A, Đà Nẵng",
          "456 Đường B, Quận 3, TP.HCM",
          "789 Đường C, Quận 1, TP.HCM",
          "321 Đường D, Quận 7, TP.HCM",
          "654 Đường E, Hải Phòng",
          "987 Đường F, Cần Thơ",
          null,
          "456 Đường B, Quận 1, TP.HCM",
          "789 Đường C, Quận 7, TP.HCM"
        ];
        const paymentProofs = [
          "https://thuvienvector.vn/wp-content/uploads/2025/03/anh-chuyen-khoan-thanh-cong-Techcombank-01.jpg",
          "https://thuvienvector.vn/wp-content/uploads/2025/03/anh-chuyen-khoan-thanh-cong-Techcombank-01.jpg",
          "https://thuvienvector.vn/wp-content/uploads/2025/03/anh-chuyen-khoan-thanh-cong-Techcombank-01.jpg",
          "https://thuvienvector.vn/wp-content/uploads/2025/03/anh-chuyen-khoan-thanh-cong-Techcombank-01.jpg",
          "https://thuvienvector.vn/wp-content/uploads/2025/03/anh-chuyen-khoan-thanh-cong-Techcombank-01.jpg",
          "https://thuvienvector.vn/wp-content/uploads/2025/03/anh-chuyen-khoan-thanh-cong-Techcombank-01.jpg",
          null,
          "https://thuvienvector.vn/wp-content/uploads/2025/03/anh-chuyen-khoan-thanh-cong-Techcombank-01.jpg",
          "https://thuvienvector.vn/wp-content/uploads/2025/03/anh-chuyen-khoan-thanh-cong-Techcombank-01.jpg"
        ];
        const shippingProofs = [
          "https://file.hstatic.net/200000472237/file/cach-kiem-tra-don-hang-7_cc2b5854a2bb4277a70c90adb64a9cda.jpg",
          "https://file.hstatic.net/200000472237/file/cach-kiem-tra-don-hang-7_cc2b5854a2bb4277a70c90adb64a9cda.jpg",
          "https://file.hstatic.net/200000472237/file/cach-kiem-tra-don-hang-7_cc2b5854a2bb4277a70c90adb64a9cda.jpg",
          "https://file.hstatic.net/200000472237/file/cach-kiem-tra-don-hang-7_cc2b5854a2bb4277a70c90adb64a9cda.jpg",
          "https://file.hstatic.net/200000472237/file/cach-kiem-tra-don-hang-7_cc2b5854a2bb4277a70c90adb64a9cda.jpg",
          "https://file.hstatic.net/200000472237/file/cach-kiem-tra-don-hang-7_cc2b5854a2bb4277a70c90adb64a9cda.jpg",
          null,
          null,
          "https://file.hstatic.net/200000472237/file/cach-kiem-tra-don-hang-7_cc2b5854a2bb4277a70c90adb64a9cda.jpg"
        ];
        
        const result = {
          product: product._id,
          winning_bidder: product.current_highest_bidder,
          seller: product.seller,
          final_price: product.current_highest_price,
          status: statuses[index]
        };
        
        if (shippingAddresses[index]) result.shipping_address = shippingAddresses[index];
        if (paymentProofs[index]) result.payment_proof = paymentProofs[index];
        if (shippingProofs[index]) result.shipping_proof = shippingProofs[index];
        
        console.log(`   📦 ${product.product_name}: Winner = ${product.current_highest_bidder}, Price = ${product.current_highest_price.toLocaleString()}đ`);
        
        return result;
      });
      
      auctionResults = await AuctionResult.create(auctionResultsData);
      console.log('✅ Tạo Auction Results thành công!');
    } else {
      console.log('⚠️ Không tìm thấy sản phẩm nào để tạo kết quả.');
    }

    // --- 8. TẠO RATINGS & UPDATE USER STATS ---
    if (auctionResults.length > 0) {
      console.log('⭐ Đang tạo Ratings...');
      const ratingsData = relationsData.ratings(auctionResults);
      const createdRatings = await Rating.create(ratingsData);
      console.log(`✅ Đã tạo ${createdRatings.length} ratings!`);

      // Tính toán điểm số User dựa trên ratings đã tạo
      console.log('📊 Đang cập nhật điểm User...');
      const userRatingMap = new Map();
      
      for (const rating of createdRatings) {
        const userId = rating.rated_user.toString();
        if (!userRatingMap.has(userId)) {
          userRatingMap.set(userId, { totalScore: 0, count: 0 });
        }
        const userStats = userRatingMap.get(userId);
        userStats.totalScore += rating.rating_type;
        userStats.count += 1;
      }
      
      // Cập nhật vào database
      for (const [userId, stats] of userRatingMap) {
        await User.findByIdAndUpdate(userId, { 
          rating_score: stats.totalScore, 
          rating_count: stats.count 
        });
        console.log(`   ✅ User ${userId}: ${stats.totalScore} điểm từ ${stats.count} ratings`);
      }
    }

    // --- 9. TẠO QnA ---
    const finalActiveProducts = await Product.find({ auction_status: 'active' });
    if (finalActiveProducts.length > 0) {
      console.log('❓ Đang tạo QnAs...');
      const relationsDataForQnA = getRelationsData({ users, products: finalActiveProducts, auctionResults: [] });
      await QnA.create(relationsDataForQnA.qnas);
      console.log('✅ Tạo QnA thành công!');
    } else {
      console.log('⚠️ Không có Active Product để tạo QnA.');
    }

    console.log('✅ Xong tất cả!');

    console.log('✨ --- TẠO DỮ LIỆU MẪU THÀNH CÔNG --- ✨');

  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu mẫu:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Đã ngắt kết nối MongoDB.');
  }
};

seedDatabase();
module.exports = ({ users, products, auctionResults }) => {
  const { seller1, bidder1, bidder2, bidder3 } = users;

  return {
    // WatchList data
    watchLists: [
      { user: bidder1._id, product: products[0]._id },
      { user: bidder1._id, product: products[4] ? products[4]._id : products[0]._id },
      { user: bidder2._id, product: products[1] ? products[1]._id : products[0]._id },
      { user: seller1._id, product: products[6] ? products[6]._id : products[0]._id },
    ],

    // QnA data - Chỉ tạo nếu có products
    qnas: products.length > 0 ? [
      {
        product: products[0]._id,
        asker: bidder1._id,
        question_content: "Máy có bị trầy xước gì không shop?",
        answerer: seller1._id,
        answer_content: "Máy đẹp keng như mới bạn nhé.",
        answer_timestamp: new Date()
      },
      {
        product: products[6] ? products[6]._id : products[0]._id,
        asker: bidder2._id,
        question_content: "Shop có hỗ trợ vận chuyển lên chung cư không?",
      }
    ] : [],

    // Auction Results data - Dùng để tạo đơn hàng cho sold products
    auctionResultsData: (soldProducts) => [
      {
        product: soldProducts[0]._id,
        winning_bidder: bidder1._id,
        seller: seller1._id,
        final_price: 12000000,
        status: 'completed',
        shipping_address: "123 Đường A, Đà Nẵng",
        payment_proof: "https://thuvienvector.vn/wp-content/uploads/2025/03/anh-chuyen-khoan-thanh-cong-Techcombank-01.jpg",
        shipping_proof: "https://file.hstatic.net/200000472237/file/cach-kiem-tra-don-hang-7_cc2b5854a2bb4277a70c90adb64a9cda.jpg"
      },
      {
        product: soldProducts[1] ? soldProducts[1]._id : soldProducts[0]._id,
        winning_bidder: bidder2._id,
        seller: soldProducts[1] ? soldProducts[1].seller : seller1._id,
        final_price: 6000000,
        status: 'pending_payment',
      },
      {
        product: soldProducts[2] ? soldProducts[2]._id : soldProducts[0]._id,
        winning_bidder: bidder1._id,
        seller: soldProducts[2] ? soldProducts[2].seller : seller1._id,
        final_price: 3500000,
        status: 'pending_shipment',
        shipping_address: "456 Đường B, Quận 1, TP.HCM",
        payment_proof: "https://thuvienvector.vn/wp-content/uploads/2025/03/anh-chuyen-khoan-thanh-cong-Techcombank-01.jpg"
      },
      {
        product: soldProducts[3] ? soldProducts[3]._id : soldProducts[0]._id,
        winning_bidder: bidder2._id,
        seller: soldProducts[3] ? soldProducts[3].seller : seller1._id,
        final_price: 20000000,
        status: 'shipping',
        shipping_address: "789 Đường C, Quận 7, TP.HCM",
        payment_proof: "https://thuvienvector.vn/wp-content/uploads/2025/03/anh-chuyen-khoan-thanh-cong-Techcombank-01.jpg",
        shipping_proof: "https://file.hstatic.net/200000472237/file/cach-kiem-tra-don-hang-7_cc2b5854a2bb4277a70c90adb64a9cda.jpg"
      }
    ],

    // Ratings data - Phụ thuộc vào auction results
    ratings: (auctionResults) => {
      if (!auctionResults || auctionResults.length === 0) return [];
      
      const ratingsData = [];
      
      // Random rating comments
      const positiveComments = [
        "Shop uy tín, máy ngon!",
        "Sản phẩm đẹp, đóng gói cẩn thận!",
        "Giao hàng nhanh, shop nhiệt tình!",
        "Chất lượng tốt như mô tả!",
        "Rất hài lòng, sẽ ủng hộ tiếp!"
      ];
      
      const negativeComments = [
        "Sản phẩm không như mô tả.",
        "Giao hàng chậm quá.",
        "Thái độ shop không tốt.",
        "Máy có trầy xước mà không báo trước.",
        "Không đóng gói cẩn thận."
      ];
      
      const positiveCommentsForBidder = [
        "Khách chuyển khoản nhanh, very good.",
        "Buyer tốt, thanh toán đúng hạn!",
        "Khách dễ tính, giao dịch nhanh gọn!",
        "Người mua uy tín, recommend!",
        "Giao dịch suôn sẻ, khách nice!"
      ];
      
      const negativeCommentsForBidder = [
        "Khách chậm trễ thanh toán.",
        "Không nhận hàng đúng hẹn.",
        "Liên lạc khó khăn.",
        "Trả giá sau khi thắng đấu giá.",
        "Thái độ không tốt."
      ];
      
      // Tạo ratings cho từng auction result
      auctionResults.forEach((result, index) => {
        // Chỉ tạo rating cho completed (đơn hàng đã hoàn tất)
        if (result.status === 'completed') {
          // Random rating type: -1 hoặc 1
          const ratingFromWinner = Math.random() < 0.2 ? -1 : 1;
          const ratingFromSeller = Math.random() < 0.3 ? -1 : 1;
          
          // Rating từ winner về seller
          const winnerComments = ratingFromWinner === 1 ? positiveComments : negativeComments;
          ratingsData.push({
            rater: result.winning_bidder,
            rated_user: result.seller,
            auction_result: result._id,
            rating_type: ratingFromWinner,
            comment: winnerComments[Math.floor(Math.random() * winnerComments.length)]
          });
          
          // Rating từ seller về winner
          const sellerComments = ratingFromSeller === 1 ? positiveCommentsForBidder : negativeCommentsForBidder;
          ratingsData.push({
            rater: result.seller,
            rated_user: result.winning_bidder,
            auction_result: result._id,
            rating_type: ratingFromSeller,
            comment: sellerComments[Math.floor(Math.random() * sellerComments.length)]
          });
        }
      });
      
      return ratingsData;
    },

    // User stats updates - Sẽ được tính toán động trong seed.js
    userStatsUpdates: []
  };
};

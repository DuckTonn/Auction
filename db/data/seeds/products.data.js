module.exports = ({ sellers, categories, assets, bidders }) => {
  const { seller1, seller2, seller3, seller4, seller5 } = sellers;
  const { bidder1, bidder2 } = bidders || {};
  const { catElectronics, catLaptop, catPhone, catShoes, catFashion, catFurniture } = categories;

  return {
    activeProducts: [
      {
        product_name: "MacBook Pro 14 M1 2021 – Likenew 99%",
        description: "Máy còn mới 99%, pin sạc ít lần, đầy đủ phụ kiện zin theo máy.",
        start_price: 20000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        seller: seller5._id,
        category: catLaptop._id,
        thumbnail: assets.laptop.thumbnail,
        images: assets.laptop.images
      },
      {
        product_name: "MacBook Pro 16 M1 Max 2022 – Bản cao cấp",
        description: "Hiệu năng cực mạnh, phù hợp cho designer, editor.",
        start_price: 22000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        seller: seller5._id,
        category: catLaptop._id,
        thumbnail: assets.laptop.thumbnail,
        images: assets.laptop.images
      },
      {
        product_name: "MacBook Air M1 2023 – Mỏng nhẹ tiện dụng",
        description: "Thiết kế mỏng nhẹ, pin trâu, phù hợp sinh viên.",
        start_price: 18000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        seller: seller5._id,
        category: catLaptop._id,
        thumbnail: assets.laptop.thumbnail,
        images: assets.laptop.images
      },
      {
        product_name: "MacBook Pro 14 M2 2024 – Máy đẹp như mới",
        description: "Chip M2 mạnh mẽ, màn hình XDR siêu đẹp.",
        start_price: 24000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        seller: seller5._id,
        category: catLaptop._id,
        thumbnail: assets.laptop.thumbnail,
        images: assets.laptop.images
      },
      {
        product_name: "MacBook Air M2 2025 – Siêu mỏng nhẹ",
        description: "Máy rất ít sử dụng, ngoại hình không tì vết.",
        start_price: 19000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catLaptop._id,
        thumbnail: assets.laptop.thumbnail,
        images: assets.laptop.images
      },
      {
        product_name: "MacBook Pro 16 M3 2026 – Hàng fullbox",
        description: "Hiệu năng vô đối, phù hợp dân chuyên nghiệp.",
        start_price: 26000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catLaptop._id,
        thumbnail: assets.laptop.thumbnail,
        images: assets.laptop.images
      },
      {
        product_name: "MacBook Pro 13 M3 2027 – Like new",
        description: "Máy sử dụng văn phòng nhẹ nhàng, máy đẹp.",
        start_price: 21000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catLaptop._id,
        thumbnail: assets.laptop.thumbnail,
        images: assets.laptop.images
      },
      {
        product_name: "MacBook Air M3 2028 – Chính hãng VN/A",
        description: "Hàng ít dùng, pin cực ngon.",
        start_price: 20000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        seller: seller3._id,
        category: catLaptop._id,
        thumbnail: assets.laptop.thumbnail,
        images: assets.laptop.images
      },
      {
        product_name: "MacBook Pro 14 M2 Pro 2029 – Gần như mới",
        description: "Máy không trầy xước, cấu hình mạnh mẽ.",
        start_price: 25000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        seller: seller3._id,
        category: catLaptop._id,
        thumbnail: assets.laptop.thumbnail,
        images: assets.laptop.images
      },
      {
        product_name: "MacBook Pro 13 Intel 2020 – Máy văn phòng",
        description: "Máy chạy mượt, phù hợp dân văn phòng.",
        start_price: 16000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catLaptop._id,
        thumbnail: assets.laptop.thumbnail,
        images: assets.laptop.images
      },
      {
        product_name: "iPhone 13 Pro Max 256GB – Xanh Sierra",
        description: "Bản 256GB màu xanh, trầy nhẹ ở viền, cam kết chưa sửa chữa.",
        start_price: 15000000,
        bid_increment: 200000,
        buy_it_now_price: 18000000,
        auction_end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catPhone._id,
        thumbnail: assets.phone.thumbnail,
        images: assets.phone.images
      },
      {
        product_name: "Laptop Dell XPS 13 – Màn 4K cảm ứng",
        description: "Dòng doanh nhân mỏng nhẹ, màn hình 4K cảm ứng cực đẹp.",
        start_price: 18000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catLaptop._id,
        thumbnail: assets.laptop.thumbnail,
        images: assets.laptop.images
      },
      {
        product_name: "Samsung Galaxy S22 Ultra – Bút S-Pen đầy đủ",
        description: "Bút S-Pen đầy đủ, màn hình bị ám nhẹ, bán giá xác.",
        start_price: 8000000,
        bid_increment: 100000,
        auction_end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catPhone._id,
        thumbnail: assets.phone.thumbnail,
        images: assets.phone.images
      },
      {
        product_name: "Đồng Hồ Rolex Submariner – Cấm Newbie",
        description: "Chỉ dành cho người có uy tín cao.",
        start_price: 100000000,
        bid_increment: 2000000,
        auction_end_time: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        seller: seller2._id,
        category: catFashion._id,
        thumbnail: assets.fashion.thumbnail,
        images: assets.fashion.images,
        allow_newbie: false
      },
      {
        product_name: "Nike Air Jordan 1 – Size 42, Auth 100%",
        description: "Hàng auth bao check, size 42, mới đi lướt 2 lần.",
        start_price: 3000000,
        bid_increment: 100000,
        auction_end_time: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        seller: seller2._id,
        category: catShoes._id,
        thumbnail: assets.shoes.thumbnail,
        images: assets.shoes.images
      },
      {
        product_name: "Adidas Ultraboost – Fullbox Size 40",
        description: "Chạy bộ cực êm, size 40, full box.",
        start_price: 1500000,
        bid_increment: 50000,
        auction_end_time: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        seller: seller2._id,
        category: catShoes._id,
        thumbnail: assets.shoes.thumbnail,
        images: assets.shoes.images
      },
      {
        product_name: "Sofa Da Bò Ý – Cao Cấp Nhập Khẩu",
        description: "Sofa nhập khẩu nguyên chiếc, da thật 100%, ngồi rất êm.",
        start_price: 25000000,
        bid_increment: 1000000,
        auction_end_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        seller: seller2._id,
        category: catFurniture._id,
        thumbnail: assets.furniture.thumbnail,
        images: assets.furniture.images
      },
      {
        product_name: "Bàn Ăn Gỗ Sồi 6 Ghế – Hàng cao cấp",
        description: "Gỗ sồi nga tự nhiên đã qua xử lý mối mọt.",
        start_price: 5000000,
        bid_increment: 200000,
        auction_end_time: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        seller: seller2._id,
        category: catFurniture._id,
        thumbnail: assets.furniture.thumbnail,
        images: assets.furniture.images
      },
      {
        product_name: "Giày Tây Da Cá Sấu – Handmade Size 41",
        description: "Hàng thủ công handmade, size 41, lịch lãm sang trọng.",
        start_price: 4000000,
        bid_increment: 100000,
        buy_it_now_price: 6000000,
        auction_end_time: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        seller: seller2._id,
        category: catShoes._id,
        thumbnail: assets.shoes.thumbnail,
        images: assets.shoes.images
      },
      {
        product_name: "Tủ Quần Áo Gỗ Công Nghiệp 4 Cánh – Màu Trắng",
        description: "Tủ 4 cánh, màu trắng hiện đại, tháo lắp dễ dàng.",
        start_price: 2000000,
        bid_increment: 50000,
        auction_end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        seller: seller2._id,
        category: catFurniture._id,
        thumbnail: assets.furniture.thumbnail,
        images: assets.furniture.images
      },
      // --- 10 SẢN PHẨM BỔ SUNG ---
      {
        product_name: "iPad Pro M2 12.9 inch 2024 – Bản 256GB",
        description: "iPad Pro màn hình lớn, hiệu năng mạnh mẽ với chip M2, màn hình Liquid Retina XDR tuyệt đẹp.",
        start_price: 22000000,
        bid_increment: 500000,
        buy_it_now_price: 27000000,
        auction_end_time: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        seller: seller3._id,
        category: catElectronics._id,
        thumbnail: assets.electronics.thumbnail,
        images: assets.electronics.images
      },
      {
        product_name: "Samsung Galaxy Z Fold 5 – Fullbox chưa kích hoạt",
        description: "Điện thoại gập cao cấp, fullbox nguyên seal chưa kích hoạt, màu Phantom Black.",
        start_price: 28000000,
        bid_increment: 1000000,
        auction_end_time: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        seller: seller3._id,
        category: catPhone._id,
        thumbnail: assets.phone.thumbnail,
        images: assets.phone.images
      },
      {
        product_name: "Giường Ngủ Gỗ Sồi Tự Nhiên 1m8 – Phong Cách Tân Cổ Điển",
        description: "Giường ngủ gỗ sồi tự nhiên cao cấp, thiết kế tân cổ điển sang trọng, kích thước 1m8.",
        start_price: 12000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catFurniture._id,
        thumbnail: assets.furniture.thumbnail,
        images: assets.furniture.images
      },
      {
        product_name: "Túi Xách Louis Vuitton Neverfull MM – Authentic",
        description: "Túi xách LV Neverfull MM authentic 100%, kèm hóa đơn mua tại store chính hãng, còn mới 95%.",
        start_price: 35000000,
        bid_increment: 1000000,
        auction_end_time: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        seller: seller2._id,
        category: catFashion._id,
        thumbnail: assets.fashion.thumbnail,
        images: assets.fashion.images,
        allow_newbie: false
      },
      {
        product_name: "Apple Watch Ultra 2 – Titanium Orange Band",
        description: "Apple Watch Ultra 2 bản titanium, dây orange alpine loop, còn mới 99%, bảo hành 10 tháng.",
        start_price: 18000000,
        bid_increment: 500000,
        buy_it_now_price: 22000000,
        auction_end_time: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        seller: seller5._id,
        category: catElectronics._id,
        thumbnail: assets.electronics.thumbnail,
        images: assets.electronics.images
      },
      {
        product_name: "Bộ Ghế Sofa Góc L Bọc Vải Cao Cấp – Màu Xám Nhạt",
        description: "Bộ sofa góc L hiện đại, bọc vải cao cấp chống bẩn, màu xám nhạt dễ phối, ngồi rất êm.",
        start_price: 15000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catFurniture._id,
        thumbnail: assets.furniture.thumbnail,
        images: assets.furniture.images
      },
      {
        product_name: "Giày Nike Air Force 1 Low White – Size 42",
        description: "Giày Nike Air Force 1 trắng full, size 42, hàng auth chính hãng, đi 3 lần, còn rất mới.",
        start_price: 2000000,
        bid_increment: 100000,
        auction_end_time: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        seller: seller3._id,
        category: catShoes._id,
        thumbnail: assets.shoes.thumbnail,
        images: assets.shoes.images
      },
      {
        product_name: "Laptop ASUS ROG Strix G16 – RTX 4060 Gaming",
        description: "Laptop gaming ASUS ROG Strix G16, card RTX 4060, Intel i7 Gen 13, RAM 16GB, SSD 512GB.",
        start_price: 28000000,
        bid_increment: 1000000,
        auction_end_time: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        seller: seller2._id,
        category: catLaptop._id,
        thumbnail: assets.laptop.thumbnail,
        images: assets.laptop.images
      },
      {
        product_name: "Đồng Hồ Rolex Datejust 41 – Bản Two-Tone",
        description: "Rolex Datejust 41mm bản two-tone vàng thép, fullbox, giấy tờ đầy đủ, chỉ bán cho người uy tín.",
        start_price: 250000000,
        bid_increment: 5000000,
        auction_end_time: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        seller: seller5._id,
        category: catFashion._id,
        thumbnail: assets.fashion.thumbnail,
        images: assets.fashion.images,
        allow_newbie: false
      },
      {
        product_name: "iPhone 15 Pro Max 512GB – Titanium Natural",
        description: "iPhone 15 Pro Max bản 512GB màu Titanium Natural, máy đẹp 99%, pin 100%, bảo hành 8 tháng.",
        start_price: 30000000,
        bid_increment: 1000000,
        auction_end_time: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catPhone._id,
        thumbnail: assets.phone.thumbnail,
        images: assets.phone.images
      }
    ],

    soldProducts: [
      {
        product_name: "Sony PlayStation 5",
        description: "Máy chơi game console, fullbox.",
        start_price: 10000000,
        bid_increment: 200000,
        auction_end_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catElectronics._id,
        thumbnail: assets.electronics.thumbnail,
        images: assets.electronics.images
      },
      {
        product_name: "Sony PlayStation 5 Digital Edition",
        description: "Bản không ổ đĩa, máy như mới, fullbox nguyên seal.",
        start_price: 9500000,
        bid_increment: 200000,
        auction_end_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catElectronics._id,
        thumbnail: assets.electronics.thumbnail,
        images: assets.electronics.images
      },
      {
        product_name: "Sony PlayStation 5 God of War Bundle",
        description: "Kèm game God of War Ragnarök, 2 tay cầm DualSense.",
        start_price: 11000000,
        bid_increment: 200000,
        auction_end_time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catElectronics._id,
        thumbnail: assets.electronics.thumbnail,
        images: assets.electronics.images
      },
      {
        product_name: "Sony PlayStation 5 Slim",
        description: "Phiên bản Slim mới nhất, gọn gàng hơn, đầy đủ phụ kiện.",
        start_price: 10500000,
        bid_increment: 200000,
        auction_end_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catElectronics._id,
        thumbnail: assets.electronics.thumbnail,
        images: assets.electronics.images
      },
      {
        product_name: "Sony PlayStation 5 Disc Edition",
        description: "Bản đĩa chuẩn, kèm 5 game AAA hot nhất, bảo hành 6 tháng.",
        start_price: 10200000,
        bid_increment: 200000,
        auction_end_time: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        seller: seller4._id,
        category: catElectronics._id,
        thumbnail: assets.electronics.thumbnail,
        images: assets.electronics.images
      },
      {
        product_name: "Sony PlayStation 5 Spider-Man Edition",
        description: "Phiên bản giới hạn Spider-Man 2, siêu đẹp và hiếm.",
        start_price: 12000000,
        bid_increment: 250000,
        auction_end_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        seller: seller2._id,
        category: catElectronics._id,
        thumbnail: assets.electronics.thumbnail,
        images: assets.electronics.images
      },
      {
        product_name: "Loa Bluetooth Marshall",
        description: "Nghe nhạc cực hay.",
        start_price: 5000000,
        bid_increment: 100000,
        auction_end_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catElectronics._id,
        thumbnail: assets.electronics.thumbnail,
        images: assets.electronics.images
      },
      {
        product_name: "Bàn Làm Việc Gỗ Cao Su 1m2",
        description: "Bàn làm việc gỗ cao su tự nhiên, thiết kế minimalist, kích thước 1m2, rất chắc chắn.",
        start_price: 3000000,
        bid_increment: 100000,
        auction_end_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catFurniture._id,
        thumbnail: assets.furniture.thumbnail,
        images: assets.furniture.images
      },
      {
        product_name: "iPhone 14 Plus 128GB Blue",
        description: "iPhone 14 Plus màu xanh, bản 128GB, máy đẹp 98%, pin 95%, đã qua sử dụng 6 tháng.",
        start_price: 18000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catPhone._id,
        thumbnail: assets.phone.thumbnail,
        images: assets.phone.images
      },
      {
        product_name: "Máy Ảnh Canon EOS R6",
        description: "Máy ảnh mirrorless Canon EOS R6, fullbox, ít sử dụng, kèm lens 24-105mm.",
        start_price: 45000000,
        bid_increment: 1000000,
        auction_end_time: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catElectronics._id,
        thumbnail: assets.electronics.thumbnail,
        images: assets.electronics.images,
        auction_status: 'cancelled'
      },
      {
        product_name: "Laptop HP Pavilion 15",
        description: "Laptop HP Pavilion 15, Intel i5 Gen 11, RAM 8GB, SSD 256GB, màn hình 15.6 inch.",
        start_price: 12000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catLaptop._id,
        thumbnail: assets.laptop.thumbnail,
        images: assets.laptop.images,
        auction_status: 'ended'
      }
    ]
  };
};

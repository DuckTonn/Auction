export const products = [
  { id: 1, name: 'iPhone 15 Pro', price: 20000000, image: 'https://picsum.photos/200?1' },
  { id: 2, name: 'MacBook Air M3', price: 28000000, image: 'https://picsum.photos/200?2' },
  { id: 3, name: 'AirPods Pro 2', price: 4500000, image: 'https://picsum.photos/200?3' },
  { id: 4, name: 'Đồng hồ Casio', price: 2500000, image: 'https://picsum.photos/200?4' },
  { id: 5, name: 'Tủ lạnh LG Inverter', price: 12000000, image: 'https://picsum.photos/200?5' },
]

export const MOCK_PRODUCTS = [
  // --- DANH MỤC: LAPTOP (slug: laptop) ---
  {
    _id: 'p1',
    product_name: 'MacBook Pro 14 inch M3 Pro 18GB/512GB',
    slug: 'macbook-pro-14-m3-pro',
    
    category_id: { _id: 'c1', category_name: 'Laptop', slug: 'laptop' }, 
    category_slug: 'laptop',
    
    description: 'Máy mới sạc 2 lần, còn bảo hành Apple Care+ đến 2026. Chip M3 Pro cực mạnh, xử lý đồ họa mượt mà. Đầy đủ phụ kiện hộp sách.',
    start_price: 45000000,
    current_highest_price: 48500000,
    bid_increment: 500000, // Bước giá
    buy_it_now_price: 55000000,
    
    // Schema: images (Validate >= 3 ảnh)
    images: [
      'https://cdn.tgdd.vn/Products/Images/44/318225/macbook-pro-14-inch-m3-pro-2023-den-thumb-600x600.jpg',
      'https://cdn.tgdd.vn/Products/Images/44/318225/macbook-pro-14-inch-m3-pro-2023-den-thumb-600x600.jpg', // Copy để đủ 3 ảnh
      'https://cdn.tgdd.vn/Products/Images/44/318225/macbook-pro-14-inch-m3-pro-2023-den-thumb-600x600.jpg'
    ],
    
    auction_start_time: new Date(Date.now() - 100000000).toISOString(),
    auction_end_time: new Date(Date.now() + 120000000).toISOString(),
    bid_count: 8,
    max_bids_per_bidder: 3,
    
    // Schema: seller_id (Ref User)
    seller_id: { _id: 'u1', full_name: 'Shop Apple HCM', rating: 4.9 }
  },
  {
    _id: 'p2',
    product_name: 'Dell XPS 13 Plus 9320 Core i7',
    slug: 'dell-xps-13-plus-9320',
    category_id: { _id: 'c1', category_name: 'Laptop', slug: 'laptop' },
    category_slug: 'laptop',
    
    description: 'Thiết kế tương lai, bàn phím tràn viền. Máy like new 99%, hàng xách tay Mỹ. Màn hình OLED 3.5K cảm ứng cực nét.',
    start_price: 32000000,
    current_highest_price: 32000000,
    bid_increment: 200000,
    
    images: [
      'https://laptopvang.com/wp-content/uploads/2023/04/Dell-XPS-9320-Platinum-01.jpg',
      'https://laptopvang.com/wp-content/uploads/2023/04/Dell-XPS-9320-Platinum-01.jpg',
      'https://laptopvang.com/wp-content/uploads/2023/04/Dell-XPS-9320-Platinum-01.jpg'
    ],
    
    auction_end_time: new Date(Date.now() + 250000000).toISOString(),
    bid_count: 0,
    seller_id: { _id: 'u2', full_name: 'Tran Tuan Anh', rating: 4.5 }
  },

  // --- DANH MỤC: GAMING (slug: laptop-gaming) ---
  {
    _id: 'p4',
    product_name: 'Asus ROG Strix G16 (2024) RTX 4060',
    slug: 'asus-rog-strix-g16-2024',
    category_id: { _id: 'c2', category_name: 'Laptop Gaming', slug: 'laptop-gaming' },
    category_slug: 'laptop-gaming',
    
    description: 'Chiến mọi game AAA max setting. Tản nhiệt 3 quạt mát rượi. Màn hình 16 inch 165Hz chuẩn màu đồ họa.',
    start_price: 35000000,
    current_highest_price: 36200000,
    bid_increment: 100000,
    
    images: [
      'https://cdn2.cellphones.com.vn/x/media/catalog/product/a/s/asus-rog-strix-g16-2024.jpg',
      'https://cdn2.cellphones.com.vn/x/media/catalog/product/a/s/asus-rog-strix-g16-2024.jpg',
      'https://cdn2.cellphones.com.vn/x/media/catalog/product/a/s/asus-rog-strix-g16-2024.jpg'
    ],
    
    auction_end_time: new Date(Date.now() + 172800000).toISOString(),
    bid_count: 5,
    seller_id: { _id: 'u3', full_name: 'Gamer Pro Store', rating: 5.0 }
  },

  // --- DANH MỤC: ĐIỆN THOẠI (slug: dien-thoai) ---
  {
    _id: 'p7',
    product_name: 'iPhone 15 Pro Max 256GB Titan Tự Nhiên',
    slug: 'iphone-15-pro-max-256gb',
    category_id: { _id: 'c3', category_name: 'Điện Thoại', slug: 'dien-thoai' },
    category_slug: 'dien-thoai',
    
    description: 'Máy VN/A vừa kích hoạt hôm qua, chưa sạc lần nào. Fullbox hoá đơn Viettel Store. Màu Titan hot nhất năm nay.',
    start_price: 28000000,
    current_highest_price: 29500000,
    bid_increment: 100000,
    buy_it_now_price: 31000000,
    
    images: [
      'https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-titan-tu-nhien-thumb-1-600x600.jpg',
      'https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-titan-tu-nhien-thumb-1-600x600.jpg',
      'https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-titan-tu-nhien-thumb-1-600x600.jpg'
    ],
    
    auction_end_time: new Date(Date.now() + 1000000).toISOString(), // Sắp hết giờ
    bid_count: 15,
    seller_id: { _id: 'u4', full_name: 'Apple Store VN', rating: 4.8 }
  },
  {
    _id: 'p8',
    product_name: 'Samsung Galaxy S24 Ultra 512GB',
    slug: 'samsung-galaxy-s24-ultra',
    category_id: { _id: 'c3', category_name: 'Điện Thoại', slug: 'dien-thoai' },
    category_slug: 'dien-thoai',
    
    description: 'Quyền năng Galaxy AI. Zoom 100x cực đỉnh. Máy trần tặng kèm ốp lưng xịn. Có xước nhẹ ở viền camera.',
    start_price: 26000000,
    current_highest_price: 27200000,
    bid_increment: 200000,
    
    images: [
      'https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-grey-thumb-600x600.jpg',
      'https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-grey-thumb-600x600.jpg',
      'https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-grey-thumb-600x600.jpg'
    ],
    
    auction_end_time: new Date(Date.now() + 500000000).toISOString(),
    bid_count: 7,
    seller_id: { _id: 'u5', full_name: 'SamFan Club', rating: 4.6 }
  },

  // --- DANH MỤC: ĐỒNG HỒ (slug: dong-ho) ---
  {
    _id: 'p11',
    product_name: 'Apple Watch Ultra 2 Alpine Loop',
    slug: 'apple-watch-ultra-2',
    category_id: { _id: 'c4', category_name: 'Đồng Hồ', slug: 'dong-ho' },
    category_slug: 'dong-ho',
    
    description: 'Đồng hồ chuyên dụng cho dân thể thao. Pin trâu 3 ngày. Màn hình sáng nhất thế giới smartwatch.',
    start_price: 18000000,
    current_highest_price: 19500000,
    bid_increment: 100000,
    
    images: [
      'https://cdn.tgdd.vn/Products/Images/7077/314785/apple-watch-ultra-2-alpine-loop-blue-thumb-1-600x600.jpg',
      'https://cdn.tgdd.vn/Products/Images/7077/314785/apple-watch-ultra-2-alpine-loop-blue-thumb-1-600x600.jpg',
      'https://cdn.tgdd.vn/Products/Images/7077/314785/apple-watch-ultra-2-alpine-loop-blue-thumb-1-600x600.jpg'
    ],
    
    auction_end_time: new Date(Date.now() + 200000000).toISOString(),
    bid_count: 9,
    seller_id: { _id: 'u6', full_name: 'iWatch Store', rating: 5.0 }
  },

  // --- DANH MỤC: MÁY ẢNH (slug: may-anh) ---
  {
    _id: 'p15',
    product_name: 'Sony Alpha A7 IV Body (Mới 98%)',
    slug: 'sony-alpha-a7-iv-body',
    category_id: { _id: 'c5', category_name: 'Máy Ảnh', slug: 'may-anh' },
    category_slug: 'may-anh',
    
    description: 'Huyền thoại Hybrid chụp quay đều đỉnh. Sensor 33MP. Quay 4K 60p 10-bit. Shot count: 5k shot.',
    start_price: 50000000,
    current_highest_price: 52000000,
    bid_increment: 500000,
    
    images: [
      'https://binhminhdigital.com/StoreData/Product/14102021/Sony-a7-IV-binhminhdigital-1.jpg',
      'https://binhminhdigital.com/StoreData/Product/14102021/Sony-a7-IV-binhminhdigital-1.jpg',
      'https://binhminhdigital.com/StoreData/Product/14102021/Sony-a7-IV-binhminhdigital-1.jpg'
    ],
    
    auction_end_time: new Date(Date.now() + 60000000).toISOString(),
    bid_count: 10,
    seller_id: { _id: 'u7', full_name: 'Sony Center', rating: 4.9 }
  }
];
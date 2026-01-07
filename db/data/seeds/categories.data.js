module.exports = async (Category) => {
  // 3 Danh mục cha
  const catElectronics = await Category.create({ 
    category_name: "Đồ Điện Tử", 
    description: "Các thiết bị điện tử", 
    slug: "do-dien-tu" 
  });
  
  const catFashion = await Category.create({ 
    category_name: "Thời Trang", 
    description: "Quần áo, giày dép", 
    slug: "thoi-trang" 
  });
  
  const catFurniture = await Category.create({ 
    category_name: "Nội Thất", 
    description: "Bàn ghế, tủ giường", 
    slug: "noi-that" 
  });

  // 3 Danh mục con
  const catLaptop = await Category.create({ 
    category_name: "Laptop", 
    description: "Máy tính xách tay các loại", 
    parent: catElectronics._id,
    slug: "laptop"
  });
  
  const catPhone = await Category.create({ 
    category_name: "Điện Thoại", 
    description: "Smartphones", 
    parent: catElectronics._id,
    slug: "dien-thoai"
  });
  
  const catShoes = await Category.create({ 
    category_name: "Giày Dép", 
    description: "Giày thể thao, giày da", 
    parent: catFashion._id,
    slug: "giay-dep"
  });

  // Trả về các categories đã tạo để dùng cho products
  return {
    catElectronics,
    catFashion,
    catFurniture,
    catLaptop,
    catPhone,
    catShoes
  };
};

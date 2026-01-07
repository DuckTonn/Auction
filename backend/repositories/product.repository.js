import { Product } from '../db/schema.js';
import { Category } from '../db/schema.js';
import { categoryRepository } from './category.repository.js';

class ProductRepository { 
    async create(productData) { 
        const product = new Product(productData);
        return await product.save();
    }

    async findAll(selectAutoBidMap = false, session = null) {
        return await Product.find().session(session)
            .select(selectAutoBidMap ? '' : '-auto_bid_map')
            .populate('seller', 'full_name email rating_score rating_count') 
            .populate('category', 'category_name slug')
            .populate('current_highest_bidder', 'full_name email rating_score rating_count');
    }
    
    async findById(product, selectAutoBidMap = false, session = null) {
        return await Product.findById(product).session(session)
            .select(selectAutoBidMap ? '' : '-auto_bid_map')
            .populate('seller', 'full_name email rating_score rating_count') 
            .populate('category', 'category_name slug')
            .populate('current_highest_bidder', 'full_name email rating_score rating_count');
    }
    
    async findByName(productName, selectAutoBidMap = false, session = null) {
        return await Product.find({ product_name: productName }).session(session).select(selectAutoBidMap ? '' : '-auto_bid_map');
    }

    async findByCondition(keyword, filter = {}, sortOption = {}, limit = 0, page = 1, selectAutoBidMap = false, session = null) {
        if (keyword) {
            // Tìm các category có tên khớp với từ khóa
            const matchingCategories = await Category.find({ 
                category_name: { $regex: keyword, $options: 'i' } 
            }).select('_id');

            // Lấy tất cả category IDs bao gồm cả category con
            let allCategoryIds = [];
            for (const cat of matchingCategories) {
                const descendantIds = await categoryRepository.getAllDescendantIds(cat._id);
                allCategoryIds = allCategoryIds.concat(descendantIds);
            }

            // Loại bỏ trùng lặp
            const uniqueCategoryIds = [...new Set(allCategoryIds)];

            // Thêm điều kiện tìm kiếm vào filter
            filter.$or = [
                { product_name: { $regex: keyword, $options: 'i' } },
                { description_current: { $regex: keyword, $options: 'i' } },
                { category: { $in: uniqueCategoryIds } } 
            ];
        }

        const finalSort = Object.keys(sortOption).length ? sortOption : { auction_end_time: 1 };

        // Đếm tổng số documents
        const totalCount = await Product.countDocuments(filter).session(session);

        // Tạo query với phân trang
        const query = Product.find(filter).sort(finalSort);

        if (limit > 0) {
            const skip = (page - 1) * limit;
            query.skip(skip).limit(limit);
        }

        const products = await query.session(session)
            .select(selectAutoBidMap ? '' : '-auto_bid_map')
            .populate('seller', 'full_name email rating_score rating_count') 
            .populate('category', 'category_name slug')
            .populate('current_highest_bidder', 'full_name email rating_score rating_count')
            .lean();

        // Trả về kết quả
        if (limit === 0) {
            // Giữ tương thích ngược: khi không phân trang, trả về mảng products
            return products;
        }

        // Khi có phân trang, trả về kèm thông tin phân trang
        return {
            products,
            pagination: {
                total: totalCount,
                page: page,
                limit: limit,
                totalPages: limit > 0 ? Math.ceil(totalCount / limit) : 1
            }
        };
    }

    async findRandom(filter, limit, selectAutoBidMap = false, session = null) {
        const docs = await Product.aggregate([
            { $match: filter },
            { 
                $project: selectAutoBidMap 
                    ? {}
                    : { auto_bid_map: 0 }
            },
            { $sample: { size: limit } }
        ]).session(session);

        return await Product.populate(docs, [
            { path: 'seller', select: 'full_name email rating_score rating_count' },
            { path: 'category', select: 'category_name slug' },
            { path: 'current_highest_bidder', select: 'full_name email rating_score rating_count'}
        ]);
    }

    async findExpired(selectAutoBidMap = false, session = null) {
        const now = new Date();
        return await Product.find({
            auction_status: 'active',
            auction_end_time: { $lt: now }
        }).session(session).select(selectAutoBidMap ? '' : '-auto_bid_map');
    }

    async findActive(userId, selectAutoBidMap = false, session = null) {
        return await Product.find({
            seller: userId,
            auction_status: 'active'
        }).session(session).select(selectAutoBidMap ? '' : '-auto_bid_map');
    }

    async findProductsUserIsLeading(userId, selectAutoBidMap = false, session = null) {
        return await Product.find({
            current_highest_bidder: userId,
            auction_status: 'active'
        }).session(session).select(selectAutoBidMap ? '' : '-auto_bid_map');
    }

    async findProductsUserIsTop(userId, selectAutoBidMap = false, session = null) {
        const userIdStr = userId.toString();
        
        const pipeline = [
            {
                $match: {
                    auction_status: 'active',
                    [`auto_bid_map.${userIdStr}`]: { $exists: true }
                }
            },
            {
                $addFields: {
                    auto_bid_array: { $objectToArray: '$auto_bid_map' }
                }
            },
            {
                $addFields: {
                    sorted_bids: {
                        $sortArray: {
                            input: '$auto_bid_array',
                            sortBy: { v: -1 }
                        }
                    }
                }
            },
            {
                $addFields: {
                    top_bidder: { $arrayElemAt: ['$sorted_bids.k', 0] },
                    second_bidder: { $arrayElemAt: ['$sorted_bids.k', 1] }
                }
            },
            {
                $match: {
                    $or: [
                        { top_bidder: userIdStr },
                        { second_bidder: userIdStr }
                    ]
                }
            },
            {
                $project: { _id: 1 }
            }
        ];

        const results = await Product.aggregate(pipeline).session(session);
        const productIds = results.map(r => r._id);
        
        if (productIds.length === 0) {
            return [];
        }

        return await Product.find({ _id: { $in: productIds } }).session(session)
            .select(selectAutoBidMap ? '' : '-auto_bid_map')
            .populate('seller', 'full_name email rating_score rating_count')
            .populate('category', 'category_name slug')
            .populate('current_highest_bidder', 'full_name email rating_score rating_count');
    }
    
    async removeProduct(product, session = null) {
        return await Product.findByIdAndDelete(product).session(session);
    }

    async findBySeller (seller, selectAutoBidMap = false, session = null) {
        return await Product.find({ seller }).session(session)
            .select(selectAutoBidMap ? '' : '-auto_bid_map')
            .populate('seller', 'full_name email rating_score rating_count') 
            .populate('category', 'category_name slug')
            .populate('current_highest_bidder', 'full_name email rating_score rating_count');
    }

    async findActive(productIds, selectAutoBidMap = false, session = null) {
        return await Product.find({
            _id: { $in: productIds },
            auction_status: 'active'
        }).session(session)
            .select(selectAutoBidMap ? '' : '-auto_bid_map')
            .populate('seller', 'full_name email rating_score rating_count') 
            .populate('category', 'category_name slug')
            .populate('current_highest_bidder', 'full_name email rating_score rating_count');
    }

    // Xử lí transaction
    async findByIdForUpdate(id, session) {
        return await Product.findById(id).session(session);
    }

    async save(productDocument, session) {
        return await productDocument.save({ session });
    }

    async addBannedBidder(product, bidder, session = null) {
        return await Product.findByIdAndUpdate(
            product,
            { $addToSet: { banned_bidder: bidder } }, 
            { new: true, runValidators: true }
        ).session(session);
    }

    async removeBannedBidder(product, bidder, session = null) {
        return await Product.findByIdAndUpdate(
            product,
            { $pull: { banned_bidder: bidder } }, 
            { new: true } 
        ).session(session);
    }

    async findBannedBidders(productId, session = null) {
        const foundProduct = await Product.findById(productId).select('banned_bidder').session(session);
        return foundProduct ? foundProduct.banned_bidder : [];
    }

    async updateProductInfo(productId, updateData, session = null) {
        const product = await Product.findById(productId).session(session);
        if (!product) return null;

        Object.assign(product, updateData);

        return await product.save({ session });
    }

    async appendDescription(productId, newDescriptionContent, session = null) {
        const product = await Product.findById(productId).session(session);
        if (!product) return null;

        // Push vào mảng history
        product.description_history.push({
            content: newDescriptionContent,
            timestamp: new Date()
        });

        return await product.save({ session });
    }
    
    async existsInCategories(categoryIds, session = null) {
        const result = await Product.exists({ category: { $in: categoryIds } }).session(session);
        return !!result;
    }

    async cancelProduct(productId, session = null) {
        return await Product.findByIdAndUpdate(
            productId,
            { auction_status: 'cancelled' },
            { new: true }
        ).session(session);
    }

    async resellProduct(productId, newAuctionEndTime, session = null) {
        const product = await Product.findById(productId).session(session);
        if (!product) return null;
        
        return await Product.findByIdAndUpdate(
            productId,
            {
                auction_status: 'active',
                auction_start_time: new Date(),
                auction_end_time: newAuctionEndTime,
                bid_count: 0,
                auto_bid_map: {},
                bid_counts: {},
                current_highest_bidder: null,
                current_highest_price: product.start_price,
                banned_bidder: []
            },
            { new: true }
        ).session(session)
            .populate('seller', 'full_name email rating_score rating_count') 
            .populate('category', 'category_name slug');
    }
}

export const productRepository = new ProductRepository();
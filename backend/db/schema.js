import mongoose from 'mongoose';
import sanitizeHtml from 'sanitize-html';
const { Schema } = mongoose;

// Helper validate số lượng ảnh
function arrayLimit(val) {
  return val.length >= 3;
}

// Helper tự động quét các trường có 'ref' và kiểm tra ID có tồn tại không
const checkForeignKeys = (schema) => {
  schema.eachPath((path, schemaType) => {
    if (schemaType.options.ref) {
      const refModel = schemaType.options.ref;
      
      schema.path(path).validate({
        validator: async function (value) {
          if (!value) return true;
          
          // SỬA DÒNG NÀY:
          // Thay vì mongoose.models[refModel], hãy dùng mongoose.model(refModel)
          // Nếu model chưa có thì try-catch để báo lỗi rõ ràng
          let Model;
          try {
              Model = mongoose.model(refModel);
          } catch (e) {
              // Model chưa được đăng ký
              return false;
          }

          if (Array.isArray(value)) {
             if (value.length === 0) return true;
             const count = await Model.countDocuments({ _id: { $in: value } });
             return count === value.length;
          }
          
          const count = await Model.countDocuments({ _id: value });
          return count > 0;
        },
        message: `Giá trị tại trường {PATH} không tồn tại trong bảng ${refModel}!`
      });
    }
  });
};

// 1. User
const userSchema = new Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  password: { type: String },
  date_of_birth: { type: Date },

  // Delete
  is_deleted: { type: Boolean, default: false, index: true },
  deleted_at: { type: Date, default: null },

  // Role & Permissions
  role: { type: String, enum: ['bidder', 'seller', 'admin'], default: 'bidder' },
  seller_expiry_date: { type: Date, default: null },
  
  // Profile Info
  phone_number: { type: String, sparse: true },
  address: { type: String },
  
  // Provider
  providers: [{
    provider: { type: String, enum: ['local', 'google', 'facebook', 'github'], required: true },
    provider_id: { type: String }, // id do provider cung cấp
  }],
  
  // Rating
  rating_score: { type: Number, default: 0 }, // Tổng điểm: cứ +1 hoặc -1
  rating_count: { type: Number, default: 0 }, // Tổng số lần được đánh giá
}, { timestamps: true });
userSchema.index(
  { email: 1 }, 
  { unique: true, partialFilterExpression: { is_deleted: false } }
);

// 2. UpgradeRequest
const upgradeRequestSchema = new Schema({
  bidder: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approver: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });
// Kích hoạt kiểm tra khóa ngoại
upgradeRequestSchema.plugin(checkForeignKeys);

// 4. WatchList
const watchListSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: { createdAt: 'timestamp_added', updatedAt: false } });

watchListSchema.index({ user: 1, product: 1 }, { unique: true });
watchListSchema.plugin(checkForeignKeys);

// 5. Category
const categorySchema = new Schema({
  category_name: { type: String, required: true, unique: true },
  description: String,
  parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  slug: { type: String, required: true, unique: true, index: true },
});
categorySchema.plugin(checkForeignKeys);

// 6. Product
// --- Cấu hình santilize ---
const sanitizeOptions = {
  allowedTags: [ 
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img' 
  ],
  allowedAttributes: {
    'a': [ 'href', 'name', 'target' ],
    'img': [ 'src', 'alt', 'width', 'height' ],
    '*': ['style', 'class'] 
  },
  allowedSchemes: [ 'http', 'https', 'data' ]
};

const productSchema = new Schema({
  product_name: { type: String, required: true, index: true },
  
  description_history: [{
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  description_current: { type: String, default: '', select: false },

  start_price: { type: Number, required: true, default: 0 },
  bid_increment: { type: Number, default: 10000 },
  buy_it_now_price: { type: Number },
  thumbnail: {
    type: String,
    required: [true, "Sản phẩm phải có ảnh đại diện"]
  },
  images: {
    type: [String],
    validate: {
      validator: function (arr) {
        return arr.length >= 3;
      },
      message: "Sản phẩm phải có ít nhất 3 ảnh phụ"
    }
  },
  
  // Các trường logic đấu giá
  auction_start_time: { type: Date, default: Date.now },
  auction_end_time: { type: Date, required: true },
  bid_count: { type: Number, default: 0 },              // Tổng số bid của sản phẩm
  auto_bid_map: { type: Map, of: Number, default: {}},  // Map lượt bid của bidder
  bid_counts: { type: Map, of: Number, default: {}},    // Số lần bid của mỗi bidder
  // Trạng thái đấu giá
  auction_status: { 
    type: String, 
    enum: ['active', 'ended', 'sold', 'cancelled'],
    default: 'active'
  },
  auto_renew: { type: Boolean, default: false },        // Cho phép gia hạn auction
  
  // Quan hệ
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  current_highest_bidder: { type: Schema.Types.ObjectId, ref: 'User' },
  current_highest_price: { type: Number, default: function() { return this.start_price; } },
  
  // Danh sách bidder bị cấm đấu giá
  banned_bidder: [{ type: Schema.Types.ObjectId, ref: 'User' }],

  // Cho phép newbie (chưa có đánh giá) được đấu giá
  allow_newbie: { type: Boolean, default: true },
}, { timestamps: true });

// Full-text search index
productSchema.index(
  { product_name: 'text', description_current: 'text' },
  { weights: { product_name: 10, description_current: 5 } },
);
productSchema.plugin(checkForeignKeys);

// --- Xử lý description ---
productSchema.pre('save', function(next) {
  if (this.isModified('description_history')) {
    this.description_history.forEach(item => {
        item.content = sanitizeHtml(item.content, sanitizeOptions);
    });

    const fullHtml = this.description_history.map(item => item.content).join(' ');

    // Clear thẻ HTML, chỉ lấy chữ (Plain Text)
    this.description_current = sanitizeHtml(fullHtml, {
      allowedTags: [],
      allowedAttributes: {}
    });
  }
  
  next();
});

// 7. Bid
const bidSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  price: { type: Number, required: true },
  is_priority: { type: Boolean, default: false },
  is_valid: { type: Boolean, default: true },
  is_adjusted: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
}, { timestamps: true });
bidSchema.plugin(checkForeignKeys);

// 8. QnA
const qnaSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  asker: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  answerer: { type: Schema.Types.ObjectId, ref: 'User' },
  question_content: { type: String, required: true },
  answer_content: String,
  answer_timestamp: Date,
}, { timestamps: { createdAt: 'question_timestamp', updatedAt: false } });
qnaSchema.plugin(checkForeignKeys);

// 9. AuctionResult
const auctionResultSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  winning_bidder: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  final_price: { type: Number, required: true },
  status: { 
      type: String, 
      enum: [
          'pending_payment',  // Mới thắng, chờ người mua điền thông tin
          'pending_shipment', // Người mua đã điền, chờ người bán xác nhận
          'shipping',         // Người bán đã gửi hàng
          'completed',        // Người mua đã nhận hàng -> Kết thúc thành công
          'cancelled'         // Bị huỷ (bởi người bán)
      ], 
      default: 'pending_payment' 
  },
  // Bidder
  shipping_address: { type: String, default: null },
  payment_proof: { type: String, default: null },
  // Seller
  shipping_proof: { type: String, default: null },
  // Cancelled
  cancellation_reason: { type: String, default: null },
  cancelled_at: { type: Date, default: null }
}, { timestamps: true });
auctionResultSchema.plugin(checkForeignKeys);

// 10. Rating
const ratingSchema = new Schema({
  rater: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rated_user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  auction_result: { type: Schema.Types.ObjectId, ref: 'Auction_Result', required: true },
  rating_type: { type: Number, enum: [1, -1], required: true }, 
  comment: String,
}, { timestamps: true });
ratingSchema.index({ rater: 1, auction_result: 1 }, { unique: true });
ratingSchema.plugin(checkForeignKeys);

//11. Refresh Token
const refreshTokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  expires_at: { type: Date, required: true },
  is_revoked: { type: Boolean, default: false },
}, { timestamps: true });
refreshTokenSchema.plugin(checkForeignKeys);

// 12 Chat Message
const chatMessageSchema = new Schema({
  auction_result: { type: Schema.Types.ObjectId, ref: 'Auction_Result', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
}, { timestamps: true });

// 13 OTP
const otpSchema = new Schema({
    email: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 } // Tự động xóa sau 600s (10 phút)
});

// --- KHAI BÁO MODEL ---
const User = mongoose.model('User', userSchema);
const UpgradeRequest = mongoose.model('Upgrade_Request', upgradeRequestSchema);
const WatchList = mongoose.model('Watch_List', watchListSchema);
const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);
const Bid = mongoose.model('Bid', bidSchema);
const QnA = mongoose.model('QnA', qnaSchema);
const AuctionResult = mongoose.model('Auction_Result', auctionResultSchema);
const Rating = mongoose.model('Rating', ratingSchema);
const RefreshToken = mongoose.model('Refresh_Token', refreshTokenSchema);
const ChatMessage = mongoose.model('Chat_Message', chatMessageSchema);
const OtpModel = mongoose.model('Otp', otpSchema);

// --- EXPORT (ES Modules) ---
export {
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
  OtpModel
};

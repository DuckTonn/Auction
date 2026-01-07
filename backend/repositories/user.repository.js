import { User } from '../../db/schema.js';

class UserRepository {
  async findAll(session = null) {
    return await User.find({}).session(session);
  }

  async findByEmail(email, session = null) {
    return await User.findOne({ email, is_deleted: false }).session(session);
  }

  async findById(id, session = null) {
    return await User.findOne({ _id: id, is_deleted: false }).session(session);
  }

  async findByEmailAndProvider(email, provider, session = null) {
    return await User.findOne({
      email,
      providers: { $elemMatch: { provider } }
    }).session(session);
  }

  async hasProvider(userId, provider, session = null) {
    return await User.exists({
      _id: userId,
      is_deleted: false,
      providers: { $elemMatch: { provider } }
    }).session(session);
  }

  async findByProvider(provider, providerId, session = null) {
    return await User.findOne({
        "providers.provider": provider,
        "providers.provider_id": providerId,
        is_deleted: false,
    }).session(session);
  }

  async create(userData, session = null) {
    const user = new User(userData);
    return await user.save({ session });
  }

  async createSocialUser({ full_name, email, provider, provider_id }, session = null) {
    const user = new User({
      full_name,
      email,
      password: null,
      providers: [{ provider, provider_id }],
    });
    return await user.save({ session });
  }


  async updatePassword(userId, newHashedPassword, session = null) {
    return await User.findOneAndUpdate(
      { _id: userId, is_deleted: false },
      { password: newHashedPassword },
      { new: true, session }
    );
  }

  async addProvider(userId, provider, providerId, session = null) {
    return await User.findOneAndUpdate(
        { _id: userId, is_deleted: false }, 
        {
            $addToSet: {
                providers: { provider, provider_id: providerId }
            }
        },
        { new: true, session }
    );
  }

  async updateData(userId, updateData, session = null) {
    if (!updateData || typeof updateData !== 'object') {
      return await this.findById(userId); 
    }

    const allowed = ['full_name', 'phone_number', 'address', 'email', 'date_of_birth'];
    const cleaned = Object.fromEntries(
      Object.entries(updateData).filter(([key, val]) =>
        allowed.includes(key) &&
        val !== null &&
        val !== undefined &&
        val !== '' &&
        key !== '_id' &&
        key !== 'id'
      )
    );

    if (Object.keys(cleaned).length === 0) {
      return await this.findById(userId);
    }

    return await User.findOneAndUpdate(
      { _id: userId, is_deleted: false },
      { $set: cleaned },
      { new: true, runValidators: true, session }
    );
  }

  async clearOtp(userId, session = null) {
    return await User.findOneAndUpdate(
      { _id: userId, is_deleted: false },
      {
        $unset: {
          otp: 1,
          otp_expires: 1
        }
      },
      { new: true, session }
    );
  }

  async updateRatingStats(userId, score, count, session = null) {
    return await User.findOneAndUpdate(
      { _id: userId, is_deleted: false },
      {
        rating_score: score,
        rating_count: count
      },
      { new: true, session }
    );
  }

  async upgradeSeller(userId, session = null) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    return await User.findOneAndUpdate(
      { _id: userId, is_deleted: false },
      { role: 'seller', seller_expiry_date: expiryDate },
      { new: true, runValidators: true, session }
    );
  }

  async downgradeExpiredSellers(session = null) {
    const now = new Date();

    return await User.updateMany(
      { 
          role: 'seller', 
          seller_expiry_date: { $lt: now },
          is_deleted: false
      },
      {
        $set: { role: 'bidder' },
        $unset: { seller_expiry_date: 1 }
      },
      { session }
    )
  }

  // --- ADMIN & DELETE ---
  async findByIdIncludingDeleted(id, session = null) {
    return await User.findById(id).session(session); 
  }

  async findByEmailIncludingDeleted(email, session = null) {
    return await User.findOne({ email }).session(session);
  }

  async findDeleted(session = null) {
    return await User.find({ is_deleted: true }).session(session);
  }

  async softDelete(userId, session = null) {
    return await User.findByIdAndUpdate(
      userId, 
      { 
        is_deleted: true, 
        deleted_at: new Date(),
      }, 
      { new: true, session: session }
    );
  }

 async restore(userId, session = null) {
    return await User.findByIdAndUpdate(
      userId, 
      { 
        is_deleted: false, 
        deleted_at: null,
      }, 
      { new: true, session: session }
    );
  }
}

export const userRepository = new UserRepository();
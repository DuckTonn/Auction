const mongoose = require('mongoose');

const executeTransaction = async (work) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Thực thi logic nghiệp vụ, truyền session vào
        const result = await work(session);
        
        await session.commitTransaction();
        return result;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

module.exports = { executeTransaction };
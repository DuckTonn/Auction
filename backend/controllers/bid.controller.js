import { bidService } from "../services/bid.service.js";

class BidController {
    async placeBid(req, res) {
        try {
            const user = req.user._id.toString();
            const { id } = req.params;
            const { amount } = req.body;

            const result = await bidService.placeBid(user, id, amount);
            return res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getBidHistory(req, res) {
        try {
            const { id } = req.params;

            const history = await bidService.getBidHistory(id);
            return res.status(200).json({
                message: 'Lấy lịch sử bid thành công',
                data: history
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getActiveBiddedProductsByUser(req, res) {
        try {
            const userId = req.user._id.toString();

            const products = await bidService.getActiveBiddedProductsByUser(userId);

            return res.status(200).json({
                message: 'Lấy danh sách sản phẩm đang bid thành công',
                data: products
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

export const bidController = new BidController();
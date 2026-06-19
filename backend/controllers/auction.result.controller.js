import { auctionResultService } from "../services/auction.result.service.js";

class AuctionResultController {
    async getOrderDetails(req, res) {
        try {
            const userId = req.user._id.toString();
            const orderId = req.params.orderId;
            const order = await auctionResultService.getOrderDetails(orderId, userId);
            res.status(200).json(order);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getOrderByProductId(req, res) {
        try {
            const userId = req.user._id.toString();
            const productId = req.params.productId;
            const order = await auctionResultService.getOrderByProductId(productId, userId);
            res.status(200).json(order);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getOrdersByWinner(req, res) {
        try {
            const userId = req.user._id.toString();

            const orders = await auctionResultService.getOrdersByWinner(userId);

            res.status(200).json({
                message: 'Lấy danh sách đơn hàng đấu giá thắng cuộc thành công',
                data: orders
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getOrdersBySeller(req, res) {
        try {
            const userId = req.user._id.toString();

            const orders = await auctionResultService.getOrdersBySeller(userId);

            res.status(200).json({
                message: 'Lấy danh sách đơn hàng đấu giá bán thành công',
                data: orders
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async submitPayment(req, res) {
        try {
            const userId = req.user._id.toString();
            const orderId = req.params.orderId;
            const { address } = req.body;

            // Ảnh
            const paymentProofUrl = req.file ? req.file.path : null;
            if (!paymentProofUrl) {
                return res.status(400).json({ message: "Vui lòng tải lên bằng chứng thanh toán." });
            }

            const updatedOrder = await auctionResultService.submitPayment(orderId, userId, address, paymentProofUrl);
            res.status(200).json(updatedOrder);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async confirmShipment(req, res) {
        try {
            const userId = req.user._id.toString();
            const orderId = req.params.orderId;
            
            // Ảnh
            const shippingProofUrl = req.file ? req.file.path : null;
            if (!shippingProofUrl) {
                return res.status(400).json({ message: "Vui lòng tải lên bằng chứng vận chuyển." });
            }

            const updatedOrder = await auctionResultService.confirmShipment(orderId, userId, shippingProofUrl);
            res.status(200).json(updatedOrder);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async confirmReceipt(req, res) {
        try {
            const userId = req.user._id.toString();
            const orderId = req.params.orderId;
            const updatedOrder = await auctionResultService.confirmReceipt(orderId, userId);
            res.status(200).json(updatedOrder);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async cancelTransaction(req, res) {
        try {
            const sellerId = req.user._id.toString();
            const orderId = req.params.orderId;
            const { reason } = req.body;
            const updatedOrder = await auctionResultService.cancelTransaction(orderId, sellerId, reason);
            res.status(200).json(updatedOrder);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

export const auctionResultController = new AuctionResultController();
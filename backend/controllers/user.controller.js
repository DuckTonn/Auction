import { userService } from '../services/user.service.js';

class UserController {
    async getProfile(req, res) {
        try {
            const userId = req.user.id; 
            const user = await userService.getProfile(userId);
            
            return res.status(200).json({
                user: user
            });
        } catch (error) {
            return res.status(404).json({ message: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const updateData = req.body;

            const updatedUser = await userService.updateProfile(userId, updateData);

            return res.status(200).json({
                message: 'Cập nhật thông tin thành công!',
                user: updatedUser
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    // --- ADMIN ACTIONS ---
    async deleteUser(req, res) {
        try {
            const myself = req.user.id;
            const userId = req.params.id;
            
            if (myself.toString() === userId.toString()) {
                return res.status(400).json({ error: 'Không thể tự xóa chính mình' });
            }
            
            const result = await userService.deleteUser(userId);

            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async restoreUser(req, res) {
        try {
            const userId = req.params.id;

            const result = await userService.restoreUser(userId);

            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await userService.getAllUsers();
            return res.status(200).json({ data: users });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async getDeletedUsers(req, res) {
        try {
            const users = await userService.getDeletedUsers();
            return res.status(200).json({ users });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async resetUserPassword(req, res) {
        try {
            const userId = req.params.id;

            const result = await userService.resetUserPassword(userId);

            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
}

export const userController = new UserController();
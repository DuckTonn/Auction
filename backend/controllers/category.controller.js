import { categoryService } from '../services/category.service.js';

class CategoryController {
    async createCategory(req, res) {
        try {
            const parent_slug = req.body.parent_slug;

            let parentId = null;
            if (parent_slug) {
                const parent_found = await categoryService.getCategoryBySlug(parent_slug);
                if (!parent_found) {
                    return res.status(400).json({ message: `Danh mục cha '${parent_slug}' không tồn tại!` });
                }
                parentId = parent_found._id;
            }

            // Bỏ field slug (nếu có)
            const data = { ...req.body, parent: parentId };
            delete data.slug;
            delete data.parent_slug;
            
            const newCategory = await categoryService.createCategory(data);

            res.status(201).json({
                message: 'Tạo danh mục thành công!',
                data: newCategory
            })
        } catch (error) {
            res.status(400).json({ 
                message: 'Tạo danh mục thất bại!', 
                error: error.message 
            });
        }
    }

    async getAllCategories(req, res) {
        try {
            const categories = await categoryService.getAllCategories();

            // Thêm exists_active_products vào mỗi danh mục
            const categoriesWithActiveProducts = await Promise.all(
                categories.map(async (category) => {
                    const categoryObj = category.toObject();
                    const exists_active_products = await categoryService.existsActiveProductsInCategory(category._id);
                    categoryObj.exists_active_products = exists_active_products;
                    return categoryObj;
                })
            );

            res.status(200).json({
                message: 'Lấy danh mục thành công!',
                data: categoriesWithActiveProducts
            })
        } catch (error) {
            res.status(500).json({
                message: 'Lỗi server khi lấy danh mục',
                error: error.message 
            });
        }
    }

    async getCategory(req, res) {
        try {
            const { id } = req.params;

            const category_found = await categoryService.getCategoryById(id);
            const categoryObj = category_found.toObject();

            const exists_active_products = await categoryService.existsActiveProductsInCategory(category_found._id);
            categoryObj.exists_active_products = exists_active_products;

            res.status(200).json({
                message: 'Lấy danh mục thành công!',
                data: categoryObj
            })
        } catch (error) {
            res.status(500).json({
                message: 'Lỗi server khi lấy danh mục',
                error: error.message 
            });
        }
    }

    async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            if (updateData.parent_slug) {
                 const parent_found = await categoryService.getCategoryBySlug(updateData.parent_slug);
                 if (!parent_found) {
                     return res.status(400).json({ message: `Danh mục cha '${updateData.parent_slug}' không tồn tại!` });
                 }
                 if (parent_found._id.toString() === id.toString()) {
                     return res.status(400).json({ message: 'Danh mục cha không thể là chính nó!' });
                 }
                 updateData.parent = parent_found._id;
            }
            delete updateData.slug;
            delete updateData.parent_slug;

            const updatedCategory = await categoryService.updateCategory(id, updateData);

            return res.status(200).json({
                message: 'Cập nhật danh mục thành công!',
                data: updatedCategory
            });
        } catch (error) {
            return res.status(400).json({
                message: 'Cập nhật danh mục thất bại!',
                error: error.message
            });
        }
    }

    async existsActiveProductsInCategory(req, res) {
        try {
            const { id } = req.params;

            const exists_active_products = await categoryService.existsActiveProductsInCategory(id);

            return res.status(200).json({
                message: 'Kiểm tra thành công!',
                data: { exists_active_products }
            });
        } catch (error) {
            return res.status(400).json({
                message: 'Kiểm tra thất bại!',
                error: error.message
            });
        }
    }

    async deleteCategory(req, res) {
        try {
            const { id } = req.params;

            await categoryService.deleteCategory(id);

            return res.status(204).json({
                message: 'Xóa danh mục thành công!'
            });
        } catch (error) {
            return res.status(400).json({
                message: 'Xóa danh mục thất bại!',
                error: error.message
            });
        }
    }
}

export const categoryController = new CategoryController();
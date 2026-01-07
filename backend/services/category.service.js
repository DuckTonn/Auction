import { categoryRepository } from '../repositories/category.repository.js';
import { productRepository } from '../repositories/product.repository.js';

class CategoryService {
    async createCategory(data) {
        // Kiểm tra các field bắt buộc
        if (!data.category_name) {
            throw new Error("Tên danh mục là bắt buộc!");
        }
    
        // Kiểm tra trùng tên danh mục
        const existed = await categoryRepository.findByName(data.category_name);
        if (existed) {
            throw new Error("Tên danh mục đã tồn tại!");
        }

        return await categoryRepository.create(data);
    }

    async getAllCategories() {
        return await categoryRepository.findAll();
    }

    async getCategoryById(id) {
        return await categoryRepository.findById(id);
    }

    async getCategoryByName(category_name) {
        return await categoryRepository.findByName(category_name);
    }

    async getCategoryBySlug(slug) {
        return await categoryRepository.findBySlug(slug);
    }

    async updateCategory(id, updateData) {
        const category = await categoryRepository.findById(id);
        if (!category) {
            throw new Error('Danh mục không tồn tại!');
        }

        if (updateData.category_name) {
            const existed = await categoryRepository.findByName(updateData.category_name);
            if (existed && existed._id.toString() !== id) {
                throw new Error("Tên danh mục đã tồn tại!");
            }
        }
        return await categoryRepository.update(id, updateData);
    }

    async existsActiveProductsInCategory(categoryId) {
        const allRelatedIds = await categoryRepository.getAllDescendantIds(categoryId);
        return await productRepository.existsInCategories(allRelatedIds);
    }

    async deleteCategory(id) {
        const category = await categoryRepository.findById(id);
        if (!category) {
            throw new Error('Danh mục không tồn tại!');
        }

        // Kiểm tra sản phẩm active trong danh mục và các danh mục con
        if (await this.existsActiveProductsInCategory(id)) {
            throw new Error('Không thể xóa danh mục vì có sản phẩm đang đấu giá trong danh mục này hoặc các danh mục con.');
        }

        // Xóa tất cả danh mục con trước, sau đó xóa danh mục cha
        const allRelatedIds = await categoryRepository.getAllDescendantIds(id);
        for (const categoryId of allRelatedIds.reverse()) {
            await categoryRepository.delete(categoryId);
        }

        return true;
    }
}

export const categoryService = new CategoryService();

import { Category } from '../../db/schema.js';
import slugify from 'slugify'

class CategoryRepository {
    async create(data) {
        const parentId = data.parent || null;

        const slug = await this.generateSlug(data.category_name);
        const categoryData = { ...data, parent: parentId, slug };
        const category = new Category(categoryData);
        return await category.save();
    }

    async findAll() {
        return await Category.find().populate("parent", "category_name").sort({ category_name: 1 });             
    }

    async findById(id) {
        return await Category.findById(id).populate("parent", "category_name");
    }

    async findByName(name) {
        return await Category.findOne({
            category_name: {
                $regex: `^${name}$`,
                $options: 'i'
            }
        });
    }

    async findBySlug(slug) {
        return await Category.findOne({ slug }).populate("parent", "category_name");
    }

    async update(id, updateData) {
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        // parent
        if ('parent' in updateData) {
            const pid = updateData.parent;

            // Các giá trị biểu thị "Xóa danh mục cha"
            const emptyValues = [null, "", "null"]; 

            if (emptyValues.includes(pid)) {
                updateData.parent = null; 
            } 
            else {
                if (pid.toString() === id.toString()) {
                    throw new Error("Danh mục cha không thể là chính nó");
                }
            }
        }

        // slug
        if (updateData.category_name) {
            updateData.slug = await this.generateSlug(updateData.category_name, id);
        }

        return await Category.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate("parent", "category_name");
    }

    async delete(id) {
        return await Category.findByIdAndDelete(id);
    }

    async findBySlug(slug) {
        return await Category.findOne({ slug }).populate("parent", "category_name");
    }

    async findByName(name) {
        return await Category.findOne({
            category_name: { 
                $regex: `^${name}$`, // Khớp 100% độ dài
                $options: 'i'        // Bỏ qua hoa thường
            }
        });
    }

    async generateSlug(name, excludeId = null) {
        const baseSlug = slugify(name, {
            lower: true,
            strict: true,
            locale: 'vi'
        });

        let slug = baseSlug;
        let count = 1;
        const filter = excludeId ? { slug, _id: { $ne: excludeId } } : { slug };
        while (await Category.findOne(filter)) {
            slug = `${baseSlug}-${count}`;
            count++;
            filter.slug = slug; 
        }
        return slug;
    }

    async hasChildren(id) {
        const children = await Category.exists({ parent: id });
        return !!children;
    }

    async getAllDescendantIds(id) {
        let ids = [id];
        const children = await Category.find({ parent: id }).select('_id');

        for (const child of children) {
            const descendantIds = await this.getAllDescendantIds(child._id);
            ids = ids.concat(descendantIds);
        }

        return ids;
    }
}

export const categoryRepository = new CategoryRepository();

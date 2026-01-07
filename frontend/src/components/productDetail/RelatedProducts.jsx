import ProductSection from '../product/ProductSection'

export default function RelatedProducts({ products, loading = false }) {
    return (
        <ProductSection 
            title="Sản phẩm cùng chuyên mục"
            products={products}
            loading={loading}
        />
    );
}

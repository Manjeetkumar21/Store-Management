import { ShoppingCart } from "lucide-react"
import { formatCurrency } from "@/utils/currency"

export const ProductCard = ({ product }) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <ShoppingCart size={48} className="text-gray-400" />
                )}
            </div>

            {/* Product Info */}
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description || "No description available"}</p>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(product.price)}</p>
                        <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

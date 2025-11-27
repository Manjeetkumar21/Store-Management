import { useEffect, useState } from "react"
import { ShoppingCart, Star } from "lucide-react"
import toast from "react-hot-toast"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/Button"
import axiosInstance from "@/api/axiosInstance"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { addToCart } from "@/redux/slices/cartSlice"

export const StoreProducts = () => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState({})

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (user?._id) {
          const response = await axiosInstance.get(`/product/store/${user._id}`)
          setProducts(response.data.data)
          const initialQuantities = {}
          response.data.data.forEach((p) => {
            initialQuantities[p._id] = 1
          })
          setQuantities(initialQuantities)
        }
      } catch (error) {
        toast.error("Failed to fetch products")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [user?._id])

  const handleAddToCart = (product) => {
    const quantity = quantities[product._id] || 1
    if (quantity > product.stock) {
      toast.error("Not enough stock available")
      return
    }

    dispatch(
      addToCart({
        productId: product._id,
        title: product.title,
        price: product.price,
        quantity,
        image: product.image,
      }),
    )

    toast.success(`${product.title} added to cart!`)
    setQuantities({ ...quantities, [product._id]: 1 })
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Browse and add products to your cart</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <ShoppingCart className="text-gray-400" size={48} />
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{product.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {product.brand} • {product.category}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star size={16} fill="currentColor" />
                      <span className="text-xs text-gray-600">4.5</span>
                    </div>
                  </div>

                  <p className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                  </p>

                  {product.stock > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setQuantities({
                              ...quantities,
                              [product._id]: Math.max(1, (quantities[product._id] || 1) - 1),
                            })
                          }
                          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="flex-1 text-center text-sm">{quantities[product._id] || 1}</span>
                        <button
                          onClick={() =>
                            setQuantities({
                              ...quantities,
                              [product._id]: Math.min(product.stock, (quantities[product._id] || 1) + 1),
                            })
                          }
                          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      <Button variant="primary" className="w-full" onClick={() => handleAddToCart(product)}>
                        Add to Cart
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

"use client"

import { useEffect, useState, useMemo } from "react"
import { ShoppingCart, Package, Plus, Minus, Search, Heart, SlidersHorizontal } from "lucide-react"
import toast from "react-hot-toast"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import axiosInstance from "@/api/axiosInstance"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setCart } from "@/redux/slices/cartSlice"
import { formatDimensions } from "@/utils/format"


const ProductCard = ({ product, onAddToCart }) => {
  const [qty, setQty] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = async () => {
    setIsAdding(true)
    await onAddToCart(product, qty)
    setIsAdding(false)
    setQty(1) // Reset quantity after adding
  }

  return (
    <div className="group bg-white rounded-2xl border-2 border-gray-100 transition-all duration-300 hover:border-blue-200 hover:shadow-xl flex flex-col overflow-hidden">

      {/* Out of Stock Badge */}
      {product.qty === 0 && (
        <span className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-md">
          Out of Stock
        </span>
      )}

      {/* Image Area */}
      <div className="relative aspect-4/3 overflow-hidden bg-gray-50">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Package size={56} strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{product.brand}</span>
        </div>

        <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 mb-3 min-h-[2.5rem]">
          {product.name}
        </h3>

        {formatDimensions(product.dimensions) && (
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <span>📏</span>
            <span>{formatDimensions(product.dimensions)}</span>
          </p>
        )}

        <div className="mt-auto">
          <div className="mb-4">
            <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
            <span className="text-sm text-gray-500 ml-2">MRP</span>
          </div>

          {/* Action Area */}
          {product.qty > 0 ? (
            <div className="space-y-3">
              {/* Quantity Selector */}
              <div className="flex items-center justify-center bg-gray-50 rounded-xl border-2 border-gray-200 h-11">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={isAdding}
                  className="flex-1 h-full hover:bg-gray-100 text-gray-700 transition-colors rounded-l-xl disabled:opacity-50 font-semibold"
                >
                  <Minus size={16} className="mx-auto" />
                </button>
                <div className="w-16 text-center border-x-2 border-gray-200 h-full flex items-center justify-center">
                  <span className="text-base font-bold text-gray-900">{qty}</span>
                </div>
                <button
                  onClick={() => setQty(Math.min(product.qty, qty + 1))}
                  disabled={isAdding}
                  className="flex-1 h-full hover:bg-gray-100 text-gray-700 transition-colors rounded-r-xl disabled:opacity-50 font-semibold"
                >
                  <Plus size={16} className="mx-auto" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAdd}
                disabled={isAdding}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 hover:cursor-pointer active:bg-blue-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isAdding ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <button disabled className="w-full h-11 bg-gray-100 text-gray-400 font-semibold rounded-xl border-2 border-gray-200 cursor-not-allowed">
              Currently Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Skeleton Component
const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
    <div className="bg-gray-100 aspect-[4/3] animate-pulse" />
    <div className="p-5 space-y-3">
      <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse" />
      <div className="h-5 bg-gray-100 rounded w-3/4 animate-pulse" />
      <div className="h-7 bg-gray-100 rounded w-1/2 mt-4 animate-pulse" />
      <div className="h-11 bg-gray-100 rounded-xl mt-4 animate-pulse" />
    </div>
  </div>
)

// Main Component
export const StoreProducts = () => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("featured")

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!user?.id) return
        const res = await axiosInstance.get(`/product/store/${user.id}`)
        setProducts(res.data.data)
      } catch (err) {
        toast.error("Failed to load products")
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [user?.id])

  const handleAddToCart = async (product, qty) => {
    try {
      const res = await axiosInstance.post("/cart", {
        productId: product.id,
        qty: qty,
      })
      const cartItems = res.data.cart.items.map(item => ({
        productId: item.productId.id,
        title: item.productId.name,
        brand: item.productId.brand,
        category: item.productId.category,
        price: item.price,
        quantity: item.qty,
        image: item.productId.image
      }))
      dispatch(setCart(cartItems))
      toast.success("Product added to cart")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add")
    }
  }

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return result.sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price
      if (sortBy === "price-high") return b.price - a.price
      if (sortBy === "popular") return b.qty - a.qty
      return 0
    })
  }, [products, searchTerm, sortBy])

  return (
    <MainLayout>
      <div className="h-full">

        {/* Header Section */}
        <div className="sticky top-0 z-40">
          <div className="max-w-full mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <ShoppingCart size={32} className="text-blue-600" /> Products
                </h1>
                <p className="text-gray-500 mt-2 text-lg">{products.length} products available</p>
              </div>

              {/* Controls */}
              <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search products or brands..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition-all placeholder:text-gray-400"
                  />
                </div>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-4 pr-11 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-blue-300 focus:outline-none focus:border-blue-500 cursor-pointer transition-all"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                  </select>
                  <SlidersHorizontal size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 border-2 border-blue-100 mb-6">
                <Search className="text-blue-400" size={40} strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No products found</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8 text-lg">
                We couldn't find any products matching <span className="font-semibold text-gray-900">"{searchTerm}"</span>
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout >
  )
}
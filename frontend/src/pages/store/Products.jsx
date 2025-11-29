"use client"

import { useEffect, useState } from "react"
import { ShoppingCart, Star, Package, Plus, Minus, Search, Heart, TrendingUp } from "lucide-react"
import toast from "react-hot-toast"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import axiosInstance from "@/api/axiosInstance"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { addToCart as addCartRedux } from "@/redux/slices/cartSlice"

export const StoreProducts = () => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [wishlisted, setWishlisted] = useState({})

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!user?.id) return
        const res = await axiosInstance.get(`/product/store/${user.id}`)
        setProducts(res.data.data)
        const initial = {}
        res.data.data.forEach((p) => (initial[p._id] = 1))
        setQuantities(initial)
      } catch (err) {
        toast.error("Failed to load products")
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [user?.id])

  const toggleWishlist = (productId) => {
    setWishlisted({
      ...wishlisted,
      [productId]: !wishlisted[productId],
    })
  }

  const handleAddToCart = async (product) => {
    const quantity = quantities[product._id] || 1
    try {
      const res = await axiosInstance.post("/cart", {
        productId: product._id,
        qty: quantity,
      })
      dispatch(addCartRedux(res.data.cart))
      toast.success(`${product.name} added to cart`)
      setQuantities({ ...quantities, [product._id]: 1 })
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add")
    }
  }

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price
    if (sortBy === "price-high") return b.price - a.price
    if (sortBy === "popular") return b.qty - a.qty
    return 0
  })

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} />
              <span className="text-sm font-semibold uppercase tracking-wide">Featured Collection</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Discover Premium Products</h1>
            <p className="text-slate-300 max-w-2xl text-lg">
              Explore our curated selection of high-quality items handpicked for you
            </p>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-700"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing <span className="font-semibold">{sortedProducts.length}</span> of{" "}
                <span className="font-semibold">{products.length}</span> products
              </p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="relative w-16 h-16 mb-4">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin"
                  style={{ borderRight: "4px solid transparent" }}
                ></div>
              </div>
              <p className="text-slate-600 text-lg font-medium">Loading premium products...</p>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-slate-200">
              <Package size={64} className="text-slate-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No Products Found</h3>
              <p className="text-slate-500 mb-6">We couldn't find any products matching your search.</p>
              <button
                onClick={() => setSearchTerm("")}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <div
                  key={product._id}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-200 hover:border-blue-200 flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative h-56 bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="text-slate-300" size={56} />
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      {product.qty > 0 ? (
                        <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          In Stock
                        </span>
                      ) : (
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(product._id)}
                      className="absolute top-3 left-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition"
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        size={18}
                        className={`transition ${wishlisted[product._id] ? "fill-red-500 text-red-500" : "text-slate-400"}`}
                      />
                    </button>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>

                  {/* Details */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Brand & Rating */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{product.brand}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={`${i < 4 ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-semibold text-slate-900 mb-3 line-clamp-2 text-sm leading-snug h-9">
                      {product.name}
                    </h3>

                    {/* Price */}
                    <p className="text-2xl font-bold text-slate-900 mb-4">₹{product.price.toLocaleString()}</p>

                    {/* Quantity & Actions */}
                    {product.qty > 0 ? (
                      <div className="space-y-3">
                        {/* Quantity Selector */}
                        <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                          <button
                            onClick={() =>
                              setQuantities({
                                ...quantities,
                                [product._id]: Math.max(1, quantities[product._id] - 1),
                              })
                            }
                            className="w-7 h-7 rounded hover:bg-slate-200 flex items-center justify-center transition text-slate-600 hover:text-slate-900"
                            disabled={quantities[product._id] <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="font-semibold text-slate-900 flex-1 text-center text-sm">
                            {quantities[product._id]}
                          </span>
                          <button
                            onClick={() =>
                              setQuantities({
                                ...quantities,
                                [product._id]: Math.min(product.qty, quantities[product._id] + 1),
                              })
                            }
                            className="w-7 h-7 rounded hover:bg-slate-200 flex items-center justify-center transition text-slate-600 hover:text-slate-900"
                            disabled={quantities[product._id] >= product.qty}
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg"
                        >
                          <ShoppingCart size={16} />
                          Add to Cart
                        </Button>
                      </div>
                    ) : (
                      <button
                        disabled
                        className="w-full bg-slate-100 text-slate-500 font-semibold py-2.5 rounded-lg cursor-not-allowed transition"
                      >
                        Unavailable
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { LandingNavbar } from "@/components/landing/LandingNavbar"
import { LandingFooter } from "@/components/landing/LandingFooter"
import { ProductCard } from "@/components/landing/ProductCard"
import { Package, ShoppingCart, TrendingUp, Clock, ArrowRight } from "lucide-react"
import { useAppSelector } from "@/redux/hooks"
import axiosInstance from "@/api/axiosInstance"
import toast from "react-hot-toast"
import { Link } from "react-router-dom"

export const StoreLanding = () => {
    const navigate = useNavigate()
    const { user } = useAppSelector((state) => state.auth)
    const [products, setProducts] = useState([])
    const [store, setStore] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStoreData()
        fetchProducts()
    }, [])

    const fetchStoreData = async () => {
        try {
            // Fetch the logged-in store's details
            const response = await axiosInstance.get("/store/me")
            setStore(response.data.data)
        } catch (error) {
            console.error("Error fetching store details:", error)
            // Use defaults if fetch fails
        }
    }

    const fetchProducts = async () => {
        try {
            const response = await axiosInstance.get("/product")
            setProducts(response.data.data.slice(0, 4))
        } catch (error) {
            console.error("Error fetching products:", error)
            toast.error("Failed to load products")
        } finally {
            setLoading(false)
        }
    }

    // Get landing page data with defaults
    const landingData = store?.landingPage || {}
    const heroHeading = landingData.hero?.heading || "Streamline Your Store Operations"
    const heroSubheading = landingData.hero?.subheading || "Manage inventory, track orders, and grow your business with our comprehensive store management platform. Everything you need in one place."
    const heroImage = landingData.hero?.heroImage || "/store_hero_illustration.png"
    const logoImage = landingData.navbar?.logoImage || ""

    return (
        <div className="min-h-screen bg-gray-50">
            <LandingNavbar role="store" dashboardLink="/store/dashboard" logoImage={logoImage} />

            {/* Hero Section */}
            <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                                {heroHeading}
                            </h1>
                            <p className="text-lg sm:text-xl text-gray-600 mb-8">
                                {heroSubheading}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/store/dashboard"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
                                >
                                    Access Dashboard
                                </Link>
                                <Link
                                    to="/store/products"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-lg"
                                >
                                    View Products
                                </Link>
                            </div>
                        </div>

                        {/* Right Image */}
                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-50 rounded-2xl flex items-center justify-center p-8">
                                <img
                                    src={heroImage}
                                    alt="Store Management Illustration"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        e.target.style.display = 'none'
                                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-48 h-48 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg></div>'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Why Choose StoreHub?
                        </h2>
                        <p className="text-lg text-gray-600">
                            Everything you need to run your store efficiently
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Feature 1 */}
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                <Package className="text-blue-600" size={32} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Product Management
                            </h3>
                            <p className="text-gray-600">
                                Easy inventory tracking and product organization
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                <ShoppingCart className="text-green-600" size={32} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Order Processing
                            </h3>
                            <p className="text-gray-600">
                                Streamlined order management and fulfillment
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                                <TrendingUp className="text-purple-600" size={32} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Sales Analytics
                            </h3>
                            <p className="text-gray-600">
                                Track performance and identify trends
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                                <Clock className="text-orange-600" size={32} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Real-Time Updates
                            </h3>
                            <p className="text-gray-600">
                                Stay updated with instant notifications
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section id="products" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                                Our Products
                            </h2>
                            <p className="text-lg text-gray-600">
                                Featured items from our collection
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/store/products")}
                            className="hidden sm:flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            View All Products
                            <ArrowRight size={20} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                            <p className="text-gray-500 mt-4">Loading products...</p>
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                            <div className="mt-8 text-center sm:hidden">
                                <button
                                    onClick={() => navigate("/store/products")}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    View All Products
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                            <Package size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500 text-lg">No products available yet</p>
                        </div>
                    )}
                </div>
            </section>

            <LandingFooter role="store" storeData={store} />
        </div>
    )
}

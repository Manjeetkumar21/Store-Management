import { LandingNavbar } from "@/components/landing/LandingNavbar"
import { LandingFooter } from "@/components/landing/LandingFooter"
import { BarChart3, Building2, Shield, TrendingUp } from "lucide-react"

export const AdminLanding = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <LandingNavbar role="admin" dashboardLink="/admin/dashboard" />

            {/* Hero Section */}
            <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                                Powerful Admin
                                <span className="text-blue-600"> Control Center</span>
                            </h1>
                            <p className="text-lg sm:text-xl text-gray-600 mb-8">
                                Manage your entire store network with ease. Monitor performance, track orders, and oversee operations from a single, intuitive dashboard.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a
                                    href="/admin/dashboard"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
                                >
                                    Access Dashboard
                                </a>
                                <a
                                    href="#features"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-lg"
                                >
                                    Learn More
                                </a>
                            </div>
                        </div>

                        {/* Right Image */}
                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center p-8">
                                <svg className="w-full h-full text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Everything You Need to Manage
                        </h2>
                        <p className="text-lg text-gray-600">
                            Comprehensive tools for complete control
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Feature 1 */}
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                <Building2 className="text-blue-600" size={32} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Company Management
                            </h3>
                            <p className="text-gray-600">
                                Manage multiple companies and their stores effortlessly
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                <BarChart3 className="text-green-600" size={32} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Analytics & Reports
                            </h3>
                            <p className="text-gray-600">
                                Real-time insights and comprehensive reporting
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                                <TrendingUp className="text-purple-600" size={32} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Revenue Tracking
                            </h3>
                            <p className="text-gray-600">
                                Monitor revenue and financial performance
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                                <Shield className="text-orange-600" size={32} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Secure & Reliable
                            </h3>
                            <p className="text-gray-600">
                                Enterprise-grade security for your data
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <LandingFooter role="admin" />
        </div>
    )
}

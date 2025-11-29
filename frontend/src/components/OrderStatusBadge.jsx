import {
    Clock,
    CheckCircle,
    XCircle,
    Package,
    Truck,
    AlertCircle,
    DollarSign,
    CreditCard
} from "lucide-react";

const statusConfig = {
    // Order Status
    pending: {
        label: "Pending",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
    },
    confirmed: {
        label: "Confirmed",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: CheckCircle,
    },
    cancelled: {
        label: "Cancelled",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
    },
    completed: {
        label: "Completed",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
    },

    // Payment Status
    submitted: {
        label: "Payment Submitted",
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: CreditCard,
    },
    verified: {
        label: "Payment Verified",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: DollarSign,
    },
    failed: {
        label: "Payment Failed",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: AlertCircle,
    },

    // Shipping Status
    processing: {
        label: "Processing",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Package,
    },
    shipped: {
        label: "Shipped",
        color: "bg-indigo-100 text-indigo-800 border-indigo-200",
        icon: Truck,
    },
    delivered: {
        label: "Delivered",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
    },
};

export const OrderStatusBadge = ({ status, type = "order" }) => {
    const config = statusConfig[status] || {
        label: status,
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: AlertCircle,
    };

    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full border ${config.color}`}
        >
            <Icon size={14} />
            {config.label}
        </span>
    );
};

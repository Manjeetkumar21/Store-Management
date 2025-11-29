import { Check, Circle } from "lucide-react";

const timelineSteps = [
    { key: "created", label: "Order Placed", dateField: "createdAt" },
    { key: "confirmed", label: "Order Confirmed", dateField: "confirmedAt" },
    { key: "paid", label: "Payment Verified", dateField: "paymentVerifiedAt" },
    { key: "shipped", label: "Order Shipped", dateField: "shippedAt" },
    { key: "delivered", label: "Order Delivered", dateField: "deliveredAt" },
];

export const OrderTimeline = ({ order }) => {
    const getStepStatus = (step) => {
        switch (step.key) {
            case "created":
                return "completed";
            case "confirmed":
                return order.status === "confirmed" || order.status === "completed"
                    ? "completed"
                    : order.status === "cancelled"
                        ? "cancelled"
                        : "pending";
            case "paid":
                return order.paymentStatus === "verified" ? "completed" : "pending";
            case "shipped":
                return order.shippingStatus === "shipped" || order.shippingStatus === "delivered"
                    ? "completed"
                    : "pending";
            case "delivered":
                return order.shippingStatus === "delivered" ? "completed" : "pending";
            default:
                return "pending";
        }
    };

    const getStepDate = (step) => {
        if (step.key === "created") return order.createdAt;
        if (step.key === "confirmed") return order.confirmedAt;
        if (step.key === "paid" && order.paymentId?.verifiedAt) return order.paymentId.verifiedAt;
        if (step.key === "shipped") return order.shippedAt;
        if (step.key === "delivered") return order.deliveredAt;
        return null;
    };

    if (order.status === "cancelled") {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                        <Check size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="font-semibold text-red-900">Order Cancelled</p>
                        <p className="text-sm text-red-700">
                            {new Date(order.cancelledAt).toLocaleString()}
                        </p>
                        {order.cancellationReason && (
                            <p className="text-sm text-red-600 mt-1">
                                Reason: {order.cancellationReason}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {timelineSteps.map((step, index) => {
                const status = getStepStatus(step);
                const date = getStepDate(step);
                const isLast = index === timelineSteps.length - 1;

                return (
                    <div key={step.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${status === "completed"
                                        ? "bg-green-600"
                                        : status === "cancelled"
                                            ? "bg-red-600"
                                            : "bg-gray-300"
                                    }`}
                            >
                                {status === "completed" ? (
                                    <Check size={16} className="text-white" />
                                ) : (
                                    <Circle size={16} className="text-white" />
                                )}
                            </div>
                            {!isLast && (
                                <div
                                    className={`w-0.5 h-12 ${status === "completed" ? "bg-green-600" : "bg-gray-300"
                                        }`}
                                />
                            )}
                        </div>
                        <div className="flex-1 pb-8">
                            <p
                                className={`font-medium ${status === "completed"
                                        ? "text-gray-900"
                                        : "text-gray-500"
                                    }`}
                            >
                                {step.label}
                            </p>
                            {date && (
                                <p className="text-sm text-gray-600 mt-1">
                                    {new Date(date).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

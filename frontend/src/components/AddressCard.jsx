import { MapPin, Phone, User, Check } from "lucide-react";

export const AddressCard = ({
    address,
    isSelected = false,
    onSelect,
    onEdit,
    onDelete,
    onSetDefault,
    showActions = true,
    selectable = false
}) => {
    return (
        <div
            className={`relative p-4 rounded-lg border-2 transition-all ${isSelected
                    ? "border-blue-600 bg-blue-50"
                    : address.isDefault
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                }`}
            onClick={selectable && onSelect ? () => onSelect(address) : undefined}
            style={{ cursor: selectable ? "pointer" : "default" }}
        >
            {address.isDefault && (
                <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                        <Check size={12} />
                        Default
                    </span>
                </div>
            )}

            {selectable && (
                <div className="absolute top-4 left-4">
                    <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => onSelect(address)}
                        className="w-4 h-4 text-blue-600"
                    />
                </div>
            )}

            <div className={selectable ? "ml-8" : ""}>
                <div className="flex items-start gap-2 mb-2">
                    <User size={16} className="text-gray-600 mt-1" />
                    <div>
                        <p className="font-semibold text-gray-900">{address.fullName}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <Phone size={14} />
                            {address.phone}
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-700 mt-3">
                    <MapPin size={16} className="text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p>{address.addressLine1}</p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        <p>
                            {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p>{address.country}</p>
                    </div>
                </div>

                {showActions && !selectable && (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                        {!address.isDefault && onSetDefault && (
                            <button
                                onClick={() => onSetDefault(address.id)}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Set as Default
                            </button>
                        )}
                        {onEdit && (
                            <button
                                onClick={() => onEdit(address)}
                                className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                            >
                                Edit
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(address.id)}
                                className="text-sm text-red-600 hover:text-red-700 font-medium ml-auto"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

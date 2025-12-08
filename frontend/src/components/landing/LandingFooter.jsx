import { Store, Mail, Phone, MapPin } from "lucide-react";

export const LandingFooter = ({ role, storeData }) => {
  const currentYear = new Date().getFullYear();

  // Get footer data from store
  const footerData = storeData?.landingPage?.footer || {};
  const footerLogo = footerData.logoImage || "";
  const footerHeading = footerData.footerHeading || "Contact Us";
  const footerEmail = footerData.email || "support@storehub.com";
  const footerPhone = footerData.phone || "+1 (555) 123-4567";
  const footerAddress = footerData.address || {};
  const addressText = footerAddress.street
    ? `${footerAddress.street}, ${footerAddress.city || ""}, ${footerAddress.state || ""
      } ${footerAddress.zipCode || ""}, ${footerAddress.country || ""}`
      .replace(/,\s*,/g, ",")
      .trim()
    : "123 Business St, City, Country";

  const storeName = storeData?.name || "TCPL Stores";

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className=" flex justify-between lg:items-center items-baseline lg:flex-row flex-col gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {footerLogo ? (
                <img
                  src={footerLogo}
                  alt={`${storeName} logo`}
                  className="h-10 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextElementSibling.style.display = "flex";
                  }}
                />
              ) : (
                <img
                  src="tcpl-logo.webp"
                  alt="Logo"
                  className="h-10 w-auto rounded-lg object-cover"
                />
              )}

              <h3 className="text-xl font-bold text-white">{storeName}</h3>
            </div>
            <p className="text-sm text-gray-400">
              {role === "admin"
                ? "Powerful admin tools for managing your store network."
                : "Streamline your store operations with our comprehensive management system."}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">{footerHeading}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-blue-400 flex-shrink-0" />
                <span className="break-all">{footerEmail}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-blue-400 flex-shrink-0" />
                <span>{footerPhone}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin
                  size={16}
                  className="text-blue-400 flex-shrink-0 mt-0.5"
                />
                <span className="flex-1">{addressText}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>
            &copy; {currentYear} {storeName}. All rights reserved.
          </p>

          <p>
            Developed by <a target="_blank" href="https://www.nexbern.com/">Nexbern Technologies </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

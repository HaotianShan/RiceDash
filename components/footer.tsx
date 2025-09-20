import { FaInstagram, FaTwitter } from "react-icons/fa";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Serveries",
      links: [
        { name: "Seibel Servery", href: "#" },
        { name: "North Servery", href: "#" },
        { name: "South Servery", href: "#" },
        { name: "West Servery", href: "#" },
        { name: "Baker Servery", href: "#" },
      ],
    },
    {
      title: "For Students",
      links: [
        { name: "Order Food", href: "/order" },
        { name: "Become a Dasher", href: "/apply" },
        { name: "Student Pricing", href: "/pricing" },
        { name: "Track Orders", href: "/track" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Contact Us", href: "/contact" },
        { name: "Rice ID Verification", href: "/verify" },
        { name: "Community Guidelines", href: "/guidelines" },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 pr-8">
            <Link href="/" className="mb-4 inline-block">
              <h2 className="font-bold text-3xl text-white">RiceDash</h2>
            </Link>
            <p className="text-gray-400">
              Food delivery by Rice students, for Rice students. Fast, reliable,
              and made with Rice spirit.
            </p>
          </div>

          {/* Links Columns */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-lg font-semibold text-white tracking-wider">
                {section.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-white"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-12" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="text-sm text-gray-500">
            <p>&copy; {currentYear} RiceDash. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
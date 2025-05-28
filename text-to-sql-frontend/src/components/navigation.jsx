"use client";

import { Link, useLocation } from "react-router-dom";

export default function Navigation() {
  const location = useLocation();

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Favorites", path: "/favorites" },
    { label: "Benchmark", path: "/benchmark" },
  ];

  return (
    <div className="fixed top-0 left-0 w-full bg-gray-950 shadow-md z-50">
      <nav className="flex justify-center gap-8 py-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`font-medium transition ${location.pathname === item.path
                ? "text-white border-b-2 border-white pb-1"
                : "text-gray-400 hover:text-white"
              }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

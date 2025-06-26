"use client";

import { useEffect, useState } from "react";
import Navigation from "../components/navigation";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/getFavorites`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch favorites");

      const data = await response.json();
      setFavorites(data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/removeFavorite?index=${id}`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to remove favorite");

      fetchFavorites();
    } catch (error) {
      console.error("Error deleting favorite:", error);
    }
  };

  return (
    <>
      <Navigation />
      <div className="p-4 md:p-6 pt-20 flex justify-center">
        <div className="w-full max-w-5xl">
          <h1 className="text-xl md:text-2xl font-bold mb-4 text-center">Favorites</h1>
          <p className="text-sm md:text-base text-center mb-6 px-2">
            Here are the queries favorited by users. These queries are sent to all subsequent requests and enhance the results.
            You can favorite queries once you get a response from the Webapp by clicking on the red heart. These queries are
            also used by the benchmark to enhance its result. Important to notice, there are no benchmark queries listed here.
          </p>

          {loading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow border border-gray-300">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-center font-semibold uppercase">ID</th>
                    <th className="px-4 py-3 text-center font-semibold uppercase">Query</th>
                    <th className="px-4 py-3 text-center font-semibold uppercase">Example SQL</th>
                    <th className="px-4 py-3 text-center font-semibold uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {favorites.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-center font-medium">{item.id}</td>
                      <td className="px-4 py-3 text-center max-w-[200px] truncate">{item.query}</td>
                      <td className="px-4 py-3 text-center max-w-[300px] truncate">{item.sql}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

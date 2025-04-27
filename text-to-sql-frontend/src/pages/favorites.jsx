"use client";

import { useEffect, useState } from "react";
import Navigation from "../components/navigation";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const response = await fetch("http://localhost:8080/getFavorites", {
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
      const response = await fetch(`http://localhost:8080/removeFavorite?index=${id}`, {
        method: "POST", // ✅ important: POST not GET
      });

      if (!response.ok) throw new Error("Failed to remove favorite");

      // After successful deletion, refetch the updated favorites
      fetchFavorites();
    } catch (error) {
      console.error("Error deleting favorite:", error);
    }
  };

  return (
    <>
      <Navigation />
      <div className="p-6 flex justify-center pt-20">
        <div className="w-full max-w-3xl overflow-x-auto">
          <h1 className="text-2xl font-bold mb-4 text-center">Favorites</h1>
          <p className="text-center mb-4">
            Here are the queries favorited by users. These queries are sent to all subsequent requests and enhance the results. You can favorite queries once you get a response from the Webapp by clicking on the red heart. These queries are also used by the benchmark to enhance its result. Important to notice, there are no benchmark queries listed here.
          </p>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Query</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Example SQL</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {favorites.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 text-center font-semibold">{item.id}</td>
                    <td className="px-6 py-4 text-center max-w-[200px] truncate">{item.query}</td>
                    <td className="px-6 py-4 text-center max-w-[300px] truncate">{item.sql}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700 font-semibold text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

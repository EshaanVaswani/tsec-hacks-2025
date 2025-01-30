import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

// Define base URL as a constant to ensure consistency
const API_BASE_URL = "http://127.0.0.1:8000";

export default function LawComparison() {
  const [law1, setLaw1] = useState("");
  const [law2, setLaw2] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [comparison, setComparison] = useState<string[][]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (law1 && law2) {
      compareTexts();
    }
  }, [law1, law2]);

  const compareTexts = async () => {
    if (!law1 || !law2) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/compare-laws`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text1: law1, text2: law2 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Comparison failed");
      }

      setComparison(data.comparison);
    } catch (err) {
      console.error("Comparison error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to compare texts. Please try again."
      );
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/search-law`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Search failed");
      }

      setLaw2(data.lawText || "");
    } catch (err) {
      console.error("Search error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch law. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Law Comparison Tool</h1>

      <div className="flex gap-4 mb-6">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for an Indian law..."
          className="flex-grow"
          onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSearch()}
          disabled={isLoading}
        />
        <Button
          onClick={handleSearch}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Law 1</h2>
          <Textarea
            value={law1}
            onChange={(e) => setLaw1(e.target.value)}
            placeholder="Enter the text of the first law here..."
            className="w-full h-40"
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Law 2</h2>
          <Textarea
            value={law2}
            onChange={(e) => setLaw2(e.target.value)}
            placeholder="Enter the text of the second law here..."
            className="w-full h-40"
          />
        </div>
      </div>

      <Button
        onClick={() => {
          setComparison([]);
          setLaw1("");
          setLaw2("");
          setSearchQuery("");
          setError("");
        }}
        className="mb-4"
      >
        Clear All
      </Button>

      {comparison.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4 border rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-4">
            <h3 className="font-semibold mb-2">Law 1</h3>
            {comparison.map((line, index) => (
              <p
                key={`law1-${index}`}
                className={`py-1 ${line[0] !== line[1] ? "bg-yellow-200" : ""}`}
              >
                {line[0] || "\u00A0"}
              </p>
            ))}
          </div>
          <div className="bg-gray-100 p-4">
            <h3 className="font-semibold mb-2">Law 2</h3>
            {comparison.map((line, index) => (
              <p
                key={`law2-${index}`}
                className={`py-1 ${line[0] !== line[1] ? "bg-yellow-200" : ""}`}
              >
                {line[1] || "\u00A0"}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

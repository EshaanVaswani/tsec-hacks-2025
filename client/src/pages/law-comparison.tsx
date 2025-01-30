import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Search } from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:5001";

interface SearchResult {
  content: string;
  similarity: number;
  metadata: {
    source: string;
  };
}

export default function LawComparison() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState("");

  const handleCompare = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/compare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Comparison failed");
      }

      setComparisonResult(data.result);
    } catch (err) {
      console.error("Comparison error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to compare laws. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
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

      setSearchResults(data.results);
    } catch (err) {
      console.error("Search error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch results. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Law Evolution Analysis</h1>

      <div className="flex gap-4 mb-6">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a law or legal topic..."
          className="flex-grow"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLoading) {
              handleSearch();
            }
          }}
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
        <Button
          onClick={handleCompare}
          disabled={isLoading || !searchQuery.trim()}
          variant="secondary"
        >
          {isLoading ? "Analyzing..." : "Analyze Evolution"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Related Legal Texts</h2>
          <div className="space-y-4">
            {searchResults.map((result, index) => (
              <Card key={index} className="hover:bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium">
                      Source: {result.metadata.source}
                    </span>
                    <span className="text-sm text-gray-500">
                      Relevance: {(result.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{result.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {comparisonResult && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-3">Law Evolution Analysis</h2>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{comparisonResult}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={() => {
          setComparisonResult("");
          setSearchQuery("");
          setSearchResults([]);
          setError("");
        }}
        variant="outline"
        className="mt-4"
      >
        Clear All
      </Button>
    </div>
  );
}
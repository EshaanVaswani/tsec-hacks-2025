import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from 'axios';
import useChatStore from '@/hooks/useChatStore';

// Define the structure of search items
interface SearchItem {
  _id: string;
  name: string;
  username: string;
  email: string;
  isOnline: boolean;
}

// Props interface for the search component
interface SearchBarProps {
  searchFunction?: (query: string) => Promise<SearchItem[]>;
  onItemSelect?: (item: SearchItem) => void;
  maxResults?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchFunction,
  maxResults = 5,
}) => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isResultsVisible, setIsResultsVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { setSelectedUser } = useChatStore();

  const defaultSearchFunction = async (searchQuery: string): Promise<SearchItem[]> => {
    if (!searchQuery) return [];
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/search`, {
        params: { username: searchQuery },
        withCredentials : true
      });
      const result = response.data.user;
        if (result.length === 0) return [];
      return response.data.user.slice(0, maxResults);
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  };

  const performSearch = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsResultsVisible(false);
      return;
    }
    setIsLoading(true);
    try {
      const searchResults = await (searchFunction || defaultSearchFunction)(searchQuery);
      setResults(searchResults);
      setIsResultsVisible(searchResults.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setIsResultsVisible(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [query, searchFunction]);

  return (
    <div className="relative w-full max-w-md mb-1">
      <Input
        type="text"
        placeholder="Search users by username"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length > 1 && results.length > 0 && setIsResultsVisible(true)}
        className="w-full pr-10 rounded-[5px]"
        onBlur={() => setTimeout(() => setIsResultsVisible(false), 200)}
      />

      {isResultsVisible && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md  shadow-lg">
          <ScrollArea className="h-auto max-h-60">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Searching...</div>
            ) : results.length > 0 ? (
              results.map((item) => (
                <div
                  key={item?._id}
                  onClick={() => setSelectedUser(item._id)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                >
                  <div>
                    <div className="font-semibold">{item?.name}</div>
                    <div className="text-sm text-gray-500">@{item?.username}</div>
                  </div>
                  <span className="text-xs text-gray-400 self-center">
                    {item.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">No results found</div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default SearchBar;

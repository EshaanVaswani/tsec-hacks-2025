import ImageResults from "../components/ImageResults"
import PeopleResults from "../components/PeopleResults"
import { useState, } from "react"
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SearchIcon } from "lucide-react"


export default function SearchPage() {
  const [search, setSearch] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality here
    console.log("Searching for:", search)
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search invites, people, or time capsules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit"><SearchIcon /></Button>
      </form>      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <ImageResults />
        <PeopleResults />
      </div>
    </div>
  )
}


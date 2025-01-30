import { NewsCard } from "@/components/news-card";
import { NewsLocation, NewsSource } from "@/lib/types";
import axios from "axios";
import { NewspaperIcon } from "lucide-react";
import { useEffect, useState } from "react";

const News = () => {
   interface Article {
      id: number;
      description: string;
      legal_terms_found: string[];
      location: NewsLocation;
      publishedAt: string;
      source: NewsSource;
      title: string;
      url: string;
      urlToImage: string;
   }

   const [news, setNews] = useState<Article[]>([]);

   useEffect(() => {
      const fetchNews = async () => {
         const response = await axios.get("http://localhost:5002/api/news");

         if (response.data.success) {
            console.log(response.data.data.articles);

            setNews(response.data.data.articles);
         }
      };

      fetchNews();
   }, []);

   return (
      <div className="min-h-screen bg-background">
         <main className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8">
               <NewspaperIcon className="h-8 w-8" />
               <h1 className="text-3xl font-bold">Legal News</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {news.map((article) => (
                  <NewsCard key={article.id} article={article} />
               ))}
            </div>
         </main>
      </div>
   );
};

export default News;

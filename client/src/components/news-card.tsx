import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin } from "lucide-react";
import { format } from "date-fns";
import { NewsArticle } from "@/lib/types";


interface NewsCardProps {
  article: NewsArticle;
}

export function NewsCard({ article }: NewsCardProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl leading-tight">{article.title}</CardTitle>
        </div>
        <CardDescription className="flex items-center gap-2 mt-2">
          <MapPin className="h-4 w-4" />
          {article.location.country}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground mb-4">{article.description}</p>
        <div className="flex flex-wrap gap-2">
          {article.legal_terms_found.map((term) => (
            <Badge key={term} variant="secondary">
              {term}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {format(new Date(article.publishedAt), "MMM d, yyyy")}
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            Read more <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
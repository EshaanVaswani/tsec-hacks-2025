from flask import Flask, request, jsonify
from playwright.async_api import async_playwright
import asyncio
from typing import List, Dict, Optional, Tuple
import re
from dataclasses import dataclass
from datetime import datetime

@dataclass
class LawDocument:
    title: str
    url: str
    content: str
    date_published: Optional[str] = None
    category: Optional[str] = None
    act_number: Optional[str] = None
    ministry: Optional[str] = None

class LawScraper:
    def __init__(self):
        self.base_url = "https://www.indiacode.nic.in"
        self.search_path = "/handle/123456789/1362/simple-search"

    async def setup_browser(self, playwright):
        """Initialize browser with appropriate settings"""
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        return browser, context

    async def extract_metadata(self, page) -> dict:
        """Extract metadata from the law document page"""
        metadata = {}
        
        try:
            metadata_selectors = {
                'date_published': 'span[class*="date"], span[class*="published"]',
                'category': 'span[class*="category"], span[class*="subject"]',
                'act_number': 'span[class*="act-number"], span[class*="law-id"]',
                'ministry': 'span[class*="ministry"], span[class*="department"]'
            }
            
            for key, selector in metadata_selectors.items():
                try:
                    element = await page.wait_for_selector(selector, timeout=2000)
                    if element:
                        metadata[key] = await element.inner_text()
                except:
                    continue
                    
            meta_divs = await page.query_selector_all('div[class*="metadata"]')
            for div in meta_divs:
                text = await div.inner_text()
                if ':' in text:
                    key, value = text.split(':', 1)
                    key = key.strip().lower().replace(' ', '_')
                    metadata[key] = value.strip()
                    
        except Exception as e:
            print(f"Metadata extraction error: {str(e)}")
            
        return metadata

    async def scrape_document(self, page, url) -> Optional[LawDocument]:
        """Scrape a single law document"""
        try:
            await page.goto(url)
            await page.wait_for_load_state('networkidle')
            
            content_selectors = [
                'div.item-page',
                'div#content',
                'div[class*="content"]',
                'article'
            ]
            
            content_element = None
            for selector in content_selectors:
                try:
                    content_element = await page.wait_for_selector(selector, timeout=5000)
                    if content_element:
                        break
                except:
                    continue
                    
            if not content_element:
                return None
                
            content = await content_element.inner_text()
            title = await page.title()
            
            content = re.sub(r'\s+', ' ', content).strip()
            content = re.sub(r'\n\s*\n', '\n\n', content)
            
            metadata = await self.extract_metadata(page)
            
            return LawDocument(
                title=title,
                url=url,
                content=content,
                date_published=metadata.get('date_published'),
                category=metadata.get('category'),
                act_number=metadata.get('act_number'),
                ministry=metadata.get('ministry')
            )
            
        except Exception as e:
            print(f"Error scraping document {url}: {str(e)}")
            return None

    async def scrape_search_results(self, query: str, max_results: int = 5) -> Tuple[List[LawDocument], str]:
        """
        Scrape law documents based on search query
        Returns: (list of documents, error message if any)
        """
        documents = []
        error = None
        
        try:
            async with async_playwright() as p:
                browser, context = await self.setup_browser(p)
                page = await context.new_page()
                
                search_url = f"{self.base_url}{self.search_path}?query={query.replace(' ', '+')}&rpp={max_results}&sort_by=score&order=desc"
                
                await page.goto(search_url)
                await page.wait_for_load_state('networkidle')
                
                try:
                    await page.wait_for_selector('.artifact-description', timeout=10000)
                except:
                    return [], "No results found or page took too long to load"
                
                result_links = await page.query_selector_all('.artifact-description a')
                if not result_links:
                    return [], "No results found for the given query"
                
                urls = []
                for link in result_links[:max_results]:
                    href = await link.get_attribute('href')
                    if href:
                        urls.append(f"{self.base_url}{href}")
                
                for url in urls:
                    document = await self.scrape_document(page, url)
                    if document:
                        documents.append(document)
                
                await browser.close()
                
        except Exception as e:
            error = str(e)
            
        return documents, error

def format_law_document(doc: LawDocument) -> dict:
    """Format LawDocument for JSON response"""
    return {
        "title": doc.title,
        "url": doc.url,
        "content": doc.content,
        "metadata": {
            "datePublished": doc.date_published,
            "category": doc.category,
            "actNumber": doc.act_number,
            "ministry": doc.ministry
        }
    }

app = Flask(__name__)

@app.route("/api/search-laws", methods=["POST"])
async def search_laws():
    data = request.get_json()
    query = data.get("query")
    max_results = data.get("maxResults", 5)
    
    if not query:
        return jsonify({"error": "Query is required"}), 400
    
    if not isinstance(max_results, int) or max_results < 1:
        return jsonify({"error": "maxResults must be a positive integer"}), 400
    
    scraper = LawScraper()
    documents, error = await scraper.scrape_search_results(query, max_results)
    
    if error:
        return jsonify({"error": error}), 404 if "No results" in error else 500
    
    response = {
        "query": query,
        "timestamp": datetime.now().isoformat(),
        "totalResults": len(documents),
        "documents": [format_law_document(doc) for doc in documents]
    }
    
    return jsonify(response)

# We need to run Flask with an ASGI server to support async routes
from asgiref.wsgi import WsgiToAsgi
from hypercorn.config import Config
from hypercorn.asyncio import serve

asgi_app = WsgiToAsgi(app)

if __name__ == "__main__":
    config = Config()
    config.bind = ["0.0.0.0:8000"]
    asyncio.run(serve(asgi_app, config))

# Required dependencies for requirements.txt
"""
flask==2.3.3
playwright==1.40.0
hypercorn==0.14.3
asgiref==3.7.2
"""
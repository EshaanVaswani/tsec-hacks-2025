from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from datetime import datetime
import re
import maxminddb
import geoip2.database
import os

app = Flask(__name__)
CORS(app)

class LocationDetector:
    def _init_(self):
        """Initialize with GeoLite2 database"""
        try:
            self.reader = geoip2.database.Reader('GeoLite2-City.mmdb')
        except Exception as e:
            print(f"Error loading GeoIP database: {e}")
            self.reader = None

    def get_location_from_ip(self, ip_address):
        """Get location details from IP address"""
        try:
            if self.reader is None:
                return self.get_location_from_api(ip_address)
            
            response = self.reader.city(ip_address)
            return {
                'city': response.city.name,
                'state': response.subdivisions.most_specific.name if response.subdivisions else None,
                'country': response.country.iso_code or 'IN',
                'latitude': response.location.latitude,
                'longitude': response.location.longitude
            }
        except Exception as e:
            print(f"Error getting location from database: {e}")
            return self.get_location_from_api(ip_address)

    def get_location_from_api(self, ip_address):
        """Fallback method using external IP API"""
        try:
            response = requests.get(f'https://ipapi.co/{ip_address}/json/')
            data = response.json()
            return {
                'city': data.get('city'),
                'state': data.get('region'),
                'country': data.get('country_code', 'IN'),
                'latitude': data.get('latitude'),
                'longitude': data.get('longitude')
            }
        except Exception as e:
            print(f"Error getting location from API: {e}")
            return {
                'city': None,
                'state': None,
                'country': 'IN',
                'latitude': None,
                'longitude': None
            }

class LegalNewsFetcher:
    def __init__(self, api_key):
        """Initialize the Legal News Fetcher with API key and configuration"""
        self.api_key = api_key
        self.base_url = "https://gnews.io/api/v4/search"
        self.location_detector = LocationDetector()
        
        # Core legal terms for search
        self.search_terms = [
            "legal ruling",
            "court hearing",
            "lawsuit",
            "supreme court",
            "federal court",
            "district court"
        ]
        
        # Legal keywords for validation
        self.legal_keywords = {
            'entities': [
                'court', 'judge', 'lawyer', 'attorney', 'plaintiff', 
                'defendant', 'prosecution', 'prosecutor', 'judiciary'
            ],
            'actions': [
                'ruled', 'filed', 'dismissed', 'appealed', 'convicted',
                'sentenced', 'pleaded', 'testified', 'charged'
            ],
            'legal_terms': [
                'lawsuit', 'case', 'trial', 'hearing', 'verdict',
                'settlement', 'appeal', 'ruling', 'judgment', 'litigation',
                'indictment', 'complaint', 'motion', 'briefing'
            ],
            'institutions': [
                'supreme court', 'district court', 'circuit court',
                'federal court', 'state court', 'appeals court',
                'courthouse', 'department of justice', 'doj'
            ]
        }

    def get_user_location(self, request):
        """Get user's location from their IP address with guaranteed defaults"""
        ip_address = request.headers.get('X-Forwarded-For', request.remote_addr)
        if ip_address:
            ip_address = ip_address.split(',')[0].strip()
        
        location = self.location_detector.get_location_from_ip(ip_address)
        
        # Ensure we always return a valid location dictionary with defaults
        if not location or not isinstance(location, dict):
            location = {
                'city': None,
                'state': None,
                'country': 'IN',
                'latitude': None,
                'longitude': None
            }
        
        # Ensure country is never None
        if not location.get('country'):
            location['country'] = 'IN'
            
        return location

    def is_legal_article(self, article):
        """Determine if an article is legal news"""
        text = f"{article.get('title', '')} {article.get('description', '')}".lower()
        
        matches = {
            category: sum(1 for term in terms if term.lower() in text)
            for category, terms in self.legal_keywords.items()
        }
        
        has_institution = matches['institutions'] > 0
        has_action_or_term = matches['actions'] > 0 or matches['legal_terms'] > 0
        total_matches = sum(matches.values())
        
        return has_institution and has_action_or_term and total_matches >= 3

    def generate_search_query(self, location):
        """Generate search query based on location with null checking"""
        query_parts = []
        
        if location.get('city'):
            query_parts.append(f'"{location["city"]}"')
        if location.get('state'):
            query_parts.append(location['state'])
            
        legal_query = ' OR '.join(f'"{term}"' for term in self.search_terms)
        query_parts.append(f'({legal_query})')
        
        return ' AND '.join(query_parts) if len(query_parts) > 1 else legal_query

    def fetch_news(self, request, page=1, page_size=10):
        """Fetch legal news based on user's location"""
        try:
            location = self.get_user_location(request)
            search_query = self.generate_search_query(location)
            
            buffer_size = min(page_size * 3, 100)
            
            # Ensure country code is always a valid string
            country_code = (location.get('country') or 'IN').lower()
            
            params = {
                'q': search_query,
                'lang': 'en',
                'country': country_code,
                'max': buffer_size,
                'apikey': self.api_key
            }
            
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            legal_articles = [
                article for article in data.get('articles', [])
                if self.is_legal_article(article)
            ]
            
            start_idx = (page - 1) * page_size
            end_idx = start_idx + page_size
            paged_articles = legal_articles[start_idx:end_idx]
            
            def get_matched_terms(article_text):
                article_text = article_text.lower()
                matches = []
                for category, terms in self.legal_keywords.items():
                    matches.extend([term for term in terms if term.lower() in article_text])
                return list(set(matches))
            
            return {
                'success': True,
                'data': {
                    'articles': [
                        {
                            'id': idx + start_idx + 1,
                            'title': article.get('title'),
                            'description': article.get('description'),
                            'source': {
                                'name': article.get('source', {}).get('name'),
                                'url': article.get('source', {}).get('url')
                            },
                            'url': article.get('url'),
                            'publishedAt': article.get('publishedAt'),
                            'location': location,
                            'legal_terms_found': get_matched_terms(
                                f"{article.get('title', '')} {article.get('description', '')}"
                            )
                        }
                        for idx, article in enumerate(paged_articles)
                    ],
                    'meta': {
                        'pagination': {
                            'current_page': page,
                            'page_size': page_size,
                            'total_pages': (len(legal_articles) + page_size - 1) // page_size,
                            'total_items': len(legal_articles),
                            'has_next': end_idx < len(legal_articles),
                            'has_previous': page > 1
                        },
                        'location': location,
                        'detected_from': 'ip_address'
                    }
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': {
                    'message': str(e),
                    'type': 'API_ERROR'
                }
            }

# Initialize news fetcher with your API key
news_fetcher = LegalNewsFetcher(api_key="a762e3f81e40888597aa88c3255c4236")

@app.route('/api/news', methods=['GET'])
def get_news():
    """API endpoint to fetch legal news based on user's location"""
    try:
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('pageSize', 10))
        
        # Validate pagination parameters
        if page < 1:
            page = 1
        if page_size < 1 or page_size > 50:
            page_size = 10
            
        result = news_fetcher.fetch_news(
            request=request,
            page=page,
            page_size=page_size
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'message': str(e),
                'type': 'SERVER_ERROR'
            }
        }), 500

if __name__ == '__main__':
    app.run(debug=True,port=5002)
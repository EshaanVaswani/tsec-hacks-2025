import streamlit as st
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse.linalg import svds
import folium
from streamlit_folium import folium_static

# Initialize the model
@st.cache_resource
def load_model():
    return SentenceTransformer('all-MiniLM-L6-v2')

# Generate embeddings with fixed caching issue
@st.cache_data
def generate_embeddings(texts, _model):
    return _model.encode(texts)

# Create sample Indian lawyer data
def create_sample_data():
    # In a real application, you would read this from a CSV file
    lawyers_data = {
        'name': [
            'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Deepa Verma', 
            'Suresh Iyer', 'Anita Desai', 'Vikram Singh', 'Meera Reddy'
        ],
        'specialization': [
            'Criminal Law', 'Family Law', 'Corporate Law', 'Immigration Law',
            'Real Estate Law', 'Intellectual Property', 'Tax Law', 'Civil Rights'
        ],
        'description': [
            'Experienced criminal defense advocate with practice in Delhi High Court.',
            'Family court specialist handling divorce and custody matters in Mumbai.',
            'Corporate lawyer specializing in startup law and compliance in Bangalore.',
            'Immigration expert handling NRI cases in Chennai.',
            'Real estate lawyer focusing on property disputes in Hyderabad.',
            'Patent attorney with expertise in IT sector cases in Pune.',
            'GST and income tax specialist in Kolkata.',
            'Civil rights advocate working with NGOs in Ahmedabad.'
        ],
        'rating': [4.8, 4.6, 4.9, 4.7, 4.5, 4.8, 4.6, 4.9],
        'reviews': [152, 98, 203, 167, 88, 176, 134, 189],
        'city': [
            'Delhi', 'Mumbai', 'Bangalore', 'Chennai',
            'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad'
        ],
        'latitude': [
            28.6139, 19.0760, 12.9716, 13.0827,
            17.3850, 18.5204, 22.5726, 23.0225
        ],
        'longitude': [
            77.2090, 72.8777, 77.5946, 80.2707,
            78.4867, 73.8567, 88.3639, 72.5714
        ],
        'languages': [
            'Hindi, English', 'Hindi, English, Marathi', 'English, Kannada', 'Tamil, English',
            'Telugu, English', 'Marathi, English', 'Bengali, English', 'Gujarati, Hindi, English'
        ],
        'experience_years': [15, 12, 18, 10, 14, 16, 20, 13]
    }
    return pd.DataFrame(lawyers_data)

# Function to read CSV file
@st.cache_data
def load_csv_data(file):
    try:
        df = pd.read_csv(file)
        required_columns = ['name', 'specialization', 'description', 'rating', 'reviews', 
                          'city', 'latitude', 'longitude', 'languages', 'experience_years']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            st.error(f"Missing required columns: {', '.join(missing_columns)}")
            return None
        return df
    except Exception as e:
        st.error(f"Error reading CSV file: {str(e)}")
        return None

# Create map visualization
def create_map(df):
    # Create a map centered on India
    m = folium.Map(location=[20.5937, 78.9629], zoom_start=5)
    
    # Add markers for each lawyer
    for idx, row in df.iterrows():
        popup_text = f"""
            <b>{row['name']}</b><br>
            {row['specialization']}<br>
            Rating: {row['rating']} ⭐ ({row['reviews']} reviews)<br>
            Languages: {row['languages']}<br>
            Experience: {row['experience_years']} years
        """
        folium.Marker(
            [row['latitude'], row['longitude']],
            popup=folium.Popup(popup_text, max_width=300),
            tooltip=row['name']
        ).add_to(m)
    
    return m

def main():
    st.title("Indian Lawyer Finder App")
    
    # File uploader for CSV
    uploaded_file = st.file_uploader("Upload lawyer data CSV (optional)", type="csv")
    
    try:
        # Load data
        if uploaded_file is not None:
            df = load_csv_data(uploaded_file)
            if df is None:
                st.warning("Using sample data instead...")
                df = create_sample_data()
        else:
            df = create_sample_data()
        
        # Load model
        model = load_model()
        
        # Generate embeddings for descriptions
        description_embeddings = generate_embeddings(df['description'].tolist(), model)
        
        # Sidebar filters
        st.sidebar.header("Filters")
        
        # City filter
        cities = st.sidebar.multiselect(
            "Select Cities",
            options=sorted(df['city'].unique())
        )
        
        # Specialization filter
        specialization = st.sidebar.multiselect(
            "Select Specialization",
            options=sorted(df['specialization'].unique())
        )
        
        # Language filter
        all_languages = set()
        for langs in df['languages']:
            all_languages.update([lang.strip() for lang in langs.split(',')])
        selected_languages = st.sidebar.multiselect(
            "Select Languages",
            options=sorted(all_languages)
        )
        
        # Experience filter
        min_experience = st.sidebar.slider(
            "Minimum Years of Experience",
            0, int(df['experience_years'].max()), 5
        )
        
        # Rating and reviews filters
        min_rating = st.sidebar.slider("Minimum Rating", 1.0, 5.0, 4.0, 0.1)
        min_reviews = st.sidebar.slider("Minimum Number of Reviews", 0, 200, 50)
        
        # Text search
        search_query = st.text_input("Search by description:")
        
        # Filter data
        filtered_df = df.copy()
        
        if cities:
            filtered_df = filtered_df[filtered_df['city'].isin(cities)]
        
        if specialization:
            filtered_df = filtered_df[filtered_df['specialization'].isin(specialization)]
        
        if selected_languages:
            filtered_df = filtered_df[
                filtered_df['languages'].apply(
                    lambda x: any(lang.strip() in x for lang in selected_languages)
                )
            ]
        
        filtered_df = filtered_df[
            (filtered_df['rating'] >= min_rating) &
            (filtered_df['reviews'] >= min_reviews) &
            (filtered_df['experience_years'] >= min_experience)
        ]
        
        # Search using embeddings if query is provided
        if search_query:
            query_embedding = model.encode([search_query])
            similarities = cosine_similarity(query_embedding, description_embeddings)
            similarity_scores = similarities[0]
            
            filtered_df['similarity'] = similarity_scores
            filtered_df = filtered_df[filtered_df['similarity'] > 0.1]
            filtered_df = filtered_df.sort_values('similarity', ascending=False)
            filtered_df = filtered_df.drop('similarity', axis=1)
        
        # Display map
        st.subheader("Lawyer Locations")
        if not filtered_df.empty:
            map_figure = create_map(filtered_df)
            folium_static(map_figure)
        else:
            st.warning("No locations to display based on current filters.")
        
        # Display results
        if not filtered_df.empty:
            st.subheader("Matching Lawyers:")
            for _, lawyer in filtered_df.iterrows():
                with st.expander(f"{lawyer['name']} - {lawyer['specialization']} ({lawyer['city']})"):
                    st.write(f"Description: {lawyer['description']}")
                    st.write(f"Rating: {lawyer['rating']} ⭐ ({lawyer['reviews']} reviews)")
                    st.write(f"Languages: {lawyer['languages']}")
                    st.write(f"Experience: {lawyer['experience_years']} years")
                    st.write(f"Location: {lawyer['city']} ({lawyer['latitude']}, {lawyer['longitude']})")
        else:
            st.warning("No lawyers found matching your criteria.")
            
    except Exception as e:
        pass

if __name__ == "__main__":
    main()
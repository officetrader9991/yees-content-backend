# SEO Tool & API Recommendations for AI Agent

This document outlines recommended tools and APIs to programmatically fetch data for each stage of the SEO content generation process, as defined in `SEO_requirement`. Using these tools can help your AI agent gather the necessary information to create high-ranking articles.

---

### 1. 🧠 Keyword Relevance & Intent

**Goal**: Find and validate relevant keywords, LSI terms, and user intent before writing.

*   **Google Trends**:
    *   **Use Case**: As you suggested, to find trending keywords and compare their popularity, especially for specific regions like Hong Kong.
    *   **API Access**: While there's no official direct API, you can use third-party libraries like `pytrends` for Python or similar packages in other languages to access the data.

*   **SERP & Keyword APIs (e.g., Ahrefs, SEMrush, DataForSEO, SerpAPI, ValueSERP)**:
    *   **Use Case**: These are essential for deep keyword research. You can fetch keyword search volume, difficulty, cost-per-click (CPC), related keywords (for LSI), and see who is currently ranking for those terms.
    *   **API Access**: Most of these services offer robust REST APIs for querying their keyword databases. This is more reliable for scalable operations than scraping.

*   **Perplexity AI**:
    *   **Use Case**: Excellent for understanding search intent and gathering an initial set of related terms and concepts around a core keyword.
    *   **API Access**: They offer a public API that can be integrated into your workflow.

---

### 2. 🧱 Content Structure & Featured Snippet Optimization

**Goal**: Discover common user questions to structure content and capture "People Also Ask" (PAA) boxes and featured snippets.

*   **SERP APIs (DataForSEO, SerpAPI, etc.)**:
    *   **Use Case**: You can make a search query for your target keyword and specifically request the "People Also Ask" results. These questions are a goldmine for `H2`/`H3` headings and building out a FAQ section.
    *   **API Access**: These APIs can return structured JSON data containing the PAA questions and sometimes even the short answers Google provides.

---

### 3. ✍️ Meta Elements (Title & Description)

**Goal**: Analyze top-ranking competitors to craft a compelling title and meta description.

*   **SERP APIs (Again)**:
    *   **Use Case**: Before generating your title and description, you can query your main keyword and fetch the titles and descriptions of the top 10 ranking pages. This provides a model of what Google currently rewards for that query.
    *   **API Access**: The API results will include a list of organic search results with their full titles and meta descriptions.

---

### 4. 📖 Content Quality (E-E-A-T & Fact-Checking)

**Goal**: Find credible sources, data, and facts to back up claims made in the article.

*   **General Web Search APIs (Google Custom Search JSON API, Bing Web Search API, Metaphor API)**:
    *   **Use Case**: To find statistics, research papers, news articles, or authoritative sources on a topic. You can programmatically search for things like `"your topic" + "statistics"` or `"study by" + "your topic"`.
    *   **API Access**: These APIs allow you to perform web searches and get back structured results.

---

### 5. 🔁 Internal & External Links

**Goal**: Find relevant pages to link to, both on your own site and externally.

*   **Internal Linking (Custom Solution)**:
    *   **Use Case**: To find the most relevant articles on your own blog to link from your new article.
    *   **API Access**: This typically requires a custom approach. You could create an API endpoint that searches your own site's database/CMS or use a search-as-a-service provider's API (like **Algolia** or **Elasticsearch**) if you use one for your site search.

*   **External Linking (Web Search APIs)**:
    *   **Use Case**: To find high-authority external sites to link to (e.g., well-known companies, Wikipedia pages, documentation, GitHub repos).
    *   **API Access**: Use the same web search APIs mentioned in point 4. You can craft queries like `"topic" + "github"` or `"topic" + "documentation"`.

---

### 8. 📷 Media (Images & Diagrams)

**Goal**: Find relevant, royalty-free media to include in the article.

*   **Stock Photo APIs (Unsplash, Pexels, Pixabay)**:
    *   **Use Case**: To programmatically search for and download high-quality, royalty-free images related to your article's topic.
    *   **API Access**: All these services provide free and easy-to-use REST APIs for searching their image libraries. 
#!/usr/bin/env python3
"""
Extract themes and learning outcomes from a PDF document.

This script processes a PDF containing learning outcomes and clusters
them into thematic groups using text extraction and basic NLP.

Usage:
    python extract_pdf_themes.py <pdf_path> [--output themes.json]

Requirements:
    pip install PyPDF2 nltk scikit-learn
"""

import argparse
import json
import re
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Tuple

try:
    import PyPDF2
    import nltk
    from nltk.tokenize import sent_tokenize
    from nltk.corpus import stopwords
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.cluster import KMeans
except ImportError as e:
    print(f"Error: Missing required package: {e}")
    print("Install with: pip install PyPDF2 nltk scikit-learn")
    exit(1)


class ThemeExtractor:
    """Extract and cluster learning outcomes from PDF into themes."""

    def __init__(self, pdf_path: str):
        self.pdf_path = Path(pdf_path)
        self.outcomes = []
        self.themes = []

        # Download required NLTK data
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt', quiet=True)

        try:
            nltk.data.find('corpora/stopwords')
        except LookupError:
            nltk.download('stopwords', quiet=True)

    def extract_text_from_pdf(self) -> str:
        """Extract all text from PDF file."""
        print(f"Extracting text from: {self.pdf_path}")

        try:
            with open(self.pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"

            print(f"Extracted {len(text)} characters from {len(reader.pages)} pages")
            return text

        except Exception as e:
            print(f"Error extracting PDF: {e}")
            raise

    def identify_learning_outcomes(self, text: str) -> List[str]:
        """
        Identify learning outcome statements from extracted text.

        Looks for common patterns like:
        - "Students will be able to..."
        - "Upon completion, learners will..."
        - Bulleted or numbered lists following headings
        """
        print("Identifying learning outcomes...")

        # Split into sentences
        sentences = sent_tokenize(text)

        # Patterns that indicate learning outcomes
        patterns = [
            r'(?:students?|learners?|participants?).*?(?:will|should|can).*?(?:able to|understand|demonstrate|apply|analyze|create|evaluate)',
            r'(?:upon completion|by the end|after this).*?(?:will|should|can)',
            r'(?:objective|outcome|goal|competency).*?:',
        ]

        outcomes = []
        for sentence in sentences:
            sentence = sentence.strip()

            # Skip very short sentences
            if len(sentence) < 20:
                continue

            # Check if sentence matches outcome patterns
            found_match = False
            for pattern in patterns:
                if re.search(pattern, sentence, re.IGNORECASE):
                    outcomes.append(sentence)
                    found_match = True
                    break
            # Also include sentences that start with action verbs (common in outcome lists)
            if not found_match and self._starts_with_action_verb(sentence):
                outcomes.append(sentence)

        # Remove duplicates while preserving order
        outcomes = list(dict.fromkeys(outcomes))

        print(f"Identified {len(outcomes)} learning outcomes")
        return outcomes

    def _starts_with_action_verb(self, sentence: str) -> bool:
        """Check if sentence starts with common learning outcome action verb."""
        action_verbs = [
            'analyze', 'apply', 'assess', 'build', 'calculate', 'categorize',
            'classify', 'compare', 'compose', 'construct', 'contrast', 'create',
            'critique', 'define', 'demonstrate', 'describe', 'design', 'determine',
            'develop', 'differentiate', 'discuss', 'distinguish', 'evaluate',
            'examine', 'explain', 'formulate', 'identify', 'illustrate',
            'implement', 'integrate', 'interpret', 'justify', 'list', 'organize',
            'perform', 'plan', 'predict', 'prepare', 'produce', 'prove',
            'recognize', 'recommend', 'relate', 'review', 'select', 'solve',
            'summarize', 'synthesize', 'use', 'utilize', 'validate', 'verify'
        ]

        first_word = sentence.split()[0].lower().strip('.,;:!?')
        return first_word in action_verbs

    def cluster_outcomes_into_themes(self, outcomes: List[str], n_themes: int = None) -> List[Dict]:
        """
        Cluster learning outcomes into themes using TF-IDF and K-Means.

        Args:
            outcomes: List of learning outcome statements
            n_themes: Number of themes to create (auto-determined if None)
        """
        print("Clustering outcomes into themes...")

        if len(outcomes) < 3:
            print("Warning: Too few outcomes for clustering. Creating single theme.")
            return [{
                'theme_name': 'Core Learning Outcomes',
                'description': 'All learning outcomes for this course',
                'learning_outcomes': outcomes,
                'bloom_levels': [],
                'estimated_hours': 0
            }]

        # Determine optimal number of clusters if not specified
        if n_themes is None:
            n_themes = min(max(3, len(outcomes) // 6), 8)  # 3-8 themes

        print(f"Creating {n_themes} themes...")

        # Create TF-IDF vectors
        vectorizer = TfidfVectorizer(
            max_features=100,
            stop_words='english',
            ngram_range=(1, 2)
        )
        vectors = vectorizer.fit_transform(outcomes)

        # Cluster using K-Means
        kmeans = KMeans(n_clusters=n_themes, random_state=42, n_init=10)
        labels = kmeans.fit_predict(vectors)

        # Get feature names for theme naming
        feature_names = vectorizer.get_feature_names_out()

        # Organize outcomes by cluster
        themes = []
        for i in range(n_themes):
            cluster_outcomes = [outcomes[j] for j in range(len(outcomes)) if labels[j] == i]

            if not cluster_outcomes:
                continue

            # Get top terms for this cluster to name the theme
            cluster_center = kmeans.cluster_centers_[i]
            top_indices = cluster_center.argsort()[-5:][::-1]
            top_terms = [feature_names[idx] for idx in top_indices]

            theme_name = self._generate_theme_name(top_terms, cluster_outcomes)

            themes.append({
                'theme_name': theme_name,
                'description': self._generate_theme_description(cluster_outcomes),
                'learning_outcomes': cluster_outcomes,
                'bloom_levels': self._infer_bloom_levels(cluster_outcomes),
                'estimated_hours': len(cluster_outcomes) * 0.75  # Rough estimate
            })

        print(f"Created {len(themes)} themes")
        return themes

    def _generate_theme_name(self, top_terms: List[str], outcomes: List[str]) -> str:
        """Generate a descriptive theme name from top terms."""
        # Capitalize and format top terms
        formatted_terms = [term.title() for term in top_terms[:2]]
        return ' and '.join(formatted_terms)

    def _generate_theme_description(self, outcomes: List[str]) -> str:
        """Generate a brief description of what the theme covers."""
        # Extract common concepts from outcomes
        if len(outcomes) == 1:
            return f"Covers: {outcomes[0][:80]}..."
        else:
            return f"Covers {len(outcomes)} learning outcomes related to this theme"

    def _infer_bloom_levels(self, outcomes: List[str]) -> List[str]:
        """Infer Bloom's taxonomy levels from outcome action verbs."""
        bloom_mapping = {
            'remember': ['define', 'list', 'recall', 'recognize', 'identify', 'name'],
            'understand': ['explain', 'describe', 'summarize', 'interpret', 'classify', 'discuss'],
            'apply': ['apply', 'demonstrate', 'use', 'implement', 'execute', 'solve', 'perform'],
            'analyze': ['analyze', 'compare', 'contrast', 'examine', 'differentiate', 'distinguish'],
            'evaluate': ['evaluate', 'assess', 'critique', 'justify', 'judge', 'recommend'],
            'create': ['create', 'design', 'develop', 'construct', 'produce', 'formulate', 'compose']
        }

        levels_found = set()
        outcomes_text = ' '.join(outcomes).lower()

        for level, verbs in bloom_mapping.items():
            for verb in verbs:
                if verb in outcomes_text:
                    levels_found.add(level)

        return sorted(list(levels_found))

    def extract_themes(self, n_themes: int = None) -> Dict:
        """
        Main extraction process.

        Returns structured themes data ready for JSON export.
        """
        # Extract text
        text = self.extract_text_from_pdf()

        # Identify outcomes
        self.outcomes = self.identify_learning_outcomes(text)

        if not self.outcomes:
            raise ValueError("No learning outcomes found in PDF. Please check the document format.")

        # Cluster into themes
        self.themes = self.cluster_outcomes_into_themes(self.outcomes, n_themes)

        # Build output structure
        result = {
            'themes': self.themes,
            'metadata': {
                'source_pdf': str(self.pdf_path.absolute()),
                'extraction_date': datetime.now().isoformat(),
                'total_outcomes': len(self.outcomes),
                'total_themes': len(self.themes)
            }
        }

        return result


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description='Extract themes and learning outcomes from PDF'
    )
    parser.add_argument(
        'pdf_path',
        help='Path to PDF file containing learning outcomes'
    )
    parser.add_argument(
        '--output', '-o',
        default='themes.json',
        help='Output JSON file path (default: themes.json)'
    )
    parser.add_argument(
        '--themes', '-t',
        type=int,
        default=None,
        help='Number of themes to create (auto-determined if not specified)'
    )

    args = parser.parse_args()

    # Validate input
    pdf_path = Path(args.pdf_path)
    if not pdf_path.exists():
        print(f"Error: PDF file not found: {pdf_path}")
        exit(1)

    if not pdf_path.suffix.lower() == '.pdf':
        print(f"Warning: File does not have .pdf extension: {pdf_path}")

    # Extract themes
    try:
        extractor = ThemeExtractor(args.pdf_path)
        result = extractor.extract_themes(n_themes=args.themes)

        # Save to JSON
        output_path = Path(args.output)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

        print(f"\n✓ Success! Themes saved to: {output_path}")
        print(f"\nExtracted {result['metadata']['total_themes']} themes "
              f"from {result['metadata']['total_outcomes']} learning outcomes")

        # Print theme summary
        print("\nThemes found:")
        for i, theme in enumerate(result['themes'], 1):
            print(f"  {i}. {theme['theme_name']} ({len(theme['learning_outcomes'])} outcomes)")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        exit(1)


if __name__ == '__main__':
    main()

import os
from azure.core.credentials import AzureKeyCredential
from azure.ai.textanalytics import TextAnalyticsClient

class AzureLanguageService:
    def __init__(self):
        # Read environment variables inside initialization
        self.endpoint = os.getenv("AZURE_LANGUAGE_ENDPOINT")
        self.key = os.getenv("AZURE_LANGUAGE_KEY")
        self.client = None
        
        if self.endpoint and self.key:
            credential = AzureKeyCredential(self.key)
            self.client = TextAnalyticsClient(endpoint=self.endpoint, credential=credential)

    def is_configured(self) -> bool:
        return self.client is not None

    def analyze_text_sentiment(self, text: str, language: str = "en") -> dict:
        """Calls Azure SDK to determine positive, neutral, or negative sentiment."""
        if not self.is_configured():
            raise ValueError("Azure Language credentials are missing or invalid.")
            
        response = self.client.analyze_sentiment(documents=[text], language=language)
        # Convert ItemPaged to list
        documents = list(response)
        result = documents[0]
        
        if result.is_error:
            raise Exception(result.error.message)
            
        return {
            "sentiment": result.sentiment,
            "confidence_scores": {
                "positive": result.confidence_scores.positive,
                "neutral": result.confidence_scores.neutral,
                "negative": result.confidence_scores.negative
            }
        }

    def extract_text_key_phrases(self, text: str, language: str = "en") -> list:
        """Calls Azure SDK to extract key phrases and main talking points."""
        if not self.is_configured():
            raise ValueError("Azure Language credentials are missing or invalid.")
            
        response = self.client.extract_key_phrases(documents=[text], language=language)
        documents = list(response)
        result = documents[0]
        
        if result.is_error:
            raise Exception(result.error.message)
            
        return result.key_phrases

    def recognize_entities(self, text: str, language: str = "en") -> list:
        """Calls Azure SDK to recognize named entities (people, places, organizations, etc.)."""
        if not self.is_configured():
            raise ValueError("Azure Language credentials are missing or invalid.")
            
        response = self.client.recognize_entities(documents=[text], language=language)
        documents = list(response)
        result = documents[0]
        
        if result.is_error:
            raise Exception(result.error.message)
            
        return [
            {
                "text": entity.text,
                "category": entity.category,
                "subcategory": entity.subcategory,
                "confidence_score": entity.confidence_score,
                "offset": entity.offset,
                "length": entity.length
            }
            for entity in result.entities
        ]

    def recognize_pii_entities(self, text: str, language: str = "en") -> list:
        """Calls Azure SDK to recognize PII entities (emails, phone numbers, SSNs, etc.)."""
        if not self.is_configured():
            raise ValueError("Azure Language credentials are missing or invalid.")
            
        response = self.client.recognize_pii_entities(documents=[text], language=language)
        documents = list(response)
        result = documents[0]
        
        if result.is_error:
            raise Exception(result.error.message)
            
        return [
            {
                "text": entity.text,
                "category": entity.category,
                "subcategory": entity.subcategory,
                "confidence_score": entity.confidence_score,
                "offset": entity.offset,
                "length": entity.length
            }
            for entity in result.entities
        ]

    def extract_summary(self, text: str, language: str = "en", sentence_count: int = 3) -> list:
        """Calls Azure SDK to extract a summary of the text."""
        if not self.is_configured():
            raise ValueError("Azure Language credentials are missing or invalid.")
            
        poller = self.client.begin_extract_summary(documents=[text], language=language, max_sentence_count=sentence_count)
        response = poller.result()
        documents = list(response)
        result = documents[0]
        
        if result.is_error:
            raise Exception(result.error.message)
            
        return [
            {
                "text": sentence.text,
                "rank_score": sentence.rank_score,
                "offset": sentence.offset,
                "length": sentence.length
            }
            for sentence in result.sentences
        ]

# Instantiate a single reusable instance of the service
azure_language_service = AzureLanguageService()
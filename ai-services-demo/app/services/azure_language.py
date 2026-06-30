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
        result = response[0]
        
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
        result = response[0]
        
        if result.is_error:
            raise Exception(result.error.message)
            
        return result.key_phrases

# Instantiate a single reusable instance of the service
azure_language_service = AzureLanguageService()
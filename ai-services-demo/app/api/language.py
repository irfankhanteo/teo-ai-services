from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
# Import the instantiated service instance
from app.services.azure_language import azure_language_service

router = APIRouter(
    prefix="/language",
    tags=["Azure AI Language"]
)

class TextRequest(BaseModel):
    text: str
    language: str = "en"
    sentence_count: int = 3

@router.post("/sentiment", status_code=status.HTTP_200_OK)
async def analyze_sentiment(request: TextRequest):
    if not request.text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Text content cannot be empty.")
    
    try:
        data = azure_language_service.analyze_text_sentiment(request.text, request.language)
        return data
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/keyphrases", status_code=status.HTTP_200_OK)
async def extract_key_phrases(request: TextRequest):
    if not request.text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Text content cannot be empty.")
        
    try:
        phrases = azure_language_service.extract_text_key_phrases(request.text, request.language)
        return {"key_phrases": phrases}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/entities", status_code=status.HTTP_200_OK)
async def recognize_entities(request: TextRequest):
    if not request.text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Text content cannot be empty.")
        
    try:
        entities = azure_language_service.recognize_entities(request.text, request.language)
        return {"entities": entities}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/pii", status_code=status.HTTP_200_OK)
async def recognize_pii(request: TextRequest):
    if not request.text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Text content cannot be empty.")
        
    try:
        pii_entities = azure_language_service.recognize_pii_entities(request.text, request.language)
        return {"pii_entities": pii_entities}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/summary", status_code=status.HTTP_200_OK)
async def extract_summary(request: TextRequest):
    if not request.text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Text content cannot be empty.")
        
    try:
        summary = azure_language_service.extract_summary(request.text, request.language, request.sentence_count)
        return {"summary": summary}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
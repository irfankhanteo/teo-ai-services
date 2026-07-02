from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.services.azure_ml_service import azure_ml_service

router = APIRouter(
    prefix="/ml",
    tags=["Azure Machine Learning"],
)


class MLScoreRequest(BaseModel):
    """Request body for the Azure ML scoring endpoint.

    The `data` field should match the schema expected by your deployed model.
    """
    data: dict


class MLScoreResponse(BaseModel):
    """Wrapper for the Azure ML scoring response."""
    result: dict | list | str | None = None


@router.post("/score", status_code=status.HTTP_200_OK, response_model=MLScoreResponse)
async def score(request: MLScoreRequest):
    """Send data to the Azure ML model endpoint and return its prediction."""
    try:
        result = await azure_ml_service.score(request.data)
        return MLScoreResponse(result=result)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(ve),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Azure ML scoring failed: {str(e)}",
        )

from fastapi import APIRouter, Depends, UploadFile, File
from pydantic import BaseModel

from app.core.security import verify_api_key
from app.services.vision_service import analyze_image, analyze_image_bytes

router = APIRouter(prefix="/vision", tags=["Vision"])


class ImageURLRequest(BaseModel):
    url: str


@router.post("/analyze/url")
async def analyze_from_url(
    request: ImageURLRequest, _: str = Depends(verify_api_key)
):
    result = await analyze_image(request.url)
    return result


@router.post("/analyze/upload")
async def analyze_from_upload(
    file: UploadFile = File(...), _: str = Depends(verify_api_key)
):
    image_data = await file.read()
    result = await analyze_image_bytes(image_data)
    return result

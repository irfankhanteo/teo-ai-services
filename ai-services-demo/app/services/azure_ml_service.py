import os
import httpx
from app.core.logging import logger


class AzureMLService:
    """Service for calling an Azure Machine Learning deployed model endpoint."""

    def __init__(self):
        self.endpoint = os.getenv("AZURE_ML_ENDPOINT", "")
        self.api_key = os.getenv("AZURE_ML_API_KEY", "")

    def is_configured(self) -> bool:
        return bool(self.endpoint and self.api_key)

    async def score(self, data: dict) -> dict:
        """
        Send input data to the Azure ML scoring endpoint and return the prediction.

        Args:
            data: The input payload expected by the deployed model.

        Returns:
            The JSON response from the Azure ML endpoint.

        Raises:
            ValueError: If the service is not configured.
            httpx.HTTPStatusError: If the endpoint returns a non-2xx status.
        """
        if not self.is_configured():
            raise ValueError(
                "Azure ML credentials are missing. "
                "Set AZURE_ML_ENDPOINT and AZURE_ML_API_KEY in your .env file."
            )

        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }

        # Transform simple data dict into Azure ML expected format if needed
        if "Inputs" not in data:
            # Ensure the required "Price" field is present as per the Swagger schema
            if "Price" not in data:
                data["Price"] = 0
                
            azure_payload = {
                "Inputs": {
                    "WebServiceInput0": [data]
                },
                "GlobalParameters": {}
            }
        else:
            azure_payload = data

        async with httpx.AsyncClient(timeout=30.0) as client:
            logger.info(f"Calling Azure ML endpoint: {self.endpoint}")
            response = await client.post(
                self.endpoint,
                json=azure_payload,
                headers=headers,
            )
            try:
                response.raise_for_status()
            except httpx.HTTPStatusError as e:
                error_msg = f"Client error '{e.response.status_code}' for url '{e.request.url}'"
                try:
                    error_detail = e.response.text
                    if error_detail:
                        error_msg += f"\nResponse body: {error_detail}"
                except Exception:
                    pass
                raise Exception(error_msg) from e
                
            return response.json()


# Instantiate a single reusable instance of the service
azure_ml_service = AzureMLService()

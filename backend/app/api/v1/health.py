from fastapi import APIRouter

router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


@router.get("")
def health_check() -> dict[str, object]:
    return {
        "success": True,
        "message": "ORB API is running",
    }
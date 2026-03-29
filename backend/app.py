from pathlib import Path
import mimetypes
import shutil
import cv2

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

app = FastAPI(title="Potato Blight API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
UPLOADS_DIR = BASE_DIR / "uploads"
OUTPUTS_DIR = BASE_DIR / "outputs"
MODEL_PATH = MODELS_DIR / "best4.pt"  # Using best4.pt as provided

_yolo_model = None

def get_yolo_model():
    global _yolo_model
    if _yolo_model is None and MODEL_PATH.exists():
        from ultralytics import YOLO
        _yolo_model = YOLO(str(MODEL_PATH))
    return _yolo_model


def run_model_inference(file_path: Path, output_dir: Path) -> dict:
    if not MODEL_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail=f"Model file not found at {MODEL_PATH}. Add your trained model first.",
        )

    model = get_yolo_model()
    if not model:
        raise HTTPException(
            status_code=500,
            detail="Failed to load the YOLO model. Check if ultralytics is installed."
        )

    # Run inference (conf=0.25 is default, adjust if needed)
    results = model.predict(source=str(file_path), conf=0.25)
    result = results[0]

    output_dir.mkdir(parents=True, exist_ok=True)
    output_name = f"{file_path.stem}_output{file_path.suffix}"
    output_path = output_dir / output_name

    # Save annotated image
    try:
        # result.plot() returns a numpy array (BGR image)
        annotated_img = result.plot()
        cv2.imwrite(str(output_path), annotated_img)
    except Exception as e:
        print(f"Error saving image: {e}")
        output_path = None

    # Calculate stats based on model classes
    plant_count = len(result.boxes)
    sick_early = 0
    sick_late = 0
    healthy = 0
    tracking_confidence = 0

    names = result.names
    
    for box in result.boxes:
        cls_id = int(box.cls[0].item())
        conf = float(box.conf[0].item())
        cls_name = names[cls_id].lower()
        
        if "early" in cls_name:
            sick_early += 1
        elif "late" in cls_name:
            sick_late += 1
        elif "health" in cls_name or "normal" in cls_name:
            healthy += 1
            
        tracking_confidence = max(tracking_confidence, int(conf * 100))

    sick_total = sick_early + sick_late

    # Calculate health_score dynamically
    if plant_count == 0:
        health_score = 100
    else:
        # If we have explicitly healthy and sick classes:
        if (healthy + sick_total) > 0:
            health_score = int((healthy / (healthy + sick_total)) * 100)
        else:
            # Fallback if classes are named weirdly but we found detections
            health_score = 80 # Neutral baseline if unknown classes

    risk = "Faible" if health_score >= 85 else "Moyen" if health_score >= 70 else "Eleve"

    return {
        "risk": risk,
        "healthScore": health_score,
        "count": plant_count,
        "tracking": tracking_confidence,
        "sickTotal": sick_total,
        "sickEarly": sick_early,
        "sickLate": sick_late,
        "outputFile": output_path.name if output_path else None,
        "outputUrl": f"/api/output/{output_path.name}" if output_path else None,
        "feedback": (
            f"Resultats YOLO : risque {risk.lower()}, {plant_count} plants detectes "
            f"({healthy} sains, {sick_early} early blight, {sick_late} late blight)."
        ),
    }


@app.get("/api/health")
def health() -> dict:
    return {
        "status": "ok",
        "model_path": str(MODEL_PATH),
        "model_exists": MODEL_PATH.exists(),
    }


@app.get("/api/output/{filename}")
def download_output(filename: str):
    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
    requested = (OUTPUTS_DIR / filename).resolve()
    outputs_root = OUTPUTS_DIR.resolve()

    if outputs_root not in requested.parents:
        raise HTTPException(status_code=400, detail="Invalid filename")
    if not requested.exists():
        raise HTTPException(status_code=404, detail="Output file not found")

    media_type, _ = mimetypes.guess_type(str(requested))
    return FileResponse(
        path=str(requested),
        media_type=media_type or "application/octet-stream",
        filename=requested.name,
    )


@app.post("/api/predict")
async def predict(file: UploadFile = File(...)) -> dict:
    if not (file.content_type or "").startswith(("image/", "video/")):
        raise HTTPException(status_code=400, detail="Only image/video files are accepted")

    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    save_path = UPLOADS_DIR / file.filename

    with save_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return run_model_inference(save_path, OUTPUTS_DIR)

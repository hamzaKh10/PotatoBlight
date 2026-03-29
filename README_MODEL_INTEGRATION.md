# POTATOSITE - Integration du modele DL

## Ou placer le modele
Place ton fichier de modele ici:

`backend/models/best.pt`

Tu peux changer ce chemin dans `backend/app.py` via la variable `MODEL_PATH`.

## Fichier a modifier pour brancher ton vrai pipeline
- `backend/app.py`
- Fonction: `run_model_inference(file_path)`

C'est ici que tu dois charger ton modele (YOLO, DeepSORT, autre) et retourner:
- `risk`
- `healthScore`
- `count`
- `tracking`
- `feedback`

## Lancer le backend
Depuis `POTATOSITE`:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

## Lancer le frontend
Ouvre `index.html` (ou via un serveur statique) puis clique sur "Generer le resultat".
Le frontend envoie le fichier vers:

`POST http://127.0.0.1:8000/api/predict`

## Test rapide API
- Sante API: `GET http://127.0.0.1:8000/api/health`
- Prediction: `POST /api/predict` avec un champ `file`

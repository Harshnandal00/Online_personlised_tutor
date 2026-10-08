from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from supabase import create_client, Client
import os

load_dotenv()

# ── Supabase ──────────────────────────────────────────────────────────────────
SUPABASE_URL: str = os.environ["SUPABASE_URL"]
SUPABASE_KEY: str = os.environ["SUPABASE_SERVICE_KEY"]
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── Gemini ────────────────────────────────────────────────────────────────────
ai_client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    user_id: str
    message: str

@app.get("/")
def read_root():
    return {"status": "online"}

@app.post("/api/chat")
@app.post("/")
async def chat_with_tutor(req: ChatRequest):
    try:
        profile = {}
        # Safely try fetching from Supabase without crashing if table isn't created yet
        try:
            profile_res = supabase.table("student_profiles").select("*").eq("user_id", req.user_id).execute()
            rows = profile_res.data or []
            if len(rows) > 0:
                profile = rows[0]  # type: ignore
        except Exception as db_err:
            print(f"Supabase profile note: {db_err}")

        weak_areas = profile.get("weak_topics", ["None recorded yet"])
        style = profile.get("learning_style", "clear, encouraging, and step-by-step")

        system_prompt = (
            f"You are a friendly, expert personalized tutor.\n"
            f"The student's known weak topics: {weak_areas}\n"
            f"Preferred learning style: {style}\n"
            f"Always explain clearly with practical examples."
        )

        def stream_generator():
            response_stream = ai_client.models.generate_content_stream(
                model="gemini-flash-lite-latest",
                contents=[system_prompt, req.message]
            )
            for chunk in response_stream:
                if chunk.text:
                    yield chunk.text

        return StreamingResponse(stream_generator(), media_type="text/plain")

    except Exception as e:
        print(f"Server error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

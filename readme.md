# 小兔书 ituhouse

前后端分别位于 `backend/`（FastAPI）与 `frontend/`（Next.js）。

## Backend（FastAPI）

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
cp email_senders.json.example email_senders.json
uvicorn app.main:app --reload
```

详细环境变量说明见 `backend/README.md`。

## Frontend（Next.js）

```bash
cd frontend
pnpm install
pnpm dev
```

---

版权 © 北京大学校园公益营建社 · 兔兔护理队

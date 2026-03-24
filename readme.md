# 小兔书 ituhouse

前后端分别位于 `backend/`（FastAPI）与 `frontend/`（Next.js）。

## Backend（FastAPI）

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
cp email_senders.json.example email_senders.json
export API_HOST=0.0.0.0
export API_PORT=8000
python main.py
```

也可以直接在 `backend/.env` 中设置：

```env
API_HOST=0.0.0.0
API_PORT=8000
```

## Frontend（Next.js）

```bash
cd frontend
pnpm install
cp .env.local.example .env.local
pnpm dev
```

前端端口和后端地址可以在 `frontend/.env.local` 中配置：

```env
PORT=5678
NEXT_PUBLIC_URL=http://localhost:8000
```

---

版权 © 北京大学校园公益营建社 · 兔兔护理队

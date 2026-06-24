# Минимал Хэрэглээ Шоп

Монгол хэрэглэгчдэд зориулсан, бүрэн ажиллагаатай онлайн худалдааны платформ.

## Folder Structure

```
minimal-shop/
├── frontend/                  # React + Tailwind CSS
│   ├── src/
│   │   ├── assets/products/   # Барааны бодит зургууд
│   │   ├── components/        # Header, Footer, ProductCard, AdminLayout г.м.
│   │   ├── context/           # CartContext, AuthContext
│   │   ├── data/               products.js (демо/fallback өгөгдөл)
│   │   ├── pages/              HomePage, ProductsPage, CartPage, Checkout, Admin/...
│   │   └── utils/              api.js (axios client), format.js
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── vercel.json
│
├── backend/                    # Node.js + Express + PostgreSQL
│   ├── db/
│   │   ├── migrate.js          # Schema үүсгэх script
│   │   └── seed.js             # Жишээ өгөгдөл (3 бодит бараа + admin)
│   ├── src/
│   │   ├── config/db.js        # PostgreSQL connection pool
│   │   ├── controllers/        # auth, product, order, upload
│   │   ├── middleware/         # auth (JWT), upload (multer), errorHandler
│   │   ├── routes/             # /api/auth, /api/products, /api/orders, /api/upload
│   │   ├── utils/              # validation, asyncHandler
│   │   └── server.js           # Express app entry point
│   ├── uploads/                 # Зургийн local storage
│   ├── package.json
│   ├── render.yaml
│   └── .env.example
│
└── README.md (энэ файл)
```

## 1. Local дээр ажиллуулах

### Шаардлага
- Node.js 18+
- PostgreSQL 14+ (local дээр суулгасан эсвэл cloud instance)

### Backend суулгах

```bash
cd backend
npm install
cp .env.example .env
# .env файлыг өөрийн PostgreSQL мэдээллээр бөглөнө

# Database schema үүсгэх
npm run migrate

# Жишээ өгөгдөл нэмэх (3 бодит бараа + admin хэрэглэгч)
npm run seed

# Серверийг ажиллуулах
npm run dev
```

Backend `http://localhost:4000` дээр ажиллана.

Admin нэвтрэх мэдээлэл (`.env`-д `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`-аар өөрчилж болно):
```
Имэйл: admin@minimalshop.mn
Нууц үг: Admin12345!
```

### Frontend суулгах

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:4000/api гэж байгаа эсэхийг шалгана

npm run dev
```

Frontend `http://localhost:5173` дээр ажиллана.

## 2. Database Schema

```sql
users (id, name, phone, email, password, role, created_at)
products (id, name, description, price, image, category, stock, created_date)
orders (id, user_id, customer_name, customer_phone, customer_address,
        customer_district, delivery_method, payment_method, total, status, created_at)
order_items (id, order_id, product_id, product_name, quantity, price)
```

Бүрэн schema-г `backend/db/migrate.js`-ээс харна уу.

## 3. API Endpoints

| Method | Endpoint | Тайлбар | Хамгаалалт |
|---|---|---|---|
| POST | `/api/auth/register` | Бүртгүүлэх | Нийтэд нээлттэй |
| POST | `/api/auth/login` | Нэвтрэх | Нийтэд нээлттэй |
| GET | `/api/products` | Барааны жагсаалт (`?category=&search=&sort=`) | Нийтэд нээлттэй |
| GET | `/api/products/:id` | Барааны дэлгэрэнгүй | Нийтэд нээлттэй |
| POST | `/api/products` | Бараа нэмэх | Admin |
| PUT | `/api/products/:id` | Бараа засах | Admin |
| DELETE | `/api/products/:id` | Бараа устгах | Admin |
| POST | `/api/orders` | Захиалга үүсгэх | Нийтэд нээлттэй (нэвтэрсэн бол холбоно) |
| GET | `/api/orders` | Захиалгын жагсаалт | Нэвтэрсэн хэрэглэгч |
| GET | `/api/orders/:id` | Захиалгын дэлгэрэнгүй | Эзэмшигч/Admin |
| PUT | `/api/orders/:id` | Төлөв шинэчлэх | Admin |
| POST | `/api/upload` | Зураг хуулах | Admin |

## 4. Аюулгүй байдал

- Нууц үг `bcryptjs`-ээр hash хийгдэнэ (salt rounds: 10)
- JWT токен 7 хоногийн хүчинтэй хугацаатай
- `helmet` ашиглан HTTP header-уудыг хамгаална
- `express-rate-limit`-ээр API болон auth эндпойнтод хязгаарлалт тогтоосон (brute-force хамгаалалт)
- Бүх input-д validation хийгдэнэ (`src/utils/validation.js`)
- SQL injection-оос хамгаалахын тулд бүх query-д parameterized statement ашигласан
- Захиалга үүсгэхэд PostgreSQL transaction (`BEGIN`/`COMMIT`/`ROLLBACK`) ашиглан stock-ийн race condition-оос сэргийлсэн

## 5. Deployment

### Frontend → Vercel

1. GitHub repo үүсгэж кодоо push хийнэ.
2. [vercel.com](https://vercel.com) дээр шинэ project үүсгэж, repo-г холбоно.
3. Root Directory: `frontend`
4. Build Command: `npm run build` (автоматаар танигдана)
5. Output Directory: `dist`
6. Environment Variables дээр нэмнэ:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```
7. Deploy товч дарна.

### Backend → Render

1. [render.com](https://render.com) дээр "New Web Service" үүсгэнэ.
2. GitHub repo-г холбож, Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. "New PostgreSQL" үүсгэж database үүсгэнэ (Render автоматаар `DATABASE_URL` өгнө).
6. Environment Variables дээр нэмнэ (`.env.example`-ийг үндэслэнэ):
   ```
   JWT_SECRET=<random урт түлхүүр>
   DATABASE_URL=<Render-ийн өгсөн утга>
   DATABASE_SSL=true
   CORS_ORIGIN=https://your-frontend.vercel.app
   PUBLIC_BASE_URL=https://your-backend.onrender.com
   ```
7. Deploy хийсний дараа Render Shell дотроос:
   ```bash
   npm run migrate
   npm run seed
   ```

Эсвэл `render.yaml`-ийг ашиглан "Blueprint" feature-р автоматаар deploy хийж болно.

### Backend → Railway (alternative)

1. [railway.app](https://railway.app) дээр "New Project" → "Deploy from GitHub repo"
2. Root Directory: `backend`
3. "New" → "Database" → "PostgreSQL" нэмнэ (`DATABASE_URL` автоматаар орчны хувьсагч болж нэмэгдэнэ)
4. Variables Tab дээр `JWT_SECRET`, `CORS_ORIGIN`, `PUBLIC_BASE_URL` нэмнэ
5. Deploy хийсний дараа "Shell" эсвэл локал terminal-аас Railway CLI ашиглан:
   ```bash
   railway run npm run migrate
   railway run npm run seed
   ```

### Database hosting

Render эсвэл Railway-ийн PostgreSQL Add-on хангалттай (Free tier-т 90 хоногийн хязгаар байдаг тул урт хугацаанд паid tier руу шилжихийг зөвлөж байна). Альтернатив: [Neon](https://neon.tech), [Supabase](https://supabase.com).

### Зураг хадгалах (Image Storage)

Анхдагч байдлаар backend нь зургийг local `/uploads` folder-д хадгална. Render/Railway-ийн **ephemeral filesystem** дахин deploy хийх бүрд устдаг тул production-д дараах сонголтын аль нэгийг ашиглахыг зөвлөнө:

- **Render Disk** (Persistent Disk нэмж `/uploads`-ийг mount хийнэ)
- **Cloudinary** эсвэл **AWS S3** (`src/controllers/uploadController.js`-ийг тухайн SDK-р солих)

### Domain холбох

1. Vercel project → Settings → Domains → өөрийн домэйноо нэмнэ (жишээ нь `minimalshop.mn`)
2. DNS provider-т Vercel-ийн өгсөн A/CNAME record-уудыг нэмнэ.
3. Backend-д custom domain ашиглах бол Render/Railway Settings → Custom Domain-аас тохируулна, дараа нь frontend-ийн `VITE_API_URL`-ийг шинэ domain-аар шинэчилнэ.
4. SSL гэрчилгээ Vercel/Render дээр автоматаар үүснэ (Let's Encrypt).

## 6. Production checklist

- [ ] `JWT_SECRET`-ийг урт, санамсаргүй утгаар тохируулсан эсэх
- [ ] `CORS_ORIGIN`-ийг зөв production frontend URL-аар тохируулсан эсэх
- [ ] Admin нууц үгийг seed script-ийн дефолт утгаас өөрчилсэн эсэх
- [ ] Зургийн hosting-ийг persistent storage руу шилжүүлсэн эсэх (Cloudinary/S3/Render Disk)
- [ ] Database backup тохиргоо хийсэн эсэх

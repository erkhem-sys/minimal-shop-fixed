import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Phone, Truck, ShieldCheck, RefreshCw, Mail, Loader2, AlertCircle } from 'lucide-react'
import api from '../utils/api'
import FeaturedProductCard from '../components/FeaturedProductCard'
import heroImage from '../assets/products/mic-poster.png'

const FEATURED_COUNT = 3

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Хамгийн сүүлд нэмэгдсэн бараануудыг онцлох болгоно — admin-аас шинэ
  // бараа нэмэх бүрд энэ хэсэг автоматаар шинэчлэгдэнэ.
  useEffect(() => {
    let active = true

    async function fetchFeatured() {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get('/products')
        if (active) setFeaturedProducts((data.products || []).slice(0, FEATURED_COUNT))
      } catch {
        if (active) setError('Барааны жагсаалт ачааллахад алдаа гарлаа.')
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchFeatured()
    return () => {
      active = false
    }
  }, [])

  return (
    <div>
      {/* Hero — eyebrow, two-line headline with accent word, supporting copy,
          pill CTAs on the left; real product photography on the right */}
      <section className="relative overflow-hidden border-b hairline border-solid">
        <div className="blob w-[420px] h-[420px] -top-40 -right-32 opacity-60" />

        <div className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-20 relative grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
          <div>
            <p className="eyebrow mb-6">
              <span className="eyebrow-dot" />
              ЦАХИМ ДЭЛГҮҮР · УЛААНБААТАР
            </p>

            <h1 className="font-display font-bold text-4xl sm:text-5xl leading-[1.1] uppercase">
              Зөв хэрэгсэл.
              <br />
              Хялбар <span className="text-navy">амьдрал.</span>
            </h1>

            <p className="mt-6 text-base md:text-lg text-clay max-w-md leading-relaxed">
              Өдөр тутмын хэрэгцээт ухаалаг бүтээгдэхүүнүүд. Илүүц зүйлгүй — зөвхөн ашиглах л бараа.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4 text-sm text-clay">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-navy" />
                Улаанбаатар хотод 1–2 хоногт хүргэнэ
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-navy" />
                Баталгаатай, шалгасан бараа
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw size={16} className="text-navy" />
                7 хоногийн дотор буцаалт
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#featured" className="btn-primary">
                Бараа үзэх
                <ArrowRight size={15} />
              </a>
              <a href="tel:80701907" className="btn-secondary">
                <Phone size={15} />
                80701907 руу залгах
              </a>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden bg-sand">
            <img
              src={heroImage}
              alt="Минимал Хэрэглээ Шопын бараа"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Featured products — pulled live from the API */}
      <section id="featured" className="max-w-6xl mx-auto px-5 md:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="eyebrow mb-3"><span className="eyebrow-dot" />Онцлох бараа</p>
            <h2 className="font-display font-bold text-2xl md:text-3xl">Хамгийн их хэрэглэгддэг</h2>
          </div>
          <Link to="/products" className="btn-ghost hidden sm:inline-flex">
            Бүгдийг үзэх <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-clay py-16">
            <Loader2 size={18} className="animate-spin" /> Ачааллаж байна...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 text-center py-16">
            <AlertCircle size={22} className="text-rust" />
            <p className="text-sm text-clay">{error}</p>
          </div>
        ) : featuredProducts.length === 0 ? (
          <p className="text-sm text-clay text-center py-16">Одоогоор бараа байхгүй байна.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {featuredProducts.map((product) => (
              <FeaturedProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Info strip — delivery, email, returns */}
      <section className="border-t hairline border-solid bg-sand">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <Truck size={18} className="text-navy shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Хүргэлт: 6,000₮</p>
              <p className="text-clay">Хотын А бүсэд</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-navy shrink-0" />
            <p className="text-sm text-clay break-all">minimalheregleeshop@gmail.com</p>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-navy shrink-0" />
            <div className="text-sm">
              <p className="font-medium">7 хоногийн дотор буцаалт</p>
              <p className="text-clay">Шалгасан, баталгаатай бараа</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

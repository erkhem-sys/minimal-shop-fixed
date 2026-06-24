import { Link } from 'react-router-dom'
import { Facebook, MessageCircle, Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t hairline border-solid mt-24">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-9 h-9 rounded-full border-2 border-ink flex items-center justify-center">
                <span className="font-display font-bold text-sm">M</span>
              </span>
              <span className="leading-tight">
                <span className="block font-display font-bold text-sm">МИНИМАЛ</span>
                <span className="block text-[9px] font-medium tracking-widest text-clay">ХЭРЭГЛЭЭ ШОП</span>
              </span>
            </div>
            <p className="text-sm text-clay max-w-xs leading-relaxed">
              Гэр, ажлын байран дахь өдөр тутмын хэрэгцээт зүйлсийг олж өгдөг жижиг дэлгүүр.
              Илүүц зүйлгүй — зөвхөн ашиглах л бараа.
            </p>
          </div>

          <div>
            <p className="eyebrow mb-4"><span className="eyebrow-dot" />Дэлгүүр</p>
            <ul className="space-y-2.5 text-sm text-clay">
              <li><Link to="/products" className="hover:text-navy transition-colors">Бүх бараа</Link></li>
              <li><Link to="/products?category=home" className="hover:text-navy transition-colors">Гэр ахуй</Link></li>
              <li><Link to="/products?category=electronics" className="hover:text-navy transition-colors">Цахилгаан хэрэгсэл</Link></li>
              <li><Link to="/products?category=accessories" className="hover:text-navy transition-colors">Дагалдах хэрэгсэл</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4"><span className="eyebrow-dot" />Холбоо барих</p>
            <ul className="space-y-2.5 text-sm text-clay">
              <li>
                <a 
                   href="tel:80701907" 
                   className="hover:text-navy transition-colors flex items-center gap-2"
                >
                   <Phone size={20} />
                   80701907
                 </a>
              </li>
              <li>
                <a 
                  href="mailto:minimalheregleeshop@gmail.com" 
                  className="hover:text-navy transition-colors flex items-center gap-2"
               >
                  <Mail size={20} />
                  minimalheregleeshop@gmail.com
                </a>
              </li>
               <li className="flex items-center gap-2">
                <MapPin size={20} />
                Улаанбаатар хот
               </li>

               <li>
                <a
                 href="https://facebook.com/minimalhergleeshop"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="hover:text-navy transition-colors flex items-center gap-2"
               >
                 <Facebook size={20} />
                 Facebook Page
               </a>
             </li>

             <li>
               <a
                 href="https://m.me/minimalhergleeshop"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="hover:text-navy transition-colors flex items-center gap-2"
               >
                 <MessageCircle size={20} />
                 Messenger-ээр бичих
               </a>
             </li>
             
            </ul>
          </div>
        </div>

        <div className="border-t hairline border-solid mt-12 pt-6 flex flex-col sm:flex-row
          justify-between items-center gap-3 text-xs text-clay">
          <p>© 2026 Минимал Хэрэглээ Шоп. Бүх эрх хуулиар хамгаалагдсан.</p>
                 </div>
      </div>
    </footer>
  )
}

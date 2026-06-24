import { Phone, Mail, MapPin } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-16">
      <p className="eyebrow mb-4"><span className="eyebrow-dot" />Холбоо барих</p>
      <h1 className="font-display font-bold text-2xl md:text-3xl mb-8">Бидэнтэй холбогдоорой</h1>

      <div className="space-y-5">
        <a href="tel:80701907" className="flex items-center gap-4 border border-rule rounded-xl p-5 hover:border-navy transition-colors">
          <Phone size={20} className="text-navy" />
          <div>
            <p className="font-medium text-sm">Утас</p>
            <p className="text-sm text-clay">80701907</p>
          </div>
        </a>

        <a href="mailto:minimalheregleeshop@gmail.com" className="flex items-center gap-4 border border-rule rounded-xl p-5 hover:border-navy transition-colors">
          <Mail size={20} className="text-navy" />
          <div>
            <p className="font-medium text-sm">Имэйл</p>
            <p className="text-sm text-clay break-all">minimalheregleeshop@gmail.com</p>
          </div>
        </a>

        <div className="flex items-center gap-4 border border-rule rounded-xl p-5">
          <MapPin size={20} className="text-navy" />
          <div>
            <p className="font-medium text-sm">Байршил</p>
            <p className="text-sm text-clay">Улаанбаатар хот</p>
          </div>
        </div>
      </div>
    </div>
  )
}

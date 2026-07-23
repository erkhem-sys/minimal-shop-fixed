// Google Analytics (GA4) болон Facebook Pixel — хоёулаа орчны хувьсагч
// (VITE_GA_MEASUREMENT_ID, VITE_FB_PIXEL_ID) тохируулаагүй үед chimeeguideer
// алгасна (локал хөгжүүлэлтэд ID шаардлагагүй).

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID
const FB_PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID

let initialized = false

export function initAnalytics() {
  if (initialized) return
  initialized = true

  if (GA_ID) {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() {
      window.dataLayer.push(arguments)
    }
    window.gtag('js', new Date())
    // Бид маршрутын өөрчлөлт бүрийг өөрсдөө trackPageView-ээр илгээдэг тул
    // gtag-ийн автомат page_view-ийг унтраана (давхардуулахгүйн тулд).
    window.gtag('config', GA_ID, { send_page_view: false })
  }

  if (FB_PIXEL_ID) {
    /* eslint-disable */
    ;(function (f, b, e, v, n, t, s) {
      if (f.fbq) return
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      }
      if (!f._fbq) f._fbq = n
      n.push = n
      n.loaded = true
      n.version = '2.0'
      n.queue = []
      t = b.createElement(e)
      t.async = true
      t.src = v
      s = b.getElementsByTagName(e)[0]
      s.parentNode.insertBefore(t, s)
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
    /* eslint-enable */
    window.fbq('init', FB_PIXEL_ID)
  }
}

export function trackPageView(path) {
  if (GA_ID && window.gtag) {
    window.gtag('event', 'page_view', { page_path: path })
  }
  if (FB_PIXEL_ID && window.fbq) {
    window.fbq('track', 'PageView')
  }
}

export function trackAddToCart(product, quantity = 1) {
  const value = Number(product.price) * quantity
  if (GA_ID && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'MNT',
      value,
      items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity }],
    })
  }
  if (FB_PIXEL_ID && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value,
      currency: 'MNT',
    })
  }
}

export function trackPurchase(order) {
  const value = Number(order.total)
  if (GA_ID && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: String(order.id),
      currency: 'MNT',
      value,
    })
  }
  if (FB_PIXEL_ID && window.fbq) {
    window.fbq('track', 'Purchase', { value, currency: 'MNT' })
  }
}

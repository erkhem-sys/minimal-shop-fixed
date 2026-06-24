import pool from '../config/db.js'
import { isNonEmptyString, sanitizeString } from '../utils/validation.js'

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export async function createOrder(req, res) {
  const { customer, delivery, payment, items } = req.body

  if (!customer || !isNonEmptyString(customer.name) || !isNonEmptyString(customer.phone)) {
    return res.status(400).json({ message: 'Хүргэлтийн мэдээллээ бөглөнө үү.' })
  }
  if (!isNonEmptyString(customer.address) || !isNonEmptyString(customer.district)) {
    return res.status(400).json({ message: 'Хаягаа бөглөнө үү.' })
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Сагс хоосон байна.' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    let total = 0
    const validatedItems = []

    for (const item of items) {
      const productResult = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [
        item.product_id,
      ])
      const product = productResult.rows[0]

      if (!product) {
        throw Object.assign(new Error(`Бараа олдсонгүй (ID: ${item.product_id}).`), { status: 400 })
      }
      if (product.stock < item.quantity) {
        throw Object.assign(new Error(`"${product.name}" барааны үлдэгдэл хүрэлцэхгүй байна.`), {
          status: 400,
        })
      }

      const lineTotal = Number(product.price) * Number(item.quantity)
      total += lineTotal
      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        price: product.price,
      })

      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [
        item.quantity,
        product.id,
      ])
    }

    const deliveryFee = { standard: 6000, express: 12000, pickup: 0 }[delivery] ?? 6000
    total += deliveryFee

    const orderResult = await client.query(
      `INSERT INTO orders
        (user_id, customer_name, customer_phone, customer_address, customer_district, delivery_method, payment_method, total, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING *`,
      [
        req.user?.id || null,
        sanitizeString(customer.name, 120),
        sanitizeString(customer.phone, 30),
        sanitizeString(customer.address, 300),
        sanitizeString(customer.district, 100),
        sanitizeString(delivery, 30) || 'standard',
        sanitizeString(payment, 30) || 'bank_transfer',
        total,
      ]
    )

    const order = orderResult.rows[0]

    for (const item of validatedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.product_id, item.product_name, item.quantity, item.price]
      )
    }

    await client.query('COMMIT')
    res.status(201).json({ order })
  } catch (err) {
    await client.query('ROLLBACK')
    const status = err.status || 500
    res.status(status).json({ message: err.message || 'Захиалга үүсгэхэд алдаа гарлаа.' })
  } finally {
    client.release()
  }
}

export async function getOrders(req, res) {
  // Админ бол бүх захиалгыг, энгийн хэрэглэгч бол өөрийнхөө захиалгыг харна.
  const isAdmin = req.user?.role === 'admin'
  const query = isAdmin
    ? 'SELECT * FROM orders ORDER BY created_at DESC'
    : 'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC'
  const params = isAdmin ? [] : [req.user.id]

  const ordersResult = await pool.query(query, params)
  const orders = ordersResult.rows

  if (orders.length === 0) {
    return res.json({ orders: [] })
  }

  const orderIds = orders.map((o) => o.id)
  const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = ANY($1)', [orderIds])

  const itemsByOrder = {}
  for (const item of itemsResult.rows) {
    if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = []
    itemsByOrder[item.order_id].push(item)
  }

  const ordersWithItems = orders.map((o) => ({
    ...o,
    customer: { name: o.customer_name, phone: o.customer_phone, address: o.customer_address, district: o.customer_district },
    items: itemsByOrder[o.id] || [],
  }))

  res.json({ orders: ordersWithItems })
}

export async function getOrderById(req, res) {
  const { id } = req.params
  const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [id])

  if (orderResult.rows.length === 0) {
    return res.status(404).json({ message: 'Захиалга олдсонгүй.' })
  }

  const order = orderResult.rows[0]
  const isAdmin = req.user?.role === 'admin'
  const isOwner = req.user && order.user_id === req.user.id

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ message: 'Энэ захиалгыг харах эрхгүй байна.' })
  }

  const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [id])

  res.json({
    order: {
      ...order,
      customer: {
        name: order.customer_name,
        phone: order.customer_phone,
        address: order.customer_address,
        district: order.customer_district,
      },
      items: itemsResult.rows,
    },
  })
}

export async function updateOrderStatus(req, res) {
  const { id } = req.params
  const { status } = req.body

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Захиалгын төлөв буруу байна.' })
  }

  const result = await pool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, id])

  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Захиалга олдсонгүй.' })
  }

  res.json({ order: result.rows[0] })
}

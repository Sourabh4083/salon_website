import { getCurrentUser } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import Cart from "@/models/Cart";
import "@/models/User";
import "@/models/Product"


export async function GET(req) {
    await dbConnect()
    const user = await getCurrentUser()
    


    if (!user || !user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // cartItem is an embedded subdocument array; only cartItem.product is a ref.
    const cart = await Cart.findOne({ user: user.id })
        .populate("cartItem.product", "title price image")
        .lean()

    return NextResponse.json({ cart: cart || { cartItem: [] } }, { status: 200 })
}




export async function POST(req) {
    await dbConnect()
    const user = await getCurrentUser(req)
    

 if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
    const body = await req.json()
    const { items, merge } = body

    if (!Array.isArray(items))
        return NextResponse.json({ error: "Invalid cart" }, { status: 400 })

    // Store product refs + quantities only. Titles/prices are looked up from
    // the Product collection on read, so a tampered body cannot set a price.
    const incoming = new Map()
    for (const item of items) {
        const id = item?.product ?? item?._id
        const quantity = Number(item?.quantity)
        if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
            return NextResponse.json({ error: "Invalid cart item" }, { status: 400 })
        }
        incoming.set(String(id), (incoming.get(String(id)) || 0) + quantity)
    }

    // `merge` folds a guest cart into whatever is already saved instead of
    // replacing it, so signing in never discards the existing server cart.
    if (merge) {
        const existing = await Cart.findOne({ user: user.id }).lean()
        for (const item of existing?.cartItem || []) {
            const id = String(item.product)
            incoming.set(id, (incoming.get(id) || 0) + item.quantity)
        }
    }

    const cartItem = [...incoming].map(([product, quantity]) => ({ product, quantity }))

    // Populate so the client can render straight from this response and
    // does not need a follow-up GET after a merge.
    const updateCart = await Cart.findOneAndUpdate(
        { user: user.id },
        { cartItem },
        { upsert: true, new: true }
    )
        .populate("cartItem.product", "title price image")
        .lean()


    return NextResponse.json({ message: "Cart saved", cart: updateCart })
}



export async function DELETE(req) {
    await dbConnect()
    const user = await getCurrentUser()

    if (!user || !user.id) {
        return NextResponse.json({ error: "Unauthorized"}, {status: 401})
    }

    await Cart.findOneAndUpdate(
        {user: user.id},
        {cartItem: [] }
    )

    return NextResponse.json({message: "Cart cleared"}, { status: 200})

}

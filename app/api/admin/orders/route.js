import { dbConnect } from "@/lib/dbConnect";
import Order from "@/models/Order";
import "@/models/User"; 
import "@/models/Product"; 
import { getCurrentUser } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();

    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const orders = await Order.find()
      .populate("user", "email")
      .populate("cartItem.product", "title price")
      .sort({ createdAt: -1 })
      .lean();

    return new Response(JSON.stringify(orders), { status: 200 });
  } catch (err) {
    console.error("Admin orders error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

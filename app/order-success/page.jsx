import { Suspense } from "react";
import OrderSuccessView from "@/components/OrderSuccessView";

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div className="container-x py-24"><div className="card mx-auto h-96 max-w-xl animate-pulse" /></div>}>
            <OrderSuccessView />
        </Suspense>
    )
}

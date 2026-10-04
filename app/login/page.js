import { Suspense } from "react"
import LoginForm from "@/components/LoginForm"

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="container-x py-16"><div className="card mx-auto h-[520px] max-w-5xl animate-pulse" /></div>}>
            <LoginForm />
        </Suspense>
    )
}
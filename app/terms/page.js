import Link from "next/link";
import PolicyPage from "@/components/PolicyPage";
import { site, gstPercent } from "@/lib/site";

export const metadata = {
  title: "Terms and conditions",
  description: `The terms for buying from ${site.name}.`,
};

export default function TermsPage() {
  const sections = [
    {
      title: "Who we are",
      body: [
        `This website is run by ${site.name}, ${site.address.replace(/\n/g, ", ")}. Our GSTIN is ${site.gstin}.`,
        "By using this website or placing an order, you agree to these terms.",
      ],
    },
    {
      title: "Your account",
      body: [
        "You need an account to place an order. Please give correct details and keep your password to yourself. You are responsible for orders placed from your account.",
      ],
    },
    {
      title: "Products and prices",
      list: [
        `All prices are in Indian rupees and include ${gstPercent}% GST.`,
        "Any delivery charge is shown in the cart and at checkout before you pay.",
        "We photograph our wigs as carefully as we can, but colour and shine can look a little different from one screen to another.",
        "Products are sold while stock lasts. If something you paid for turns out to be unavailable, we will contact you and refund what you paid for it.",
      ],
    },
    {
      title: "Orders and payment",
      body: [
        "Payment is taken online through Razorpay when you place your order. We never see or store your card, UPI or bank details.",
        "An order is confirmed once your payment succeeds. You can see your orders and their status under My orders.",
      ],
    },
    {
      title: "Delivery, returns and refunds",
      body: [
        <>
          Delivery is covered by our{" "}
          <Link href="/shipping-policy" className="link">
            shipping policy
          </Link>
          , and returns and refunds by our{" "}
          <Link href="/refund-policy" className="link">
            refund and cancellation policy
          </Link>
          . Both are part of these terms.
        </>,
      ],
    },
    {
      title: "Salon services",
      body: [
        "Salon appointments are booked by phone or WhatsApp and are paid for at the salon. The price of a service is confirmed when you book.",
      ],
    },
    {
      title: "Using this website",
      body: [
        "Please do not misuse the website, try to break into it, or copy its photos and text without our permission.",
      ],
    },
    {
      title: "Law",
      body: [
        "These terms are governed by the laws of India. Any dispute will be handled by the courts at Raipur, Chhattisgarh.",
      ],
    },
    {
      title: "Changes",
      body: ["We may update these terms. The version on this page is the one that applies when you place an order."],
    },
  ];

  return (
    <PolicyPage
      title="Terms and conditions"
      intro="The terms that apply when you use this website and buy from us."
      updated="6 October 2026"
      sections={sections}
      current="/terms"
    />
  );
}

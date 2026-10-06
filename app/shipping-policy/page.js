import Link from "next/link";
import PolicyPage from "@/components/PolicyPage";
import { site } from "@/lib/site";
import { formateCurrency } from "@/utils/formatCurrency";

export const metadata = {
  title: "Shipping policy",
  description: `Delivery charges and how orders are delivered by ${site.name}.`,
};

export default function ShippingPolicyPage() {
  const sections = [
    {
      title: "Delivery charges",
      list: [
        `Delivery is free on orders of ${formateCurrency(site.shipping.freeAt)} or more.`,
        `Orders below that have a delivery charge of ${formateCurrency(site.shipping.fee)}.`,
        "The charge is shown in your cart and at checkout before you pay.",
      ],
    },
    {
      title: "Where we deliver",
      body: ["We deliver to addresses in India. We do not deliver to other countries at present."],
    },
    {
      title: "Delivery time",
      body: [
        `Delivery time depends on your address. Once your order is placed, contact us on ${site.phone} for the expected delivery date.`,
      ],
    },
    {
      title: "Following your order",
      body: [
        <>
          Sign in and open{" "}
          <Link href="/my-orders" className="link">
            My orders
          </Link>{" "}
          to see whether your order is pending, shipped or delivered.
        </>,
      ],
    },
    {
      title: "Your address",
      body: [
        "Please check your address and phone number at checkout. If the courier cannot reach you, we will contact you to arrange delivery again.",
      ],
    },
    {
      title: "Buying at the salon",
      body: [`You are welcome to see, try and buy any product at our salon: ${site.address.replace(/\n/g, ", ")}.`],
    },
  ];

  return (
    <PolicyPage
      title="Shipping policy"
      intro="How your order gets to you and what delivery costs."
      updated="6 October 2026"
      sections={sections}
      current="/shipping-policy"
    />
  );
}

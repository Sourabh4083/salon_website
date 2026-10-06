import PolicyPage from "@/components/PolicyPage";
import { site } from "@/lib/site";

export const metadata = {
  title: "Refund and cancellation policy",
  description: `Returns, refunds and cancellations at ${site.name}.`,
};

export default function RefundPolicyPage() {
  const sections = [
    {
      title: "Returns and exchanges",
      body: [
        "All sales are final. Wigs, hair patches and toppers are personal hygiene products, so we do not accept returns or exchanges at present.",
        "Please check the photos, colour, length and details before you order. If you are unsure, call or message us, or visit the salon to see and try the product first.",
      ],
    },
    {
      title: "Cancellations",
      body: [
        `Orders cannot be cancelled on the website. If you need to change or cancel an order, contact us on ${site.phone} as soon as possible, before it is sent out.`,
      ],
    },
    {
      title: "Refunds",
      body: ["Because we do not accept returns, refunds are given only in these cases:"],
      list: [
        "Money was taken from your account but the order was not confirmed.",
        "You were charged more than once for the same order.",
        "We are unable to supply a product you paid for.",
        "We agree to cancel your order before it is sent out.",
      ],
    },
    {
      title: "How refunds are paid",
      body: [
        "Refunds go back to the payment method you used, through Razorpay. They usually reach your account within 5 to 7 working days, depending on your bank.",
      ],
    },
    {
      title: "A problem with your order",
      body: [
        `If your order arrives damaged, or is not what you ordered, contact us on ${site.phone} with your order details and photos and we will put it right.`,
      ],
    },
  ];

  return (
    <PolicyPage
      title="Refund and cancellation policy"
      intro="Please read this before you order. We do not accept returns at present."
      updated="6 October 2026"
      sections={sections}
      current="/refund-policy"
    />
  );
}

import PolicyPage from "@/components/PolicyPage";
import { site } from "@/lib/site";

export const metadata = {
  title: "Privacy policy",
  description: `How ${site.name} collects and uses your details.`,
};

export default function PrivacyPage() {
  const sections = [
    {
      title: "What we collect",
      list: [
        "When you create an account: your name, username, mobile number and password. The password is stored in scrambled form, so we cannot read it.",
        "On your account page, if you choose to add them: your address, gender and date of birth.",
        "When you order: your name, phone number, delivery address, what you bought and what you paid.",
      ],
    },
    {
      title: "Payments",
      body: [
        "Payments are handled by Razorpay. Your card, UPI and bank details go straight to Razorpay and are never seen or stored by us. We only receive confirmation that the payment succeeded.",
      ],
    },
    {
      title: "How we use your details",
      body: ["We do not sell your details, and we do not use them for advertising. We use them only:"],
      list: [
        "To take, deliver and keep a record of your orders.",
        "To contact you about an order or an appointment.",
        "To keep you signed in and remember your cart.",
      ],
    },
    {
      title: "Who we share them with",
      body: [
        "Only the services we need to run the shop: Razorpay for payment, the courier that delivers your order (name, phone number and address), and the companies that host this website and its data. We also share details when the law requires it.",
      ],
    },
    {
      title: "Cookies",
      body: [
        "We use one cookie to keep you signed in. We do not use advertising or tracking cookies. The map on our pages is provided by Google Maps, and the payment window by Razorpay, and each may set cookies of its own.",
      ],
    },
    {
      title: "Your choices",
      body: [
        `You can see and change your details on your account page. To have your account deleted, call or message us on ${site.phone}. We keep order records for as long as tax law requires.`,
      ],
    },
    {
      title: "Changes",
      body: ["If we change this policy, the new version will be posted on this page."],
    },
  ];

  return (
    <PolicyPage
      title="Privacy policy"
      intro="What we collect when you use this website, and what we do with it."
      updated="6 October 2026"
      sections={sections}
      current="/privacy"
    />
  );
}

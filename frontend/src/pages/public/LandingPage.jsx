import { Link } from "react-router-dom";
import Footer from "../../components/layout/Footer";

const features = [
  {
    icon: "💊",
    title: "Wide Medicine Range",
    desc: "From OTC to prescription medicines, all in one place.",
  },
  {
    icon: "📄",
    title: "Prescription Upload",
    desc: "Upload your prescription and get it verified by our pharmacists.",
  },
  {
    icon: "🚚",
    title: "Fast Delivery",
    desc: "Quick delivery across Nepal — Kathmandu to your district.",
  },
  {
    icon: "🔒",
    title: "Secure & Verified",
    desc: "Only genuine medicines from licensed pharmacies.",
  },
  {
    icon: "💳",
    title: "Flexible Payment",
    desc: "Pay via COD, eSewa, or Khalti — your choice.",
  },
  {
    icon: "📞",
    title: "Support",
    desc: "MediBot and support team here to help 24/7.",
  },
];

const stats = [
  { value: "0", label: "Orders Delivered" },
  { value: "0", label: "Medicines" },
  { value: "0", label: "Partner Pharmacies" },
  { value: "0", label: "Districts Covered" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      <nav className="sticky top-0 z-40 flex items-center justify-between px-4 py-4 lg:px-8 bg-cream/95 backdrop-blur border-b border-charcoal/5">
        <Link
          to="/"
          className="font-fraunces text-xl font-semibold italic text-primary"
        >
          MediReach
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-charcoal/70 hover:text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <section className="px-4 py-12 lg:py-20 lg:px-8 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="page-enter">
            <h1 className="font-fraunces text-4xl lg:text-5xl font-bold text-charcoal leading-tight">
              <span className="italic">Your health</span>, delivered to your
              door.
            </h1>
            <p className="mt-4 text-lg text-charcoal/70">
              Nepal's trusted online pharmacy. Order medicines, upload
              prescriptions, and get fast delivery — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="rounded-xl bg-primary px-6 py-3 font-medium text-white hover:bg-primary-dark transition-all hover:scale-[1.02]"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-charcoal/20 px-6 py-3 font-medium text-charcoal hover:bg-charcoal/5 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-charcoal text-cream py-12 px-4 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="font-fraunces text-3xl lg:text-4xl font-bold">
                {s.value}
              </p>
              <p className="text-cream/70 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 lg:px-8 max-w-6xl mx-auto">
        <h2 className="font-fraunces text-3xl font-bold text-charcoal text-center mb-12">
          Why MediReach?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-card hover-lift transition-all duration-300"
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-fraunces text-lg font-semibold text-charcoal mt-3">
                {f.title}
              </h3>
              <p className="text-sm text-charcoal/60 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 lg:px-8 bg-primary/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-fraunces text-3xl font-bold text-charcoal">
            Ready to order your medicines?
          </h2>
          <p className="mt-3 text-charcoal/70">
            Join thousands of customers across Nepal. Sign up in minutes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="rounded-xl bg-primary px-8 py-3 font-medium text-white hover:bg-primary-dark transition-colors"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-charcoal/20 px-8 py-3 font-medium text-charcoal hover:bg-white transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <Footer variant="dark" />
    </div>
  );
}

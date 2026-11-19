import React, { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowDown, Sparkles, Check, Info, Radio, VideoOff, ShieldCheck, MonitorPlay, MessagesSquare, Award, Send,
  LockKeyhole, Loader2, type LucideIcon,
} from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import CtaBanner from '../components/CtaBanner';
import WorkshopDropdown from '../components/WorkshopDropdown';
import WorkshopPaymentDialog, { type PaymentResult } from '../components/WorkshopPaymentDialog';
import {
  initialRegistration, normalizePhone, validateRegistration, createWorkshopOrder,
  verifyWorkshopPayment, loadCheckout, readPendingPayment, storePendingPayment,
  RegistrationValidationError, WorkshopApiError, WORKSHOP_COURSES,
  CheckoutLoadError, logWorkshopPayment,
  DEFAULT_PAYMENT_AMOUNT, paymentAmountPaise, formatPaymentAmount,
  type Registration, type RegistrationField, type RegistrationErrors, type PaymentStage, type PendingPayment, type Checkout,
} from '../lib/workshopPayment';
import heroImage from '../images/gallery/client_2151.jpg';
import polaroidImage from '../images/gallery/client_2175.jpg';
import muhurthamImage from '../images/gallery/client_2170.jpg';
import receptionImage from '../images/gallery/client_2163.jpg';

const INSTAGRAM_URL = 'https://instagram.com/srinithimakeupartist';

interface Highlight {
  label: string;
  title: string;
  text: string;
  /** Skin-tone swatches the look is demonstrated on */
  swatches?: string[];
}

interface WorkshopDay {
  num: string;
  title: string;
  accent: string;
  tagline: string;
  image: string;
  description: string;
  highlights: Highlight[];
  learn: string[];
  note?: string;
}

const days: WorkshopDay[] = [
  {
    num: '01',
    title: 'Muhurtham',
    accent: 'Look',
    tagline: 'Timeless South Indian bridal, made skin-true.',
    image: muhurthamImage,
    description:
      'The traditional muhurtham bride, taught in depth on a medium-fair skin makeover with a classic South Indian bridal hairstyle. Timeless elegance with balanced tones and authentic skin that looks real up close and in every photo.',
    highlights: [
      {
        label: 'The look',
        title: 'South Indian bridal',
        text: 'Timeless traditional elegance, balanced tones, authentic skin.',
      },
      {
        label: 'Demonstrated on',
        title: 'Medium-fair skin',
        text: 'A full makeover, matched precisely to the skin’s natural undertone.',
        swatches: ['#C99476', '#D9A98A', '#E8C1A4'],
      },
      {
        label: 'The hair',
        title: 'Traditional bridal hairstyle',
        text: 'A classic South Indian bridal hairstyle to complete the timeless muhurtham look.',
      },
    ],
    learn: [
      'Understanding skin types and undertones for flawless base creation',
      "Correcting skin tone to match the bride's natural complexion",
      'Creating a classic South Indian bridal hairstyle',
      'Bringing out the glow without heavy layering',
      'Complete vanity reveal and product knowledge',
    ],
    note: 'Saree draping is not included in the Day 1 session.',
  },
  {
    num: '02',
    title: 'Reception',
    accent: 'Look',
    tagline: 'Evening glam with a seamless, skin-true airbrush foundation base.',
    image: receptionImage,
    description:
      'The evening reception bride, taught on a deep-dusky skin makeover: glam designed to enhance depth, not hide it, with precise undertone matching and radiant evening luminosity. Finished with a seamless, lightweight airbrush foundation base.',
    highlights: [
      {
        label: 'The look',
        title: 'Wedding evening glam',
        text: 'Skin-true bridal glam with radiant evening luminosity.',
      },
      {
        label: 'Demonstrated on',
        title: 'Deep-dusky skin',
        text: 'A full makeover that enhances depth instead of hiding it.',
        swatches: ['#6E4430', '#83543B', '#9A6646'],
      },
      {
        label: 'The technique',
        title: 'Airbrush foundation',
        text: 'A seamless, lightweight base that enhances deep-dusky skin and lasts through the evening.',
      },
    ],
    learn: [
      'Matching undertones precisely on deep-dusky skin',
      'Building evening luminosity that photographs beautifully',
      'Airbrush foundation technique for a seamless, long-wear base',
      'Time-saving hacks for real bridal bookings',
      'Makeup guidance from my real bridal experience',
    ],
    note: 'Hairstyling and saree draping are not included in the Day 2 session.',
  },
];

const marqueeItems = [
  'Muhurtham bridal', 'Airbrush foundation', 'Reception glam', 'Undertone matching',
  'Complete vanity reveal', 'Muhurtham hairstyle', 'Extended live Q&A', 'Digital completion certificate',
];

const essentials: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: VideoOff, title: 'No recordings', text: 'Sessions are live only, so join in real time.' },
  { icon: ShieldCheck, title: 'Secure access', text: 'You join through a professional, private app.' },
  { icon: MonitorPlay, title: 'Crystal-clear HD', text: 'Every brush stroke streamed in high definition.' },
  { icon: MessagesSquare, title: 'Extended Q&A', text: 'Time set aside to clear every doubt you bring.' },
];

const steps = [
  { title: 'Choose your course', text: 'Register for both days or select the bridal look you want to learn.' },
  { title: 'Pay your advance', text: 'Choose your advance amount and pay securely through Razorpay to reserve your seat.' },
  { title: 'Pay the balance later', text: 'We will confirm your remaining balance and share instructions for paying it. Message us on Instagram with any questions.' },
];

/** Circular "Live · Online" sticker whose text slowly rotates */
const SpinBadge: React.FC = () => {
  const pathId = `ws-badge-${useId().replace(/:/g, '')}`;
  return (
    <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-ivory shadow-luxe ring-1 ring-champagne sm:h-32 sm:w-32">
      <svg viewBox="0 0 120 120" aria-hidden="true" className="absolute inset-0 h-full w-full animate-[spin_20s_linear_infinite] motion-reduce:animate-none">
        <defs>
          <path id={pathId} d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
        </defs>
        <text className="fill-cocoa font-inter text-[9.5px] font-semibold uppercase tracking-[0.28em]">
          <textPath href={`#${pathId}`}>Live · Online · 2-Day Workshop ·</textPath>
        </text>
      </svg>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-chocolate text-champagne">
        <Radio className="h-5 w-5" />
      </span>
    </div>
  );
};

/** Illustrated preview of the digital completion certificate */
const CertificatePreview: React.FC = () => (
  <div
    role="img"
    aria-label="Sample digital certificate of completion from SK Bridal Studio, signed by Srinithi"
    className="relative mx-auto w-full max-w-md transition-transform duration-500 sm:rotate-[-2deg] sm:hover:rotate-0"
  >
    {/* Height follows the content on phones; true landscape proportions from sm up */}
    <div className="relative rounded-md bg-ivory p-2 shadow-luxe sm:aspect-[1.414/1] sm:p-2.5">
      {/* Double frame */}
      <div className="flex h-full flex-col items-center justify-between gap-4 rounded-sm border-2 border-champagne px-5 py-6 text-center outline outline-1 outline-offset-[-7px] outline-champagne/60 sm:gap-0 sm:px-6 sm:py-5">
        {/* Corner flourishes */}
        {['left-2 top-2', 'right-2 top-2 rotate-90', 'bottom-2 right-2 rotate-180', 'bottom-2 left-2 -rotate-90'].map((pos) => (
          <span key={pos} aria-hidden="true" className={`absolute h-4 w-4 border-l-2 border-t-2 border-mocha/50 sm:h-5 sm:w-5 ${pos}`} />
        ))}

        <div>
          <p className="font-inter text-[9px] font-semibold uppercase tracking-[0.35em] text-mocha">SK Bridal Studio</p>
          <p className="mt-1.5 font-playfair text-xl font-medium uppercase leading-none tracking-[0.12em] text-chocolate">
            Certificate
          </p>
          <p className="mt-0.5 font-cormorant text-base italic text-cocoa">of Completion</p>
        </div>

        <div className="w-full">
          <p className="font-inter text-[9px] uppercase tracking-[0.25em] text-mocha sm:text-[8px]">Proudly presented to</p>
          <p className="mx-auto mt-0.5 w-3/4 border-b border-champagne pb-0.5 font-script text-3xl leading-tight text-chocolate">
            Your Name
          </p>
          <p className="mx-auto mt-1.5 max-w-[16rem] font-inter text-[11px] leading-snug text-ink sm:max-w-none sm:text-[9px]">
            for completing the 2-Day Live Bridal Makeup &amp; Hair Masterclass
          </p>
        </div>

        <div className="flex w-full items-end justify-between gap-2">
          <div className="w-[42%] text-center sm:w-1/3">
            <p className="font-script text-2xl leading-none text-cocoa">Srinithi</p>
            <p className="mt-0.5 border-t border-champagne pt-0.5 font-inter whitespace-nowrap text-[8px] uppercase tracking-[0.2em] text-mocha sm:text-[7px]">Makeup Artist</p>
          </div>
          <div className="w-[42%] text-center sm:w-1/3">
            <p className="font-cormorant text-base italic leading-[1.5rem] text-cocoa">Live · Online</p>
            <p className="mt-0.5 border-t border-champagne pt-0.5 font-inter whitespace-nowrap text-[8px] uppercase tracking-[0.2em] text-mocha sm:text-[7px]">Workshop</p>
          </div>
        </div>
      </div>

      {/* Seal with ribbon tails */}
      <div aria-hidden="true" className="absolute -bottom-5 left-1/2 -translate-x-1/2 sm:-bottom-6">
        <span className="absolute left-1/2 top-6 h-8 w-3 -translate-x-[110%] rotate-[18deg] bg-cocoa [clip-path:polygon(0_0,100%_0,100%_100%,50%_80%,0_100%)] sm:top-8 sm:h-10 sm:w-4" />
        <span className="absolute left-1/2 top-6 h-8 w-3 translate-x-[10%] -rotate-[18deg] bg-cocoa [clip-path:polygon(0_0,100%_0,100%_100%,50%_80%,0_100%)] sm:top-8 sm:h-10 sm:w-4" />
        <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-champagne to-mocha text-chocolate shadow-soft ring-4 ring-ivory sm:h-14 sm:w-14">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-chocolate/50 sm:h-10 sm:w-10">
            <Award className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
        </span>
      </div>
    </div>
  </div>
);

const Workshops: React.FC = () => {
  const [active, setActive] = useState(0);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(readPendingPayment);
  const [registration, setRegistration] = useState<Registration>(() => {
    const pending = readPendingPayment();
    return pending ? { ...pending.registration, phone: normalizePhone(pending.registration.phone) } : { ...initialRegistration };
  });
  const [paymentAmount, setPaymentAmount] = useState(() => {
    const amount = readPendingPayment()?.amount;
    return amount == null ? DEFAULT_PAYMENT_AMOUNT : String(amount / 100);
  });
  const [verifiedAmount, setVerifiedAmount] = useState(0);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [stage, setStage] = useState<PaymentStage>('idle');
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [resultDetail, setResultDetail] = useState('');
  const [formError, setFormError] = useState('');
  const busy = useRef(false);
  const checkout = useRef<Checkout | null>(null);
  const reusableOrder = useRef<{ fingerprint: string; order: Awaited<ReturnType<typeof createWorkshopOrder>> } | null>(null);
  const mounted = useRef(true);
  const processing = stage !== 'idle';
  const statusText: Record<PaymentStage, string> = {
    idle: '', creating: 'Creating Razorpay order...', opening: 'Opening payment gateway...',
    checkout: 'Complete your payment in the secure Razorpay checkout.',
    verifying: 'Verifying payment and saving registration...', saving: 'Saving registration...',
  };
  const day = days[active];

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; checkout.current?.close(); };
  }, []);

  const fieldAccessibility = (field: RegistrationField) => ({
    'aria-invalid': Boolean(errors[field]),
    'aria-describedby': errors[field] ? `workshop-${field}-error` : undefined,
  });
  const fieldError = (field: RegistrationField) => errors[field] && (
    <p id={`workshop-${field}-error`} className="mt-2 text-sm text-red-700">{errors[field]}</p>
  );

  const handleRegistrationChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const value = event.target.name === 'phone'
      ? normalizePhone(event.target.value)
      : event.target.value;
    const field = event.target.name as keyof Registration;
    setFormError('');
    setRegistration((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const finishPayment = (outcome: PaymentResult) => {
    if (!mounted.current) return;
    busy.current = false;
    setStage('idle');
    setResult(outcome);
  };

  const verifyPayment = async (pending: PendingPayment) => {
    if (!mounted.current) return;
    setStage('verifying');
    try {
      const advance = await verifyWorkshopPayment(pending.proof, pending.amount);
      reusableOrder.current = null;
      logWorkshopPayment('registration_saved', { amount: advance * 100, currency: 'INR' });
      if (mounted.current) setVerifiedAmount(advance);
      storePendingPayment(null);
      if (mounted.current) setPendingPayment(null);
      finishPayment('success');
    } catch (error) {
      logWorkshopPayment('verification_failed', { code: error instanceof WorkshopApiError ? error.kind : 'COMMUNICATION_ERROR', stage: 'verifying' });
      if (mounted.current) setResultDetail(error instanceof Error ? error.message : 'Payment verification is unavailable. Please try again.');
      finishPayment(error instanceof WorkshopApiError && error.kind === 'saving' ? 'saving-failure' : 'failure');
    }
  };

  const startPayment = async () => {
    if (busy.current || result === 'success') return;
    setResultDetail('');
    setFormError('');
    if (pendingPayment) {
      busy.current = true;
      setResult(null);
      await verifyPayment(pendingPayment);
      return;
    }
    const validationErrors = validateRegistration(registration);
    try { paymentAmountPaise(paymentAmount); } catch (error) {
      if (error instanceof RegistrationValidationError) Object.assign(validationErrors, error.fields); else throw error;
    }
    setErrors(validationErrors);
    const firstError = Object.keys(validationErrors)[0];
    if (firstError) {
      document.querySelector<HTMLElement>(`[name="${firstError}"]`)?.focus();
      return;
    }
    busy.current = true;
    setResult(null);
    setStage('opening');
    const submitted = { ...registration, phone: `91${registration.phone}` };
    let settled = false;
    let orderCreated = false;
    try {
      await loadCheckout();
      if (!mounted.current) return;
      setStage('creating');
      // A cancelled/failed Checkout can retry the same order. Bind it to all
      // registration details and the exact amount so edited forms get a new one.
      const fingerprint = JSON.stringify([submitted, paymentAmountPaise(paymentAmount)]);
      const cached = reusableOrder.current;
      const order = cached?.fingerprint === fingerprint ? cached.order : await createWorkshopOrder({ registration: submitted, amount: paymentAmount });
      reusableOrder.current = { fingerprint, order };
      orderCreated = true;
      logWorkshopPayment('order_ready', { amount: order.amount, currency: order.currency, mode: order.keyId.startsWith('rzp_test_') ? 'test' : 'live' });
      if (!mounted.current) return;
      setStage('opening');
      if (!window.Razorpay || order.amount !== paymentAmountPaise(paymentAmount) || order.currency !== 'INR' || !order.orderId || !order.keyId) throw new Error('Invalid payment order.');
      const instance = new window.Razorpay({
        key: order.keyId, amount: order.amount, currency: order.currency, order_id: order.orderId,
        name: 'SK Bridal Studio', description: `${submitted.course} — ${formatPaymentAmount(order.amount / 100)} advance`,
        prefill: { name: submitted.name, contact: submitted.phone, ...(submitted.email ? { email: submitted.email } : {}) },
        theme: { color: '#4B3025' }, redirect: false, retry: { enabled: false },
        modal: { handleback: false, ondismiss: () => {
          if (settled) return;
          settled = true;
          logWorkshopPayment('checkout_dismissed', { stage: 'checkout' });
          finishPayment('cancelled');
        } },
        handler: (proof) => {
          if (settled) return;
          settled = true;
          const pending = { proof, registration: submitted, amount: order.amount };
          storePendingPayment(pending);
          setPendingPayment(pending);
          instance.close();
          void verifyPayment(pending);
        },
      });
      checkout.current = instance;
      instance.on('payment.failed', () => {
        if (settled) return;
        settled = true;
        logWorkshopPayment('payment_failed', { stage: 'checkout' });
        instance.close();
        finishPayment('failure');
      });
      setStage('checkout');
      logWorkshopPayment('checkout_open_requested', { stage: 'checkout' });
      instance.open();
    } catch (error) {
      settled = true;
      if (!mounted.current) return;
      if (error instanceof CheckoutLoadError) {
        setResultDetail(error.message);
        finishPayment('gateway-unavailable');
        return;
      }
      if (!orderCreated) {
        logWorkshopPayment('order_failed', { code: error instanceof RegistrationValidationError ? 'VALIDATION_FAILED' : 'ORDER_REQUEST_FAILED', stage: 'creating' });
        busy.current = false;
        setStage('idle');
        setResult(null);
        if (error instanceof RegistrationValidationError) {
          setErrors(error.fields);
          setFormError(Object.keys(error.fields).length ? 'Please correct the highlighted fields.' : error.message);
          const firstField = Object.keys(error.fields)[0];
          if (firstField) document.querySelector<HTMLElement>(`[name="${firstField}"]`)?.focus();
        } else {
          setFormError(error instanceof Error ? `Unable to create your payment order: ${error.message}` : 'Unable to create your payment order. Please try again.');
        }
        return;
      }
      if (mounted.current) setResultDetail(error instanceof Error ? error.message : 'The payment gateway is unavailable. Please try again.');
      logWorkshopPayment('checkout_open_failed', { code: 'CHECKOUT_OPEN_FAILED', stage: 'opening' });
      finishPayment('gateway-unavailable');
    }
  };

  const handleRegistrationSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void startPayment();
  };

  const closeResult = () => {
    if (result === 'success') {
      setRegistration({ ...initialRegistration });
      setPaymentAmount(DEFAULT_PAYMENT_AMOUNT);
      setVerifiedAmount(0);
      setErrors({});
    }
    setResult(null);
  };

  useEffect(() => {
    // Fast Refresh preserves local form state, including obsolete errors.
    // Clear development notices when code reloads without clearing student data.
    if (import.meta.env.DEV) { setFormError(''); setResultDetail(''); }
    const prevTitle = document.title;
    document.title = 'Live Makeup & Hair Workshops | SK Bridal Studio';
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <div className="pt-20 min-h-screen bg-ivory">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-beige to-ivory">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 -left-32 h-96 w-96 rounded-full bg-blush/50 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-champagne/30 blur-3xl" />

        <div className="relative container mx-auto grid items-center gap-12 px-4 pt-6 pb-8 sm:py-14 md:max-w-[90%] lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:py-16">
          <div className="text-center lg:text-left animate-fade-in">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-champagne bg-ivory/80 px-4 py-2 font-inter text-[11px] font-semibold uppercase tracking-[0.3em] text-cocoa">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-clay animate-ping motion-reduce:hidden" />
                <span className="relative h-2 w-2 rounded-full bg-clay" />
              </span>
              Live Virtual Masterclass
            </span>

            <h1 className="mt-5 sm:mt-7 font-playfair text-5xl sm:text-6xl xl:text-7xl font-medium leading-[1.05] text-chocolate">
              2 Sessions.
              <br />
              Two Styles.
              <br />
              <span className="font-cormorant italic text-cocoa">Mastered live.</span>
            </h1>

            <p className="mx-auto mt-4 sm:mt-7 max-w-xl font-inter text-base sm:text-lg leading-relaxed text-ink lg:mx-0">
              A two-day interactive virtual masterclass with Srinithi: the muhurtham look on the first day, the
              reception look on the second. Demonstrated as it happens, with all your questions answered along the way.
            </p>

            <dl className="mx-auto mt-5 sm:mt-9 grid max-w-md grid-cols-3 divide-x divide-sand rounded-2xl border border-sand bg-ivory/70 py-3 sm:py-4 lg:mx-0">
              {[
                ['02', 'Days'],
                ['02', 'Bridal looks'],
                ['01', 'Bridal hairstyle'],
              ].map(([n, label]) => (
                <div key={label} className="px-2 text-center">
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-cormorant text-3xl sm:text-4xl italic leading-none text-chocolate">{n}</dd>
                  <dd className="mt-1 sm:mt-1.5 font-inter text-[10px] font-semibold uppercase leading-snug tracking-[0.1em] sm:tracking-[0.2em] text-mocha">{label}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 sm:mt-9 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <a href="#registration" className="btn-primary !py-3 sm:!py-3.5">
                <Send className="h-4 w-4" />
                Register for a Course
              </a>
              <a href="#programme" className="btn-outline !py-3 sm:!py-3.5">
                Explore the 2 Days
                <ArrowDown className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-3 sm:mt-4 font-inter text-sm text-mocha">Choose your course and send your details using the registration form below.</p>
          </div>

          {/* Photo collage */}
          <div className="relative mx-auto w-full max-w-sm sm:max-w-md">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[2rem] border-[6px] border-ivory shadow-luxe">
              <img
                src={heroImage}
                alt="Srinithi finishing a bride's makeup"
                decoding="async"
                className="h-full w-full object-cover object-[50%_30%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-chocolate/40 via-transparent to-transparent" />
            </div>

            <figure className="absolute -bottom-10 -left-4 w-36 rotate-[-7deg] rounded-md bg-ivory p-2 pb-3 shadow-luxe transition-transform duration-500 hover:rotate-0 sm:-left-12 sm:w-44">
              <img src={polaroidImage} alt="" loading="lazy" decoding="async" className="aspect-square w-full rounded-sm object-cover object-top" />
              <figcaption className="mt-2 text-center font-script text-2xl leading-none text-cocoa">Learn with me</figcaption>
            </figure>

            <div className="absolute -right-3 -top-6 sm:-right-10">
              <SpinBadge />
            </div>
          </div>
        </div>
      </section>

      {/* Topic ribbon */}
      <div className="overflow-hidden bg-chocolate py-5 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <ul className="flex w-max animate-marquee items-center motion-reduce:animate-none">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <li
              key={`${item}-${i}`}
              aria-hidden={i >= marqueeItems.length}
              className="flex items-center whitespace-nowrap px-6 font-cormorant text-2xl italic text-sand"
            >
              {item}
              <Sparkles className="ml-12 h-4 w-4 text-champagne" />
            </li>
          ))}
        </ul>
      </div>

      {/* Programme */}
      <section id="programme" className="scroll-mt-24 py-10 md:py-16">
        <div className="container mx-auto px-4 md:max-w-[90%]">
          <SectionHeading
            eyebrow="The Programme"
            title={
              <>
                Two Days, <span className="font-cormorant italic text-cocoa">Two Bridal Looks</span>
              </>
            }
            subtitle="Both looks are taught in depth, using techniques refined through real bridal experience, to bridge the gap between model practice and a real bride. Pick a day to see what's covered."
            className="mb-8 md:mb-10"
          />

          {/* Day switcher */}
          <div role="tablist" aria-label="Workshop days" className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
            {days.map((d, i) => {
              const selected = i === active;
              return (
                <button
                  key={d.num}
                  type="button"
                  role="tab"
                  id={`day-tab-${d.num}`}
                  aria-selected={selected}
                  aria-controls="day-panel"
                  onClick={() => setActive(i)}
                  className={`group relative flex items-center gap-4 sm:gap-5 overflow-hidden rounded-3xl sm:rounded-[1.75rem] border px-5 py-3.5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-ivory sm:p-6 ${
                    selected
                      ? 'border-chocolate bg-chocolate text-ivory shadow-luxe'
                      : 'border-sand bg-ivory text-chocolate shadow-soft hover:-translate-y-0.5 hover:border-champagne'
                  }`}
                >
                  <span
                    className={`font-cormorant text-5xl italic leading-none sm:text-7xl ${selected ? 'text-champagne' : 'text-champagne/80'}`}
                  >
                    {d.num}
                  </span>
                  <span>
                    <span className={`block font-inter text-[11px] font-semibold uppercase tracking-[0.3em] ${selected ? 'text-champagne' : 'text-mocha'}`}>
                      Day {d.num}
                    </span>
                    <span className="mt-1 sm:mt-1.5 block font-playfair text-lg font-medium leading-snug sm:text-2xl">
                      {d.title} {d.accent}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected day */}
          <div
            key={day.num}
            id="day-panel"
            role="tabpanel"
            aria-labelledby={`day-tab-${day.num}`}
            className="mt-10 grid items-start gap-10 animate-fade-in lg:mt-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12"
          >
            <div className="relative mx-auto w-[calc(100%-2rem)] max-w-sm lg:sticky lg:top-28">
              <div aria-hidden="true" className="absolute -inset-4 rounded-t-full border border-champagne" />
              <div className="relative aspect-[4/5] rounded-t-full bg-gradient-to-b from-champagne via-mocha to-champagne p-1.5 shadow-luxe">
                <div className="h-full w-full overflow-hidden rounded-t-full bg-sand">
                  <img
                    src={day.image}
                    alt={`${day.title} ${day.accent} workshop`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
              </div>
              <span className="card absolute -bottom-6 -right-4 flex flex-col items-center justify-center px-5 py-3 animate-float sm:-right-8">
                <span className="font-inter text-[10px] font-semibold uppercase tracking-[0.3em] text-mocha">Day</span>
                <span className="font-cormorant text-4xl italic leading-none text-cocoa">{day.num}</span>
              </span>
            </div>

            <div className="text-center lg:text-left">
              <h2 className="font-playfair text-4xl sm:text-5xl font-medium leading-tight text-chocolate">
                {day.title} <span className="font-cormorant italic text-cocoa">{day.accent}</span>
              </h2>
              <p className="mt-3 font-cormorant text-2xl italic text-mocha">{day.tagline}</p>
              <div className="ornament mx-auto mt-6 lg:mx-0" />
              <p className="mx-auto mt-6 max-w-2xl font-inter text-base sm:text-lg leading-relaxed text-ink lg:mx-0">
                {day.description}
              </p>

              <div className="mt-9 grid gap-4 text-left sm:grid-cols-2">
                {day.highlights.map((h) => (
                  // An odd card out at the end spans the full row
                  <article key={h.label} className="card relative p-6 sm:last:odd:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-inter text-[11px] font-semibold uppercase tracking-[0.3em] text-mocha">{h.label}</p>
                      {h.swatches && (
                        <span className="flex -space-x-1.5" aria-hidden="true">
                          {h.swatches.map((c) => (
                            <span key={c} className="h-5 w-5 rounded-full ring-2 ring-ivory" style={{ backgroundColor: c }} />
                          ))}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 font-playfair text-2xl font-medium text-chocolate">{h.title}</h3>
                    <p className="mt-2 font-inter text-sm leading-relaxed text-ink">{h.text}</p>
                  </article>
                ))}
              </div>

              <div className="mt-10 text-left">
                <p className="eyebrow">What you'll learn</p>
                <ol className="mt-5 grid gap-3 sm:grid-cols-2">
                  {day.learn.map((item, i) => (
                    <li key={item} className="flex items-start gap-3 rounded-2xl border border-sand bg-beige/50 p-4">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-chocolate font-inter text-[11px] font-semibold text-champagne">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-inter text-sm leading-relaxed text-ink">{item}</span>
                    </li>
                  ))}
                </ol>
                {day.note && (
                  <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-blush/60 px-4 py-2 font-inter text-xs font-medium text-cocoa">
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    {day.note}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before you join */}
      <section className="relative overflow-hidden bg-beige py-10 md:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-blush/60 blur-3xl" />
        <div className="relative container mx-auto px-4 md:max-w-[90%]">
          <SectionHeading
            eyebrow="Before You Join"
            title="Good to Know"
            subtitle="How the live sessions run, so you can plan your day"
            className="mb-8 md:mb-10"
          />
          {/* Compact rows on phones (icon beside the text); centred cards from sm up */}
          <div className="mx-auto grid max-w-5xl gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {essentials.map((e) => (
              <div key={e.title} className="group card flex items-center gap-4 p-4 text-left transition-transform duration-300 hover:-translate-y-1 sm:block sm:p-6 sm:text-center">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-beige text-cocoa ring-1 ring-champagne transition-colors duration-300 group-hover:bg-chocolate group-hover:text-champagne sm:mx-auto sm:h-14 sm:w-14">
                  <e.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <div>
                  <h3 className="font-playfair text-lg font-medium text-chocolate sm:mt-5 sm:text-xl">{e.title}</h3>
                  <p className="mt-0.5 font-inter text-sm leading-relaxed text-ink sm:mt-2">{e.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Certificate callout */}
          <div className="mx-auto mt-6 grid max-w-5xl items-center gap-8 overflow-hidden rounded-3xl bg-chocolate px-4 pb-12 pt-7 text-center shadow-luxe sm:mt-8 sm:gap-10 sm:rounded-[1.75rem] sm:px-10 sm:pb-14 sm:pt-10 lg:grid-cols-[1fr_1.1fr] lg:py-12 lg:text-left">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-champagne/50 px-3.5 py-1.5 font-inter text-[11px] font-semibold uppercase tracking-[0.3em] text-champagne">
                <Award className="h-3.5 w-3.5" />
                Included
              </span>
              <h3 className="mt-4 font-playfair text-2xl font-medium leading-tight text-ivory sm:text-3xl">
                Digital <span className="font-cormorant italic text-champagne">Completion Certificate</span>
              </h3>
              <p className="mx-auto mt-3 max-w-md font-inter text-sm leading-relaxed text-sand sm:text-base lg:mx-0">
                Every participant receives a digital certificate of completion at the end of the workshop.
              </p>
            </div>
            <CertificatePreview />
          </div>
        </div>
      </section>

      {/* How to register */}
      <section id="registration" className="scroll-mt-24 py-10 md:py-16 bg-ivory">
        <div className="container mx-auto px-4 md:max-w-[90%]">
          <SectionHeading
            eyebrow="How to Register"
            title={
              <>
                Three Steps to <span className="font-cormorant italic text-cocoa">Your Seat</span>
              </>
            }
            className="mb-8 md:mb-10"
          />
          <div className="relative mx-auto max-w-5xl">
            <div aria-hidden="true" className="absolute left-[16.67%] right-[16.67%] top-8 hidden border-t-2 border-dashed border-champagne md:block" />
            <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
              {steps.map((s, i) => (
                <li key={s.title} className="relative text-center">
                  <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-chocolate font-cormorant text-3xl italic text-champagne ring-8 ring-ivory">
                    {i === steps.length - 1 ? <Check className="h-7 w-7" /> : i + 1}
                  </span>
                  <h3 className="mt-5 font-playfair text-2xl font-medium text-chocolate">{s.title}</h3>
                  <p className="mx-auto mt-2 max-w-xs font-inter text-sm leading-relaxed text-ink">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-8 text-center">
            <div className="workshop-registration mx-auto w-full min-w-0 max-w-3xl rounded-2xl border border-sand bg-beige p-4 text-left shadow-soft sm:p-8">
              <p className="eyebrow">Course Registration</p>
              <h2 className="mt-2 font-playfair text-3xl font-medium text-chocolate">Save your seat</h2>
              <p className="mt-2 font-inter text-sm leading-relaxed text-ink">
                The suggested advance is ₹500. You can pay a lower or higher amount. Your registration is confirmed only after your payment is verified and your details are saved. We’ll confirm the remaining balance separately.
              </p>

              {pendingPayment && !processing && <p role="status" className="mt-5 rounded-xl border border-champagne bg-ivory p-4 text-sm text-cocoa">Your previous payment needs confirmation. Continue below to recheck it without making another payment. Payment ID: <span className="break-all font-semibold">{pendingPayment.proof.razorpay_payment_id}</span></p>}

              <form onSubmit={handleRegistrationSubmit} noValidate className="mt-6 space-y-5" aria-busy={processing}>
                <fieldset disabled={processing || Boolean(pendingPayment)} className="min-w-0 space-y-5 disabled:opacity-75">
                <div className="grid min-w-0 gap-5 sm:grid-cols-2 [&>div]:min-w-0">
                  <div>
                    <label id="workshop-course-label" htmlFor="workshop-course" className="mb-2 block font-inter text-xs font-semibold uppercase tracking-[0.2em] text-cocoa">Course *</label>
                    <WorkshopDropdown
                      {...fieldAccessibility('course')}
                      id="workshop-course"
                      name="course"
                      value={registration.course}
                      options={WORKSHOP_COURSES.map(course => ({ value: course, label: course }))}
                      disabled={processing || Boolean(pendingPayment)}
                      onChange={course => { setRegistration(previous => ({ ...previous, course })); setErrors(previous => ({ ...previous, course: undefined })); setFormError(''); }}
                    />
                    {fieldError('course')}
                  </div>
                  <div>
                    <label htmlFor="workshop-name" className="mb-2 block font-inter text-xs font-semibold uppercase tracking-[0.2em] text-cocoa">Your name *</label>
                    <input {...fieldAccessibility('name')} id="workshop-name" name="name" type="text" autoComplete="name" required maxLength={100} value={registration.name} onChange={handleRegistrationChange} className="field" placeholder="Full name" />
                    {fieldError('name')}
                  </div>
                </div>
                <div>
                  <label htmlFor="workshop-email" className="mb-2 block font-inter text-xs font-semibold uppercase tracking-[0.2em] text-cocoa">Email Address *</label>
                  <input {...fieldAccessibility('email')} id="workshop-email" name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} required maxLength={150} value={registration.email} onChange={handleRegistrationChange} className="field" placeholder="you@example.com" />
                  {fieldError('email')}
                </div>
                <div className="grid min-w-0 gap-5 sm:grid-cols-2 [&>div]:min-w-0">
                  <div>
                    <label htmlFor="workshop-phone" className="mb-2 block font-inter text-xs font-semibold uppercase tracking-[0.2em] text-cocoa">WhatsApp number *</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center border-r border-sand pr-3 text-base font-medium text-cocoa">+91</span>
                      <input {...fieldAccessibility('phone')} aria-label="WhatsApp number, India +91" id="workshop-phone" name="phone" type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" autoComplete="tel-national" required maxLength={10} value={registration.phone} onChange={handleRegistrationChange} onPaste={(event) => { event.preventDefault(); setRegistration((previous) => ({ ...previous, phone: normalizePhone(event.clipboardData.getData('text')) })); setErrors((previous) => ({ ...previous, phone: undefined })); }} className="field !pl-20" placeholder="10-digit mobile number" />
                    </div>
                    {fieldError('phone')}
                  </div>
                  <div>
                    <label htmlFor="workshop-city" className="mb-2 block font-inter text-xs font-semibold uppercase tracking-[0.2em] text-cocoa">City</label>
                    <input {...fieldAccessibility('city')} id="workshop-city" name="city" type="text" autoComplete="address-level2" maxLength={100} value={registration.city} onChange={handleRegistrationChange} className="field" placeholder="Your city" />
                    {fieldError('city')}
                  </div>
                </div>
                <div className="grid min-w-0 gap-5 sm:grid-cols-2 [&>div]:min-w-0">
                  <div>
                    <label id="workshop-gender-label" htmlFor="workshop-gender" className="mb-2 block font-inter text-xs font-semibold uppercase tracking-[0.2em] text-cocoa">Gender *</label>
                    <WorkshopDropdown {...fieldAccessibility('gender')} id="workshop-gender" name="gender" value={registration.gender} options={[{ value: '', label: 'Select gender' }, ...['Female', 'Male', 'Prefer not to say'].map(gender => ({ value: gender, label: gender }))]} disabled={processing || Boolean(pendingPayment)} onChange={gender => { setRegistration(previous => ({ ...previous, gender })); setErrors(previous => ({ ...previous, gender: undefined })); setFormError(''); }} />
                    {fieldError('gender')}
                  </div>
                  <div>
                    <label htmlFor="workshop-experience" className="mb-2 block font-inter text-xs font-semibold uppercase tracking-[0.2em] text-cocoa">Current makeup experience *</label>
                    <input {...fieldAccessibility('experience')} id="workshop-experience" name="experience" type="text" required maxLength={150} value={registration.experience} onChange={handleRegistrationChange} className="field" placeholder="Beginner, professional, etc." />
                    {fieldError('experience')}
                  </div>
                </div>
                <div>
                  <label htmlFor="workshop-main-goal" className="mb-2 block font-inter text-xs font-semibold uppercase tracking-[0.2em] text-cocoa">Main goal for joining the course *</label>
                  <textarea {...fieldAccessibility('mainGoal')} id="workshop-main-goal" name="mainGoal" rows={3} required maxLength={500} value={registration.mainGoal} onChange={handleRegistrationChange} className="field resize-y" placeholder="What do you want to learn?" />
                  {fieldError('mainGoal')}
                </div>
                <div>
                  <label htmlFor="workshop-question" className="mb-2 block font-inter text-xs font-semibold uppercase tracking-[0.2em] text-cocoa">Additional comments or suggestions (optional)</label>
                  <textarea {...fieldAccessibility('question')} id="workshop-question" name="question" rows={3} maxLength={1000} value={registration.question} onChange={handleRegistrationChange} className="field resize-y" placeholder="Any additional comments?" />
                  {fieldError('question')}
                </div>
                <div>
                  <label htmlFor="workshop-amount" className="mb-2 block font-inter text-xs font-semibold uppercase tracking-[0.2em] text-cocoa">Payment amount (₹) *</label>
                  <input {...fieldAccessibility('amount')} id="workshop-amount" name="amount" type="number" inputMode="numeric" min="1" step="1" required value={paymentAmount} onChange={(event) => { setPaymentAmount(event.target.value); setErrors(previous => ({ ...previous, amount: undefined })); setFormError(''); }} className="field" />
                  <p className="mt-2 text-sm text-cocoa">₹500 is suggested. You can pay less or more. Enter a whole-rupee amount of at least ₹1.</p>
                  {fieldError('amount')}
                </div>
                </fieldset>
                <div className="flex w-full min-w-0 flex-col items-center gap-3">
                  {formError && <p role="alert" className="w-full rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</p>}
                  <button type="submit" disabled={processing} className="btn-primary w-full !whitespace-normal text-center leading-snug">
                    {processing ? <Loader2 aria-hidden="true" className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none" /> : <LockKeyhole aria-hidden="true" className="h-4 w-4 shrink-0" />}
                    {stage === 'verifying' || stage === 'saving' ? 'Verifying Payment...' : processing ? 'Processing Payment...' : pendingPayment ? 'Verify Existing Payment' : `Pay ${Number(paymentAmount) > 0 && Number.isFinite(Number(paymentAmount)) ? formatPaymentAmount(Number(paymentAmount)) : 'Selected Amount'} & Register`}
                  </button>
                  <p className="flex items-center justify-center gap-1.5 text-center font-inter text-xs leading-relaxed text-cocoa"><LockKeyhole aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />Secure advance payment via Razorpay</p>
                  <p role="status" aria-live="polite" className="text-center text-sm text-cocoa">{statusText[stage]}</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {result && <WorkshopPaymentDialog result={result} detail={resultDetail} course={registration.course} amount={verifiedAmount} pending={Boolean(pendingPayment)} onClose={closeResult} onRetry={() => { void startPayment(); }} />}

      <CtaBanner
        eyebrow="Learn With Me"
        title="New Workshops Are Announced on Instagram First"
        text="Choose a course and send your details to hear about the next session."
      >
        <a href="#registration" className="btn-light">
          <Send className="h-4 w-4" />
          Register for a Course
        </a>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost-light">
          Follow @srinithimakeupartist
        </a>
      </CtaBanner>
    </div>
  );
};

export default Workshops;

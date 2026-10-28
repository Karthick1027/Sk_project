import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import PageHero from '../components/PageHero';

const LAST_UPDATED = '26 October 2026';

interface PolicySection {
  title: string;
  paragraphs?: string[];
  points?: string[];
}

const sections: PolicySection[] = [
  {
    title: 'Who We Are',
    paragraphs: [
      'SK Bridal Studio is a makeup studio and academy based in Thiruninravur, Chennai. This policy explains what information we collect when you visit our website, fill in one of our forms or contact us, and how we use and protect it.',
    ],
  },
  {
    title: 'Information We Collect',
    paragraphs: ['We only collect information that you choose to share with us, such as:'],
    points: [
      'Your name, phone number and email address',
      'Event details such as the date, location, type of look and number of people',
      'Any message, questions or reference photos you send us',
      'Details you enter when registering for our online or offline makeup classes',
    ],
  },
  {
    title: 'How We Collect It',
    points: [
      'Contact form on this website: your details are passed straight to our email and WhatsApp so we can reply. The website itself does not store them.',
      'Enquiry and lead forms on Instagram or Facebook: when you submit one of our forms, Meta shares the details you entered with us.',
      'Class registration through Google Forms.',
      'Phone calls, WhatsApp, email and Instagram direct messages.',
    ],
  },
  {
    title: 'How We Use Your Information',
    points: [
      'To reply to your enquiry and share pricing, packages and availability',
      'To book, confirm and plan your appointment, trial or class',
      'To send reminders and updates about a booking you have made',
      'To occasionally tell you about offers or new workshops, only where you have asked to hear from us',
    ],
    paragraphs: ['We never sell, rent or trade your personal information.'],
  },
  {
    title: 'Sharing Your Information',
    paragraphs: [
      'Your details are seen only by the SK Bridal Studio team. We use trusted services to communicate and run our studio, including Gmail, WhatsApp, Instagram and Facebook (Meta) and Google Forms. These services handle data under their own privacy policies. We may also share information if the law requires us to.',
    ],
  },
  {
    title: 'Photos of Your Look',
    paragraphs: [
      'We love sharing our work, but we will only post photos or videos of you in our gallery or on social media with your permission. You can ask us to remove any image of you at any time.',
    ],
  },
  {
    title: 'Cookies and Third-Party Content',
    paragraphs: [
      'This website does not use advertising or tracking cookies of its own. Some pages include content from other services, such as the embedded Google Map on our Contact page, which may set their own cookies under their own policies.',
    ],
  },
  {
    title: 'How Long We Keep It',
    paragraphs: [
      'We keep your details only as long as we need them to respond to you, deliver your booking or class, and keep basic records. You can ask us to delete them sooner at any time.',
    ],
  },
  {
    title: 'Your Choices',
    points: [
      'Ask to see the personal information we hold about you',
      'Ask us to correct or delete it',
      'Ask us to stop sending you offers or updates',
    ],
    paragraphs: ['To do any of these, just contact us using the details below.'],
  },
  {
    title: 'Changes to This Policy',
    paragraphs: [
      'We may update this policy from time to time. The latest version will always be on this page, with the date it was last updated.',
    ],
  },
];

const PrivacyPolicy: React.FC = () => {
  return (
    <div>
      <PageHero
        eyebrow="Your Privacy"
        title="Privacy Policy"
        subtitle="How SK Bridal Studio collects, uses and protects the information you share with us."
      />

      <section className="py-10 sm:py-14 bg-ivory">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="font-inter text-sm uppercase tracking-[0.25em] text-mocha mb-10">
            Last updated: {LAST_UPDATED}
          </p>

          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="font-playfair text-2xl sm:text-3xl font-medium text-chocolate mb-4">
                  {section.title}
                </h2>
                {section.points && (
                  <ul className="list-disc pl-5 space-y-2 font-inter text-ink leading-relaxed mb-4 marker:text-champagne">
                    {section.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                )}
                {section.paragraphs?.map((text) => (
                  <p key={text} className="font-inter text-ink leading-relaxed mb-4">
                    {text}
                  </p>
                ))}
              </div>
            ))}

            {/* Contact */}
            <div className="card p-6 sm:p-8">
              <h2 className="font-playfair text-2xl sm:text-3xl font-medium text-chocolate mb-5">
                Contact Us
              </h2>
              <p className="font-inter text-ink leading-relaxed mb-5">
                Questions about this policy or your information? Get in touch:
              </p>
              <div className="space-y-4 font-inter text-ink">
                <a href="mailto:skbridalstudioteam@gmail.com" className="flex items-center gap-3 break-all hover:text-cocoa transition-colors">
                  <Mail className="w-4 h-4 shrink-0 text-cocoa" />
                  <span>skbridalstudioteam@gmail.com</span>
                </a>
                <a href="tel:+918668038093" className="flex items-center gap-3 hover:text-cocoa transition-colors">
                  <Phone className="w-4 h-4 shrink-0 text-cocoa" />
                  <span>+91 8668038093</span>
                </a>
                <p className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-1 shrink-0 text-cocoa" />
                  <span>56, 11th Cross street, Prakash nagar, Thiruninravur, Chennai 602024</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;

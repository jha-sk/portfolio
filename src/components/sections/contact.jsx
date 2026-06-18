'use client';

import { useState } from 'react';
import { AlertCircle, Mail, Linkedin, Github, FileDown } from 'lucide-react';
import { ConsolePanel } from '@/components/ui/console-panel';
import { Reveal } from '@/components/motion/reveal';
import { links } from '@/data/links';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values) {
  const errs = {};
  if (!values.name.trim()) errs.name = 'Name is required';
  if (!values.email.trim()) {
    errs.email = 'Email is required';
  } else if (!emailRegex.test(values.email)) {
    errs.email = 'Enter a valid email address';
  }
  if (!values.message.trim()) errs.message = 'Message is required';
  return Object.keys(errs).length > 0 ? errs : null;
}

const CONTACT_LINKS = [
  {
    key: 'email',
    label: 'Mail',
    icon: Mail,
    href: `mailto:${links.email}`,
    target: undefined,
    download: undefined,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: Linkedin,
    href: links.linkedin,
    target: '_blank',
    download: undefined,
  },
  {
    key: 'github',
    label: 'GitHub',
    icon: Github,
    href: links.github,
    target: '_blank',
    download: undefined,
  },
  {
    key: 'resume',
    label: 'Resume',
    icon: FileDown,
    href: links.resume,
    target: '_blank',
    download: true,
  },
];

export function Contact() {
  const [values, setValues] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | submitting | error

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(values);
    if (errs) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus('submitting');

    try {
      // Real delivery via the Resend-backed API route.
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('send failed');
      setSubmitted(true);
      setStatus('idle');
    } catch (_) {
      setStatus('error');
    }
  }

  function handleReset() {
    setValues({ name: '', email: '', message: '' });
    setErrors({});
    setSubmitted(false);
    setStatus('idle');
  }

  const liveMessage = submitted
    ? 'Transmission successful.'
    : status === 'error'
    ? 'Transmission failed. Please try again or email directly.'
    : errors.name || errors.email || errors.message
    ? 'Form has errors. Please review and correct them.'
    : '';

  return (
    <section id="contact" aria-label="Contact">
      <div className="mx-auto w-full max-w-content px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <Reveal>
          <ConsolePanel title="~/transmission" dots={true}>
            {/* Screen reader live region */}
            <div aria-live="polite" className="sr-only">
              {liveMessage}
            </div>

            {submitted ? (
              /* Success terminal output */
              <div className="space-y-4">
                <div className="space-y-1 font-mono text-label">
                  <p className="text-fg3">&gt; establishing uplink...</p>
                  <p className="text-fg text-glow">&gt; packet encoded</p>
                  <p className="text-fg text-glow">&gt; transmission successful</p>
                  <p className="text-fg3">&gt; awaiting response...</p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="font-mono text-label border border-line px-4 py-1.5 rounded-md hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-fg2 transition-shadow duration-200"
                >
                  send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Name field */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="contact-name"
                    className="font-mono text-label text-fg3"
                  >
                    name&gt;
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    value={values.name}
                    onChange={handleChange}
                    placeholder="your name"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'error-name' : undefined}
                    className="bg-transparent border border-line rounded-md px-3 py-2 font-mono text-fg placeholder:text-fg3 focus:outline-none focus:ring-2 focus:ring-ring w-full"
                  />
                  {errors.name && (
                    <div
                      id="error-name"
                      role="alert"
                      className="flex items-center gap-1.5 font-mono text-label text-fg2"
                    >
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                      {errors.name}
                    </div>
                  )}
                </div>

                {/* Email field */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="contact-email"
                    className="font-mono text-label text-fg3"
                  >
                    email&gt;
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'error-email' : undefined}
                    className="bg-transparent border border-line rounded-md px-3 py-2 font-mono text-fg placeholder:text-fg3 focus:outline-none focus:ring-2 focus:ring-ring w-full"
                  />
                  {errors.email && (
                    <div
                      id="error-email"
                      role="alert"
                      className="flex items-center gap-1.5 font-mono text-label text-fg2"
                    >
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                      {errors.email}
                    </div>
                  )}
                </div>

                {/* Message field */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="contact-message"
                    className="font-mono text-label text-fg3"
                  >
                    message&gt;
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    value={values.message}
                    onChange={handleChange}
                    placeholder="your message"
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'error-message' : undefined}
                    className="bg-transparent border border-line rounded-md px-3 py-2 font-mono text-fg placeholder:text-fg3 focus:outline-none focus:ring-2 focus:ring-ring w-full resize-none"
                  />
                  {errors.message && (
                    <div
                      id="error-message"
                      role="alert"
                      className="flex items-center gap-1.5 font-mono text-label text-fg2"
                    >
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                      {errors.message}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="font-mono text-label border border-line-strong px-6 py-2.5 rounded-md hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-fg transition-shadow duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? 'TRANSMITTING…' : 'INITIATE TRANSMISSION'}
                </button>

                {status === 'error' && (
                  <div
                    role="alert"
                    className="flex items-center gap-1.5 font-mono text-label text-fg2"
                  >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                    Transmission failed — try again, or email{' '}
                    <a href={`mailto:${links.email}`} className="underline hover:text-fg">
                      {links.email}
                    </a>
                  </div>
                )}
              </form>
            )}

            {/* Links row */}
            <div className="flex flex-wrap gap-4 mt-6">
              {CONTACT_LINKS.map(({ key, label, icon: Icon, href, target, download }) => (
                <a
                  key={key}
                  href={href}
                  target={target}
                  rel={target === '_blank' ? 'noreferrer' : undefined}
                  download={download || undefined}
                  className="flex items-center gap-2 font-mono text-label text-fg2 hover:text-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {label}
                </a>
              ))}
            </div>
          </ConsolePanel>
        </Reveal>
      </div>
    </section>
  );
}

export default Contact;

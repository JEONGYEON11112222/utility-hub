export type Faq = { question: string; answer: string };

/** Server-rendered FAQ list shared by the tool pages. */
export function FaqSection({ faqs, className }: { faqs: Faq[]; className?: string }) {
  return (
    <section aria-labelledby="faq-heading" className={className}>
      <h2 id="faq-heading" className="text-xl font-semibold tracking-tight text-foreground">
        Frequently asked questions
      </h2>
      <div className="mt-4 divide-y divide-border border-y border-border">
        {faqs.map((faq) => (
          <div key={faq.question} className="py-5">
            <h3 className="font-semibold text-foreground">{faq.question}</h3>
            <p className="mt-2 leading-7 text-muted">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

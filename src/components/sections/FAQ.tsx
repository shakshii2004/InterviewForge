import { Accordion } from '../ui/Accordion';

const faqs = [
  {
    q: "How realistic are the AI interviews?",
    a: "Our AI is fine-tuned on thousands of actual technical and behavioral interviews from top-tier tech companies. It dynamically adjusts to your answers, asks follow-up questions, and challenges your assumptions just like a real engineering manager would."
  },
  {
    q: "Can the AI really grade my code?",
    a: "Yes. Our integrated browser IDE not only checks for functional correctness using test cases, but the AI also analyzes your time and space complexity, variable naming, and overall code quality to provide comprehensive feedback."
  },
  {
    q: "Do I need to install anything?",
    a: "No installation is required. InterviewForge runs entirely in your browser, including the live coding environment and voice synthesis features."
  },
  {
    q: "How does the resume-aware feature work?",
    a: "When you upload your resume (PDF or text), our engine extracts your past experiences, skills, and projects. It then formulates specific behavioral and technical questions that probe into those exact experiences."
  },
  {
    q: "Is there a free trial available?",
    a: "Absolutely. We offer a generous free tier that includes 3 full-length AI interviews per month, so you can experience the platform before committing to a premium plan."
  }
];

export const FAQ = () => {
  return (
    <section className="py-32 bg-background" id="faq">
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Frequently asked questions.
          </h2>
          <p className="text-lg text-text-secondary">
            Everything you need to know about the platform and how it works.
          </p>
        </div>
        
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <Accordion key={index} title={faq.q} isOpen={index === 0}>
              {faq.a}
            </Accordion>
          ))}
        </div>
      </div>
    </section>
  );
};

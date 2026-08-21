import React from 'react';
import Accordion from '../../components/common/Accordion';
import { HelpCircle, ChevronRight } from 'lucide-react';

export default function Faq() {
  const faqList = [
    {
      q: "How does the AI Welfare Copilot check my eligibility?",
      a: "The portal maps your demographic traits (age, annual income, caste, state of origin, education, disability, and current occupation) directly against the active eligibility criteria rules stored in our database. Since this is the frontend demonstration phase, the matching logic executes locally in your browser sandbox."
    },
    {
      q: "How do I update my profile details?",
      a: "Navigate to the citizen portal dashboard, click 'My Profile' or 'Edit Profile', adjust the field values (like adding a disability percentage or changing your occupation to 'Farmer'), and click save. The system will automatically run eligibility re-calculations against the revised inputs."
    },
    {
      q: "Are the schemes listed on the portal updated regularly?",
      a: "Yes. In the production architecture, a synchronization provider service checks government open APIs daily to capture changed application deadlines, revised income thresholds, and new scheme announcements. In this mockup phase, we demonstrate logs auditing sync runs in the Admin dashboard."
    },
    {
      q: "Can I apply directly on this website?",
      a: "No. Applications are submitted via secure state and central portals. This platform acts as an eligibility copilot, providing you with step-by-step guidance, checklists of required documents, and direct links to the official portals."
    },
    {
      q: "What is the difference between Fully Eligible and Partially Eligible schemes?",
      a: "Fully Eligible means your profile meets all numerical and categorical constraints. Partially Eligible indicates your profile satisfies primary filters (like age and income) but the scheme requires specific certificates, declaration formats, or specific educations that require secondary upload validations."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans text-left">
      
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-gov-dark tracking-tight flex items-center justify-center md:justify-start space-x-2">
          <HelpCircle size={28} className="text-gov-purple" />
          <span>Frequently Asked Questions</span>
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          Everything you need to know about the AI Welfare Copilot system operations.
        </p>
      </div>

      {/* Accordions */}
      <div className="space-y-4 max-w-3xl">
        {faqList.map((faq, idx) => (
          <Accordion key={idx} title={faq.q} defaultOpen={idx === 0}>
            <p className="text-slate-500 text-xs leading-relaxed">{faq.a}</p>
          </Accordion>
        ))}
      </div>
      
    </div>
  );
}

import { ChevronDown } from "lucide-react";

const questions = [
  {
    title: "What does the token represent?",
    answer: "Economic exposure can differ from ownership. A stock-linked token may track a company's market value without giving you shareholder voting rights. Read the product's terms to understand what you hold.",
  },
  {
    title: "Who issues and backs it?",
    answer: "Each product has its own issuer, asset structure and custody arrangements. Check the issuer's reserve information and documents. An asset appearing here is not an endorsement or a GROUND partnership.",
  },
  {
    title: "How can you enter and exit?",
    answer: "Transferability, secondary trading and issuer redemption are different things. Eligibility checks, regional limits, market hours and fees can apply. GROUND has not connected trading or redemption services in this preview.",
  },
];

export function RightsAccordion() {
  return (
    <div className="rights-accordion">
      {questions.map((question, index) => (
        <details key={question.title} open={index === 0}>
          <summary><span>{question.title}</span><ChevronDown size={19} aria-hidden="true" /></summary>
          <p>{question.answer}</p>
        </details>
      ))}
    </div>
  );
}

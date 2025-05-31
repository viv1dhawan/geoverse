"use client";

import { useState } from "react";
import SectionTitle from "../Common/SectionTitle";

const faqData = [
  {
    question: "What is Geoverse?",
    answer: "Geoverse is a web application designed for geophysical services. It provides a comprehensive platform with resources and tools for various geophysical methods.",
  },
  {
    question: "What services does Geoverse offer?",
    answer: "Geoverse offers access to a range of geophysical methods, including gravity, resistivity, seismological, seismic, GPR, and remote sensing. It also provides resources for interpreting and analyzing geophysical data.",
  },
  {
    question: "How can Geoverse benefit my projects?",
    answer: "Geoverse streamlines geophysical data analysis and interpretation, enhances access to diverse geophysical methods, and supports effective decision-making for exploration and assessment projects.",
  },
  {
    question: "Do I need special training for Geoverse?",
    answer: "While Geoverse is user-friendly, having a basic understanding of geophysical methods can enhance your experience. The platform offers resources to help users get acquainted with its features.",
  },
  {
    question: "Is Geoverse free to use?",
    answer: "Yes, Geoverse offers free tools, but some premium features require a subscription.",
  },
  {
    question: "Is there customer support available?",
    answer: "Yes, Geoverse provides customer support to assist with any questions or issues you may encounter. Contact details are available on the website.",
  },
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto">
        <SectionTitle
          title="Frequently Asked Questions"
          paragraph="Find answers to commonly asked questions about Geoverse."
          center
        />
        <div className="max-w-2xl mx-auto">
          {faqData.map((item, index) => (
            <div key={index} className="border-b border-gray-300 dark:border-gray-600 py-4">
              <button
                className="w-full text-left font-semibold text-lg flex justify-between items-center text-black dark:text-white"
                onClick={() => toggleFaq(index)}
              >
                {item.question}
                <span>{openIndex === index ? "−" : "+"}</span>
              </button>
              {openIndex === index && (
                <p className="mt-2 text-gray-700 dark:text-gray-300">{item.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;

"use client";

import { useEffect, useRef, useState } from "react";
import BenchmarkResults from "../components/benchmark-results";
import BenchmarkCorrections from "../components/benchmark-correction-count";
import BenchmarkCountIssueTypes from "../components/benchmark-count-issue-types";
import BenchmarkResponseTime from "../components/benchmark-responsetime";
import BenchmarkFastestSlowest from "../components/benchmark-fastest-slowest-responsetime";
import BenchmarkResponseTimeTrueFalse from "../components/benchmark-true-false-responsetime";
import BenchmarkPricingTable from "../components/benchmark-pricing-table";
import TotalBenchmarkStats from "../components/benchmark-total-stats";
import Navigation from "../components/navigation";
import { motion } from "framer-motion";

export default function Benchmark() {
  const sections = {
    "Stats": useRef(null),
    "Correctness": useRef(null),
    "Error Types": useRef(null),
    "Response Times": useRef(null),
    "Pricing": useRef(null),
    "Conclusion": useRef(null),
  };

  const scrollToSection = (key) => {
    const element = sections[key]?.current;
    if (element) {
      const yOffset = -70;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
  
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const [pageVisible, setPageVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <><Navigation /><div className={` mx-auto flex flex-col items-center bg-white p-6 transition-all pt-24 duration-700 ${pageVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>

          <div className="max-w-3xl">
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {Object.keys(sections).map((key) => (
                      <button
                          key={key}
                          onClick={() => scrollToSection(key)}
                          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md shadow-sm border border-gray-300 transition"
                      >
                          {key}
                      </button>
                  ))}
              </div>

              <motion.div
                  ref={sections["Stats"]}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ type: "spring", stiffness: 70, damping: 15 }}
              >
                  <h1 className="text-4xl font-bold mb-8 text-center">Benchmark Overview</h1>
                  <TotalBenchmarkStats />
              </motion.div>


              <motion.div
                  ref={sections["Correctness"]}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 70, damping: 15 }}
                  className="mt-24"
              >
                  <h2 className="text-3xl font-semibold mb-6 text-center">Correctness Evaluation</h2>
                  <p className="mb-4">
                      Disclaimer: The goal of this benchmark is not to determine which LLM performs best at generating PostGIS queries, but rather to assess whether LLMs are capable at all of producing correct PostGIS SQL queries.
                  </p>
                  <p className="mb-4">
                      The models used vary significantly in performance and release date. This was not intentional, but a major limiting factor was the input token size. The average benchmark case size at the time of benchmarking was around 22,400 tokens, including the syntax feedback loop. Many newer, more powerful models and older models could not be included because they could not handle such large inputs.
                  </p>
                  <p className="mb-4">
                      First shown are the results of the automated correctness evaluation. Each LLM response is run against the database and is compared to the expected SQL result. If you click on any benchmark case, you can inspect the exact prompt, example SQL query, and each LLM's individual response.
                  </p>
                  <BenchmarkResults correction={'is_correct'} />
                  <p className="mb-4">
                      Some responses flagged as wrong might actually be correct (false negatives). Therefore, every failed response was manually checked and categorized. The ones found out to be correct also got categorized as shown later.
                  </p>
                  <BenchmarkResults correction={'human_correction'} />
                  <p className="mb-4">
                      Overall, 19 responses were corrected to true positives after manual review. Two benchmark cases (case 4 and case 19) received no correct responses from any model.
                  </p>
                  <BenchmarkCorrections />
              </motion.div>

              <motion.div
                  ref={sections["Error Types"]}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 70, damping: 15 }}
                  className="mt-24"
              >
                  <h2 className="text-3xl font-semibold mb-6 text-center">Error Type Analysis</h2>
                  <p className="mb-4">
                      First, we categorize errors where the LLM's answer was initially marked wrong but accepted after manual review. These errors fall into one of three allowed categories:
                      <strong> Structural Simplicity</strong> (LLM's response had the same structure and had thought of more Tags to add than the example SQL),
                      <strong> Performance Issue</strong> (correct, due to a timeout on the databases end, which is 60 seconds for Supabase. This is not considered a problem, because in the real world you could add more CPU to decrease the response time),
                      or <strong> Encoding Artifact</strong> (minor encoding issues without logical impact).
                  </p>
                  <BenchmarkCountIssueTypes correction={true} />
                  <p className="mb-4">
                      If the result remained wrong even after review, it was classified into one of four error categories:
                      <strong> Spatial Context Misuse</strong> (wrong geographic understanding),
                      <strong> Tag Loss</strong> (missing important filter conditions),
                      <strong> Syntax</strong> (invalid SQL syntax),
                      or <strong> Wrong Tags</strong> (incorrect tags used for filtering).
                  </p>
                  <BenchmarkCountIssueTypes correction={false} />
              </motion.div>

              <motion.div
                  ref={sections["Response Times"]}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 70, damping: 15 }}
                  className="mt-24"
              >
                  <h2 className="text-3xl font-semibold mb-6 text-center">Response Time Analysis</h2>
                  <p className="mb-4">
                      Each LLM has a different average response time. Several factors influence this, including the location of the server (relative to Zürich), the complexity of the request, the length of the generated answer, the time it takes to execute the SQL query and how often the LLM triggered the syntax feedback loop (receiving syntax error messages or empty response from the database and retrying, up to five attempts).
                  </p>
                  <BenchmarkResponseTime />
                  <p className="mb-4">
                      Response times varied widely, from as low as 4 seconds (Gemini) to over 3.5 minutes (Deepseek).
                  </p>
                  <BenchmarkFastestSlowest />
                  <p className="mb-4">
                      There was also a slight variance between response times for correct vs. incorrect answers, reflecting that simpler cases tend to be faster and less prone to syntax issues.
                  </p>
                  <BenchmarkResponseTimeTrueFalse />
              </motion.div>

              <motion.div
                  ref={sections["Pricing"]}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 70, damping: 15 }}
                  className="mt-24"
              >
                  <h2 className="text-3xl font-semibold mb-6 text-center">Pricing Evaluation</h2>
                  <p className="mb-4">
                      The cost models for the LLMs varied significantly. Some models require topping up prepaid balances (e.g., OpenAI, Claude), while others (like Gemini) offer a pay-as-you-go structure.
                      For Deepseek, token usage was explicitly tracked (about 560,000 tokens). While token consumption differs slightly between models, the initial request size was the same; variations mainly stem from syntax feedback loop retries.
                  </p>
                  <BenchmarkPricingTable />
              </motion.div>

              <motion.div
                  ref={sections["Conclusion"]}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 70, damping: 15 }}
                  className="mt-24"
              >
                  <h2 className="text-3xl font-semibold mb-6 text-center">Conclusion</h2>
                  <p className="mb-4">
                      All LLM's were able to produce PostGIS SQL queries that were syntactically correct and could be executed on the database. However, the correctness and creativity of the results varied significantly. Grok is a prime example what the future of LLM's will look like in regards to writing SQL queries that contain the PostGIS extention. All LLM's had previous knowledge on the OSM database and the PostGIS extension through giving example queries, it was able to produce mostly correct responses.
                  </p>
              </motion.div>
          </div>


      </div></>
    
      
  );
}

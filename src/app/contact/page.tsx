"use client";

import { useState } from "react";

const interests = [
  { value: "pilot", label: "Pilot" },
  { value: "research", label: "Research interview" },
  { value: "updates", label: "Updates" },
];

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          organization: formData.get("organization"),
          email: formData.get("email"),
          interest: formData.get("interest"),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      setStatus("success");
      setMessage("Thanks! We will reach out soon.");
      form.reset();
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Something went wrong. Please try again later.");
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
          Contact SecureLearning
        </h1>
        <p className="text-lg text-slate-600">
          Join the pilot, collaborate on research, or stay informed about new
          updates.
        </p>
      </header>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Name</span>
            <input
              name="name"
              required
              className="rounded-lg border border-slate-300 px-4 py-2 text-base text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="Your name"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Org / Dept</span>
            <input
              name="organization"
              required
              className="rounded-lg border border-slate-300 px-4 py-2 text-base text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="University IT, Security Office, ..."
            />
          </label>
        </div>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-700">Email</span>
          <input
            name="email"
            type="email"
            required
            className="rounded-lg border border-slate-300 px-4 py-2 text-base text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="you@example.edu"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-700">Interest</span>
          <select
            name="interest"
            required
            defaultValue=""
            className="rounded-lg border border-slate-300 px-4 py-2 text-base text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option value="" disabled>
              Select an option
            </option>
            {interests.map((interest) => (
              <option key={interest.value} value={interest.value}>
                {interest.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center rounded-full bg-sky-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:cursor-not-allowed disabled:bg-sky-400"
        >
          {status === "loading" ? "Submitting..." : "Submit"}
        </button>
        {message && (
          <p
            className={`text-sm ${
              status === "success" ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}




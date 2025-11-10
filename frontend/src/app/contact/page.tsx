// app/contact/page.tsx
import React from 'react';

export default function ContactPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6 text-center">Contact Us</h1>

      <p className="text-lg mb-4 text-center">
        Have a question, feedback, or need support? We would love to hear from you.
      </p>

      <div className="bg-gray-100 rounded-xl p-6 space-y-4 text-center">
        <div>
          <h2 className="text-xl font-semibold">Email</h2>
          <a href="mailto:team@agentstop.ai" className="text-blue-600 hover:underline">
            team@agentstop.ai
          </a>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Phone</h2>
          <p className="text-gray-800">+91-9084249327</p>
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-10 text-center">
        © {new Date().getFullYear()} Amikee Tech Private Ltd. All rights reserved.
      </p>
    </main>
  );
}

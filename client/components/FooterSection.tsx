import React, { useState } from 'react';
import { ChevronDown, Mail } from 'lucide-react';

const FooterSection = () => {
  const [email, setEmail] = useState('');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const handleNewsletterSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: "Who can create events on Suilens?",
      answer: "Anyone can create events on Suilens. Whether you're an individual organizer, community leader, or organization, you can easily set up and manage events on our platform."
    },
    {
      question: "What are the pricing details for Suilens?",
      answer: "Suilens offers flexible pricing plans to suit different needs. Basic event creation is free, with premium features available through our subscription plans."
    },
    {
      question: "Are there any commercial collaborations at SuiLens you are part of during your events?",
      answer: "SuiLens partners with various organizations in the Sui ecosystem to enhance event experiences and provide additional value to our community."
    },
    {
      question: "Who can't sign up to create an event?",
      answer: "Our platform is open to all legitimate event organizers. We only restrict accounts that violate our terms of service or engage in fraudulent activities."
    },
    {
      question: "What are the existing benefits we grant?",
      answer: "We offer POAP NFT integration, community management tools, bounty tracking, grant management, and seamless event promotion within the Sui ecosystem."
    },
    {
      question: "What are community benefits we grant?",
      answer: "Community members enjoy exclusive access to events, networking opportunities, educational resources, and potential rewards through our POAP system."
    }
  ];

  return (
    <>
      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-900 mb-4">
                FAQs
              </h2>
              <p className="text-2xl text-[#747474]">
                Got questions about Suilens? We have put together answers to the ones we <br /> hear most.
              </p>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 text-left bg-blue-50 hover:bg-blue-100 transition-colors flex justify-between items-center"
                  >
                    <span className="font-medium text-gray-900 text-sm sm:text-base">
                      {faq.question}
                    </span>
                    <ChevronDown 
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        openFAQ === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFAQ === index && (
                    <div className="px-6 py-4 bg-white border-t border-gray-100">
                      <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-medium text-gray-900 mb-4">
              Subscribe to our Newsletter
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl font-normal text-gray-600 mb-8">
              Get the latest community events, activities, and exclusive news delivered straight to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-[#4DA2FF] hover:bg-blue-500 transition-colors text-white px-6 py-3 rounded-lg font-medium"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 flex justify-center items-center">
        <div className="w-full flex justify-center items-center">
          <div className="bg-[#101928] rounded-3xl shadow-2xl flex flex-col justify-center items-center text-center px-8 py-20 w-3/4" style={{ minWidth: '350px', maxWidth: '1200px', minHeight: '350px', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}>
            <h2 className="text-5xl sm:text-4xl font-semibold text-white mb-8">
              Where Sui's Community <br /> Comes Together
            </h2>
            <button className="bg-[#4DA2FF] hover:bg-blue-500 transition-colors text-white px-8 py-3 rounded-lg font-medium" onClick={() => window.open('/discover')}>
              Start Exploring
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            {/* Left side - Logo and Links */}
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                    <img
                      src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png"
                      alt="Suilens Logo"
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    Suilens
                  </span>
                </div>
              </div>

              {/* Links */}
              <div className="flex space-x-6 font-medium text-sm text-gray-600">
                <a href="/" className="hover:text-gray-900">
                  Privacy Policy
                </a>
                <a href="/" className="hover:text-gray-900">
                  Terms of Use
                </a>
              </div>
            </div>

            {/* Right side - Copyright */}
            <p className="text-sm font-medium text-gray-600">
              © 2025. SuiLens. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default FooterSection;
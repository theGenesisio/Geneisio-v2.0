import { DocumentIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import { Accordion, AccordionBody, AccordionHeader, Card } from "@material-tailwind/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { supportIcon } from "../../assets/icons";
import { staggerFadeIn2 } from "../../assets/gsap";
const FAQs = () => {
  staggerFadeIn2(".gsapFAQs");
  const [open, setOpen] = useState(null);

  const handleOpen = (index) => {
    setOpen(open === index ? null : index);
  };
  const faqs = [
    {
      question: "Do you offer a sign-up bonus?",
      answer: "Yes, a $5 startup bonus is credited to your account immediately upon registration.",
    },
    {
      question: "Can I upgrade my investment plan?",
      answer: "Certainly. You can upgrade your plan at the end of any 24-hour trading cycle.",
    },
    {
      question: "How does the referral program work?",
      answer: "You will earn a $5 bonus for every new user who registers and funds their account using your unique referral link.",
    },
    {
      question: "Can I withdraw my initial deposit?",
      answer: "Yes, your initial deposit is available for withdrawal once the current trading cycle is completed.",
    },
    {
      question: "What are the deposit requirements?",
      answer: "The minimum deposit is $500, with a maximum limit ranging from $500,000 to $1,500,000 depending on the account type.",
    },
    {
      question: "How are my funds secured and returns guaranteed?",
      answer: "We utilize advanced trading algorithms to manage deposits securely, ensuring consistent returns at the conclusion of each trading period.",
    },
    {
      question: "What is the procedure for withdrawing profits?",
      answer: "Profits can be withdrawn once they have matured, following the specific schedule outlined in your chosen investment package.",
    },
  ];

  const features = [
    {
      icon: <QuestionMarkCircleIcon className="w-7 h-7" />,
      title: "Help Center",
      description: "Access comprehensive answers and insights regarding our platform's operations.",
    },
    {
      icon: <DocumentIcon className="w-7 h-7" />,
      title: "User Guides",
      description: "Step-by-step instructions to help you navigate the platform and maximize your experience.",
    },
    {
      icon: <span className="w-7 h-7">{supportIcon}</span>,
      title: "24/7 Support",
      description: "Our dedicated support team is available around the clock to assist with any inquiries.",
    },
  ];

  return (
    <section className='py-16 bg-primary-default' id='FAQs'>
      <div className='container mx-auto px-4'>
        {/* Section Header */}
        <div className='text-center mb-12 gsapFAQs'>
          <h4 className='text-2xl font-semibold mb-4'>Get the Support You Deserve!</h4>
          <p className='text-text-light max-w-2xl mx-auto'>
            Our dedicated support team is committed to providing timely assistance and ensuring you have a seamless experience on our platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
          {features.map((feature, index) => (
            <Card
              key={index}
              variant='gradient'
              color='gray'
              className='p-6 text-center shadow-md gsapFAQs'>
              <div className='flex flex-row justify-center gap-4'>
                <div className='text-text-light mb-4 text-4xl'>{feature.icon}</div>
                <h5 className='text-lg font-medium text-text-light'>{feature.title}</h5>
              </div>
              <p className='text-text-light mt-3'>{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQs Section */}
      <div className='container mx-auto px-4 mt-16 gsapFAQs'>
        <div className='text-center mb-12'>
          <h4 className='text-2xl font-semibold mb-4'>Frequently Asked Questions</h4>
          <p className='text-text-light max-w-2xl mx-auto'>
            Please review the information below to ensure a thorough understanding.
          </p>
        </div>

        {/* Accordion */}
        <div className='w-full'>
          <div className='space-y-4'>
            {faqs.map((faq, index) => (
              <Accordion key={index} open={open === index} className='border-0 rounded-lg gsapFAQs'>
                <AccordionHeader onClick={() => handleOpen(index)} className='p-4 bg-accent'>
                  <h6 className='text-lg font-medium text-white'>{faq.question}</h6>
                </AccordionHeader>
                <AccordionBody className='p-4 text-text-light'>{faq.answer}</AccordionBody>
              </Accordion>
            ))}
          </div>
        </div>
      </div>

      {/* Sign-Up Section */}
      <section className='py-12 bg-primary-default gsapFAQs'>
        <div className='container mx-auto px-4'>
          <div className='p-8 bg-accent text-white rounded-lg'>
            <div className='flex flex-wrap items-center'>
              <div className='w-full md:w-8/12 mb-8 md:mb-0'>
                <h4 className='text-2xl font-bold mb-4'>A Smarter Way to Invest and Trade</h4>
                <p className='text-white/90'>
                  Join over 1.3 million users who have successfully reached their financial goals
                  using our streamlined and secure platform.
                </p>
              </div>
              <div className='w-full md:w-4/12 text-center md:text-right'>
                <Link
                  to='./auth/register'
                  className='bg-white text-accent font-medium px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition'>
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default FAQs;

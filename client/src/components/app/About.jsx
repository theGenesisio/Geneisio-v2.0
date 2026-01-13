import { ArrowTrendingUpIcon, BanknotesIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import { AboutIllustration } from "../../assets/utilities";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: UserPlusIcon,
    title: "Register Your Account",
    description: "Quickly sign up with your email to access our comprehensive investment tools.",
  },
  {
    icon: BanknotesIcon,
    title: "Securely Deposit Funds",
    description: "Fund your wallet using our diverse range of secure payment gateways.",
  },
  {
    icon: ArrowTrendingUpIcon,
    title: "Maximize Your Returns",
    description: "Start trading in global markets and grow your wealth with ease.",
  },
];

const About = () => {
  return (
    <div>
      {/* About Us Section */}
      <section className='py-12'>
        <div className='container mx-auto px-4'>
          <div className='flex flex-wrap items-center'>
            {/* Image Section */}
            <div className='w-full md:w-5/12 px-4 mb-8 md:mb-0'>
              <div className='relative'>
                <img
                  src={AboutIllustration}
                  alt='About Us'
                  className='mx-auto rounded-lg shadow-lg'
                />
              </div>
            </div>

            {/* Text Content Section */}
            <div className='w-full md:w-7/12 px-4'>
              <div className='ml-0 md:ml-8'>
                <h4 className='text-2xl font-bold mb-4'>About Us</h4>
                <p className='text-gray-600 leading-relaxed'>
                  Our platform delivers innovative tools designed to simplify wealth creation and
                  management. Whether you are a hedge fund manager, mutual fund professional, or a
                  trader in Forex, stocks, and cryptocurrencies, we provide the infrastructure to
                  streamline your operations. With our secure, mobile-optimized interface, you can
                  launch your own investment or pool trading platform in just minutes.
                </p>
                <Link to='./auth/login' className='accent-btn inline-block mt-8 transition'>
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className='py-12 bg-primary-default'>
        <div className='container mx-auto px-4'>
          <h4 className='text-2xl font-bold text-center mb-12'>Find out how to get started.</h4>
          <div className='flex flex-wrap -mx-4'>
            {steps.map((step, index) => (
              <div key={index} className='w-full md:w-4/12 px-4 mb-8'>
                <div className='text-center p-6 bg-white shadow rounded-lg'>
                  <div className='text-accent mb-4 flex flex-row gap-4 justify-center text-center'>
                    <step.icon className='w-7 h-7' />
                    <h5 className='text-lg font-bold'>{step.title}</h5>
                  </div>
                  <p className='text-gray-600'>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sign-Up Section */}
      <section className='py-12 bg-primary-default'>
        <div className='container mx-auto px-4'>
          <div className='p-8 bg-accent text-white rounded-lg'>
            <div className='flex flex-wrap items-center'>
              <div className='w-full md:w-8/12 mb-8 md:mb-0'>
                <h4 className='text-2xl font-bold mb-4'>A Smarter Way to Trade and Invest</h4>
                <p className='text-lg'>
                  Join over 2 million users who have transformed their financial future by
                  leveraging our intuitive trading and investment tools.
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
    </div>
  );
};

export default About;

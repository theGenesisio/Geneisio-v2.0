import { Card, CardBody, Typography } from "@material-tailwind/react";
import { PhoneIllustration } from "../../../assets/utilities";
import {
  ArrowTrendingUpIcon,
  BoltIcon,
  CreditCardIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid";
import { supportIcon } from "../../../assets/icons";
import { fadeIn, staggerFadeIn2 } from "../../../assets/gsap";

const features = [
  {
    icon: <ArrowTrendingUpIcon className='w-5 h-5' />,
    title: "Versatile Trading Platforms",
    description:
      "Choose from a suite of platforms designed to accommodate various trading strategies and levels of expertise.",
  },
  {
    icon: <CreditCardIcon className='w-5 h-5' />,
    title: "Competitive Leverage",
    description:
      "Maximize your market exposure with flexible leverage options and some of the tightest spreads available.",
  },
  {
    icon: <BoltIcon className='w-5 h-5' />,
    title: "Ultra-Fast Execution",
    description:
      "Minimize slippage and capitalize on market movements with our high-performance execution engine.",
  },
  {
    icon: <ShieldCheckIcon className='w-5 h-5' />,
    title: "Ironclad Security",
    description:
      "Your account's safety is our priority, backed by sophisticated encryption and continuous security monitoring.",
  },
  {
    icon: <span className='w-5 h-5 scale-125'>{supportIcon}</span>,
    title: "Expert Support 24/7",
    description:
      "Access professional assistance and market insights from our dedicated support team at any hour.",
  },
];

const ServicesSection = () => {
  staggerFadeIn2(".gsapServices");
  fadeIn(".gsapService");
  return (
    <section className='overflow-hidden bg-primary-default min-h-screen'>
      <div className='container mx-auto px-4 py-20'>
        <div className='text-center mb-8 gsapService'>
          <Typography variant='h4' className='mb-4 text-text-light'>
            Explore Our Services
          </Typography>
          <Typography variant='paragraph' className='text-text-light max-w-xl mx-auto'>
            Our mission is to ensure you have a seamless and rewarding trading experience!
          </Typography>
        </div>

        <div className='flex flex-wrap justify-center items-center'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-3xl'>
            {features.map((feature, index) => (
              <Card
                key={index}
                className='p-4 shadow-md gsapServices bg-primary-dark'>
                <CardBody className='flex items-start'>
                  <div className='flex-shrink-0 mr-4'>
                    <div className='w-12 h-12 flex items-center justify-center bg-accent rounded-full text-text-light'>
                      {feature.icon}
                    </div>
                  </div>
                  <div>
                    <Typography variant='h6' className='mb-2 text-text-light'>
                      {feature.title}
                    </Typography>
                    <Typography variant='paragraph' className='text-text-light'>
                      {feature.description}
                    </Typography>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
          <div className='mt-8 lg:mt-0 lg:ml-8 gsapServices'>
            <img src={PhoneIllustration} alt='Phone App' className='max-w-xs lg:max-w-md mx-auto' />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

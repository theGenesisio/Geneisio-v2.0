import { LaptopIllustration } from "../../assets/utilities";
import { Link } from "react-router-dom";
import EURTicker from "./subComponents/Tradeview/EURTicker";
import BTCUSDTicker from "./subComponents/Tradeview/BTCUSDTicker";
import ETHUSDTicker from "./subComponents/Tradeview/ETHUSDTicker";
import { fadeIn, slideIn } from "../../assets/gsap";
const MobileTradingSection = () => {
  slideIn(".gsapAlwaysLaptop");
  slideIn(".gsapAlways", { x: 200 });
  fadeIn(".gsapTicker");
  return (
    <section className='bg-inherit lg:px-20 px-4 text-center md:text-start'>
      {/* Ticker Container */}
      <div className='flex flex-col lg:flex-row justify-between mt-5 gsapTicker'>
        <EURTicker className='block' /> {/* Always visible */}
        <BTCUSDTicker className='hidden md:block' /> {/* Hidden on mobile */}
        <ETHUSDTicker className='hidden md:block' /> {/* Hidden on mobile */}
      </div>

      {/* Content Section */}
      <div className='container my-16 md:my-20'>
        <div className='flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-20'>
          {/* Image Section */}
          <div className='w-full md:w-1/2'>
            <img
              src={LaptopIllustration}
              className='w-full h-auto gsapAlwaysLaptop'
              alt='Laptop showing trading platform'
            />
          </div>

          {/* Text Content */}
          <div className='w-full mt-6 md:mt-0 md:w-1/2'>
            <div className='ml-0 md:ml-5 gsapAlways'>
              <h4 className='mb-4 text-lg font-semibold'>
                Seamless Trading, Anywhere You Go
              </h4>
              <p className='text-muted gsapAlways'>
                Stay connected to the markets with our custom-built mobile platform, 
                designed for speed and reliability on every device.
              </p>
              <Link to='./about' className='accent-btn inline-block mt-8 !px-4'>
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileTradingSection;

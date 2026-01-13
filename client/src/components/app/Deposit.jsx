import { useEffect, useState } from "react";
import FetchWithAuth from "../auth/api";
import { useNotification } from "../layout/NotificationHelper";
import Loader from "./subComponents/Loader";
import { BuildingLibraryIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import {
  btcIcon,
  cashasppIcon,
  dogecoinIcon,
  ethIcon,
  ltcIcon,
  paypalIcon,
  usdtIcon,
} from "../../assets/icons";
import DepositModal from "./subComponents/DepositOptionModal";
const Deposit = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [depositOptions, setDepositOptions] = useState([]);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const { addNotification } = useNotification();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen((cur) => !cur);
  useEffect(() => {
    const fetchDepositOptions = async () => {
      try {
        setIsLoading(true);
        const response = await FetchWithAuth(
          "/deposit",
          { method: "GET", credentials: "include" },
          "Failed to fetch deposit options"
        );

        if (response.failed) {
          addNotification(response.failed, "error");
        } else {
          setDepositOptions((response.options || []).filter((option) => option.name !== "bank"));
          addNotification(response.message);
        }
      } catch (error) {
        addNotification("An error occurred", "error");
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepositOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Render icon based on the billing option name
  const renderIcon = (name) => {
    const iconMap = {
      bitcoin: btcIcon,
      ethereum: ethIcon,
      litecoin: ltcIcon,
      dogecoin: dogecoinIcon,
      cashapp: cashasppIcon,
      paypal: paypalIcon,
      usdt: usdtIcon,
    };
    return (
      iconMap[name.toLowerCase()] ||
      (name.toLowerCase().includes("usdt") ? usdtIcon : <BuildingLibraryIcon className='w-5 h-5' />)
    );
  };
  const handleSelectOption = (index) => {
    handleOpen();
    // Close the modal if the same option is clicked again
    setSelectedDetails(depositOptions[index]);
  };

  return (
    <div className='space-y-4 bg-primary-default'>
      <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 md:gap-2 gap-x-0 gap-y-5'>
        {isLoading ? (
          <div className='deposit-box'>
            <div className='text-lg font-semibold flex justify-center px-2 mt-16'>
              <Loader />
            </div>
          </div>
        ) : (
          depositOptions.map((option, index) => (
            <div
              key={option?.address}
              className={`deposit-box cursor-pointer ${
                selectedDetails?.address === option?.address
                  ? "!bg-primary-light text-text-dark shadow-lg"
                  : ""
              }`}
              onClick={() => handleSelectOption(index)}>
              <div className='absolute top-[50%] left-[50%]'>
                <span className='scale-[500%] flex shadow-md rounded-lg'>
                  {renderIcon(option.name)}
                </span>
              </div>
              <div className='text-xl font-semibold px-2 mt-6'>
                <h2 className='capitalize truncate w-full flex justify-center'>{option?.name}</h2>
              </div>
            </div>
          ))
        )}
      </div>

      {!isLoading && depositOptions.length === 0 && (
        <div className='w-full lg:max-w-md mx-auto lg:mx-0 bg-transparent flex flex-row justify-center lg:justify-start text-primary-light space-x-2 p-10 lg:ps-0'>
          <p className='text-sm font-semibold'>No deposit option currently available</p>
          <ExclamationTriangleIcon className='w-5 h-5' />
        </div>
      )}
      <DepositModal detail={selectedDetails} handler={handleOpen} openState={open} />
    </div>
  );
};

export default Deposit;

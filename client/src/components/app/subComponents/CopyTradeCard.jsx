import PropTypes from "prop-types";
import { useNotification } from "../../layout/NotificationHelper";
import { Card, CardHeader, CardBody, CardFooter, Typography } from "@material-tailwind/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import FetchWithAuth from "../../auth/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../auth/useAuth";
import TraderImg from "./TraderImg";

const CopyTradeCard = ({
  trader,
  entryPrice,
  type,
  currencyPair,
  stopLoss,
  takeProfit,
  time,
  action,
}) => {
  const { user } = useAuth();
  const [isSubmitting, setisSubmitting] = useState(false);
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  console.log(trader);
  const handleTradeSubmission = async () => {
    setisSubmitting(true);
    // Check if entryPrice exceeds user balance
    if (entryPrice > user?.wallet?.balance) {
      addNotification(
        `Amount exceeds balance by $${(entryPrice - user?.wallet?.balance).toLocaleString()}`,
        "error"
      );
      setisSubmitting(false); // Reset submitting state
      return; // Early return to prevent further execution
    } else {
      addNotification("Copying Trade"); // Show notification before proceeding with the trade
    }

    try {
      const response = await FetchWithAuth(
        "/livetrade",
        {
          method: "POST",
          body: JSON.stringify({
            type,
            currencyPair,
            entryPrice,
            stopLoss,
            takeProfit,
            time,
            action,
          }),
        },
        "Failed to create live trade"
      );
      if (response.failed) {
        addNotification(response.message, "error");
      } else {
        const { message, success } = response;
        message && addNotification(message, "success");
        success && navigate("/app/transaction?tab=LiveTrade");
      }
    } catch (error) {
      addNotification("An error occurred during trade creation", "error");
      console.error("Error:", error);
    } finally {
      setisSubmitting(false);
    }
  };

  return (
    <Card  className='w-full p-6 bg-primary-default'>
      <CardHeader
        floated={false}
        shadow={false}
        color='transparent'
        className='relative m-0 mb-8 rounded-none border-b border-white/10 pb-8 text-center'>
        {/* Positioned avatar */}
        <div className='flex flex-col items-center space-x-2'>
          <TraderImg imageId={trader?.imageFilename} />
          <Typography variant='h5' className='font-bold text-text-light'>
            {trader.name}
          </Typography>
        </div>
        <Typography
          variant='h1'
          color='white'
          className='mt-6 flex justify-center text-4xl font-normal'>
          ${entryPrice}
        </Typography>
      </CardHeader>
      <CardBody className='p-0 text-text-light'>
        <ul className='flex flex-col gap-2'>
          {[
            { label: "Type", value: type },
            { label: "Currency Pair", value: currencyPair },
            { label: "Take Profit", value: `$${takeProfit}` },
            { label: "Stoploss", value: `$${stopLoss}` },
            { label: "Time (Hours)", value: time },
            { label: "Action", value: action },
          ].map((item, index) => (
            <li key={index} className='flex items-center gap-4'>
              <CheckCircleIcon className='w-5 h-5 text-primary-mild' />
              <Typography className='font-normal capitalize'>
                {item.label}: {item.value}
              </Typography>
            </li>
          ))}
        </ul>
      </CardBody>
      <CardFooter className='mt-6 p-0'>
        <button className='accent-btn w-full' onClick={handleTradeSubmission}>
          {isSubmitting ? `Copying` : `Copy Trade`}
        </button>
      </CardFooter>
    </Card>
  );
};

// PropTypes validation
CopyTradeCard.propTypes = {
  avatar: PropTypes.string,
  trader: PropTypes.object.isRequired,
  entryPrice: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  currencyPair: PropTypes.string.isRequired,
  stopLoss: PropTypes.number.isRequired,
  takeProfit: PropTypes.number.isRequired,
  time: PropTypes.number.isRequired,
  action: PropTypes.string.isRequired,
};

export default CopyTradeCard;

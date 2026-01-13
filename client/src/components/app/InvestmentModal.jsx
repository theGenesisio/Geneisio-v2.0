import { useState } from "react";
import PropTypes from "prop-types"; // Import PropTypes for type-checking
import { Button, Dialog, Card, Typography } from "@material-tailwind/react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom"; // Import navigate for redirection
import { useNotification } from "../layout/NotificationHelper";
import FetchWithAuth from "../auth/api";
import useAuth from "../auth/useAuth";

export default function InvestmentModal({ selectedPlan, onClose }) {
  // State to manage the investment amount
  const [amount, setAmount] = useState(selectedPlan?.limits.min || "");
  // State to manage the selected frequency
  const [frequency, setFrequency] = useState("");
  // State to toggle the informational prompt
  const [showPrompt, setShowPrompt] = useState(false);
  // State to manage loading state
  const [isLoading, setIsLoading] = useState(false);
  const [amountError, setAmountError] = useState(""); // State for amount error
  const [frequencyError, setFrequencyError] = useState(""); // State for frequency error
  const navigate = useNavigate(); // Initialize navigate for redirection
  const { addNotification } = useNotification();
  const { user } = useAuth(); // Get user information from auth context
  const { wallet } = user; // Extract wallet information from user
  // Options for timing selection
  const timingOptions = [
    { text: "1 day", equiv: 1 },
    { text: "2 days", equiv: 2 },
    { text: "3 days", equiv: 3 },
    { text: "1 week", equiv: 7 },
    { text: "2 weeks", equiv: 14 },
    { text: "1 month", equiv: 30 },
    { text: "2 months", equiv: 60 },
    { text: "3 months", equiv: 90 },
    { text: "6 months", equiv: 180 },
    { text: "1 year", equiv: 365 },
  ];

  // Function to handle the investment confirmation
  const handleAction = async () => {
    let hasError = false;

    // Validate the amount is within the allowed limits
    if (amount < selectedPlan.limits.min || amount > selectedPlan.limits.max) {
      setAmountError(
        `Amount must be between ${selectedPlan.limits.min} and ${selectedPlan.limits.max}`
      );
      addNotification(
        `Amount must be between ${selectedPlan.limits.min} and ${selectedPlan.limits.max}`,
        "error"
      );
      hasError = true;
    } else {
      setAmountError(""); // Clear error if validation passes
    }

    // Ensure a frequency is selected
    if (!frequency) {
      setFrequencyError("Frequency is required");
      addNotification("Frequency is required", "error");
      hasError = true;
    } else if (selectedPlan.duration < frequency) {
      setFrequencyError(
        `Frequency must be less than or equal to the plan duration (${selectedPlan.duration} hours)`
      );
      addNotification(
        `Frequency must be less than or equal to the plan duration (${selectedPlan.duration} hours)`,
        "error"
      );
      hasError = true;
    } else {
      setFrequencyError(""); // Clear error if validation passes
    }

    if (hasError) return;

    setIsLoading(true);
    try {
      const response = await FetchWithAuth(
        `/investment`,
        {
          method: "POST",
          body: JSON.stringify({
            plan: selectedPlan,
            amount,
            frequency,
          }),
          credentials: "include",
        },
        "Failed to invest"
      );

      if (response.failed) {
        addNotification(response.message, "error");
      } else {
        const { success, message } = response;
        if (success) {
          addNotification(message, "success");
          navigate("/app/dashboard");
        } else {
          addNotification("Investment request was not successful", "error");
        }
      }
    } catch (err) {
      addNotification("An error occurred while processing", "error");
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <Dialog
      size='xs'
      open={!!selectedPlan} // Open the dialog if a plan is selected
      handler={onClose}
      className='bg-transparent shadow-none'>
      <Card  className='w-full md:max-w-md mx-auto md:mx-0 p-6 mt-4 bg-primary-default'>
        <div className='flex justify-between'>
          <Typography variant='h5' className='mb-4 text-text-light'>
            Selected Investment: {selectedPlan.name}
          </Typography>
          <QuestionMarkCircleIcon
            title='Info'
            className='h-7 w-7 hover:scale-110 transition-transform cursor-help'
            onClick={() => setShowPrompt((prev) => !prev)} // Toggle the informational prompt
          />
        </div>
        {showPrompt && (
          <div className='text-sm text-primary-light py-2'>
            <p>
              Investments run autonomously but must undergo review to ensure compliance with our
              terms of service.
              <br />
              Multiple requests would overwrite the previous requests.
              <br />
              Once confirmed and status set to active, the duration would start running and
              expiration would be set automatically.
            </p>
          </div>
        )}
        <div className='flex flex-col p-2 min-w-96'>
          <p className='text-lg text-primary-light capitalize'>Account Balance</p>
          <p className='font-semibold text-xl lg:text-2xl py-2 text-white'>
            $
            {parseFloat(wallet?.balance).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            })}
          </p>
        </div>
        <div className='space-y-4 text-text-light'>
          <div className='mb-4'>
            <label className='block text-sm font-semibold mb-1' htmlFor='amount'>
              Amount ($)
            </label>
            <input
              type='number'
              className={`form-input w-full ${amountError ? "border-red-500" : ""}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)} // Update the amount state
              id='amount'
              placeholder=''
              required
              min={selectedPlan?.limits.min}
              max={selectedPlan?.limits.max}
            />
            {amountError && <p className='text-red-500 text-sm mt-1'>{amountError}</p>}
          </div>
          <div>
            <label htmlFor='time' className='block text-sm font-semibold'>
              Frequency
            </label>
            <select
              id='time'
              className={`form-input w-full ${frequencyError ? "border-red-500" : ""}`}
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}>
              {" "}
              {/* Update the frequency state */}
              <option value='' disabled>
                Select Frequency for payout
              </option>
              {timingOptions.map((opt) => (
                <option key={opt.text} value={opt.equiv}>
                  {opt.text}
                </option>
              ))}
            </select>
            {frequencyError && <p className='text-red-500 text-sm mt-1'>{frequencyError}</p>}
          </div>
          <Button
            className='accent-btn w-full'
            onClick={handleAction}
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? "Processing..." : "Confirm Investment"}
          </Button>
        </div>
      </Card>
    </Dialog>
  );
}

// Define PropTypes for the component
InvestmentModal.propTypes = {
  selectedPlan: PropTypes.shape({
    name: PropTypes.string.isRequired,
    limits: PropTypes.shape({
      min: PropTypes.number.isRequired,
      max: PropTypes.number.isRequired,
    }).isRequired,
    duration: PropTypes.number.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

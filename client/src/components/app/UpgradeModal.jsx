import { useEffect, useState } from "react";
import PropTypes from "prop-types"; // Import PropTypes for type-checking
import { Button, Dialog, Card, Typography } from "@material-tailwind/react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom"; // Import navigate for redirection
import { useNotification } from "../layout/NotificationHelper";
import FetchWithAuth from "../auth/api";

export default function UpgradeModal({ selectedTier, onClose, currentTier }) {
  // State to toggle the informational prompt
  const [showPrompt, setShowPrompt] = useState(false);
  // State to manage loading state
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Initialize navigate for redirection
  const { addNotification } = useNotification();
  const {
    tier: { name },
    status,
  } = currentTier;
  // Function to handle the upgrade confirmation
  const handleAction = async () => {
    setIsLoading(true);
    try {
      const response = await FetchWithAuth(
        `/upgrade`,
        {
          method: "POST",
          body: JSON.stringify({
            tier: selectedTier,
          }),
          credentials: "include",
        },
        "Failed to request upgrade"
      );

      if (response.failed) {
        addNotification(response.message, "error");
      } else {
        const { success, message } = response;
        if (success) {
          addNotification(message, "success");
          navigate("/app/dashboard");
        } else {
          addNotification("Upgrade request was not successful", "error");
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
  useEffect(() => {
    if (currentTier?.tier.name === selectedTier.name) {
      addNotification(`Already on ${currentTier?.tier.name}, selected another`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTier, currentTier]);

  return (
    <Dialog
      size='xs'
      open={!!selectedTier} // Open the dialog if a plan is selected
      handler={onClose}
      className='bg-transparent shadow-none'>
      <Card  className='w-full md:max-w-md mx-auto md:mx-0 p-6 mt-4 bg-primary-default'>
        <div className='flex justify-between gap-4'>
          <Typography variant='h6' className='mb-4 text-nowrap text-primary-light'>
            Selected Tier: <span className='text-white'>{selectedTier?.name}</span>
          </Typography>
          <QuestionMarkCircleIcon
            title='Info'
            className='h-7 w-7 hover:scale-110 transition-transform cursor-help text-text-light'
            onClick={() => setShowPrompt((prev) => !prev)} // Toggle the informational prompt
          />
        </div>
        {showPrompt && (
          <div className='text-sm text-primary-light py-2'>
            <p>
              Multiple requests would overwrite the previous requests.
              <br />
              Once confirmed and status set to active,and all upgrade benefits will follow
            </p>
          </div>
        )}
        <div className='flex flex-row gap-4 justify-between text-text-light'>
          <Typography variant='h6' className='mb-4 text-sm text-primary-light text-nowrap'>
            Current Tier: <span className=''>{name || "Base"}</span>
            {/* Display current tier name or "Base" if not available */}
          </Typography>
          <Typography variant='h6' className='mb-4 text-sm text-primary-light text-nowrap'>
            Status: <span className='capitalize'>{status || "Active by default"}</span>
            {/* Display current tier name or "Base" if not available */}
          </Typography>
        </div>

        <div className='space-y-4'>
          <Button
            className='accent-btn w-full'
            onClick={handleAction}
            disabled={isLoading || selectedTier.name === currentTier?.tier.name} // Disable button while loading
          >
            {isLoading ? "Processing..." : "Request Upgrade"}
          </Button>
        </div>
      </Card>
    </Dialog>
  );
}

// Define PropTypes for the component
UpgradeModal.propTypes = {
  selectedTier: PropTypes.shape({
    name: PropTypes.string.isRequired,
    details: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  currentTier: PropTypes.string.isRequired,
};

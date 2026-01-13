import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useNotification } from "../layout/NotificationHelper";
import FetchWithAuth from "../auth/api";
import Loader from "./subComponents/Loader";
import UpgradeModal from "./UpgradeModal";

export default function Upgrade() {
  const { addNotification } = useNotification();
  const [tiers, settiers] = useState([]); // Stores the list of tiers
  const [loading, setLoading] = useState(false); // Indicates if data is being fetched
  const [currentPage, setCurrentPage] = useState(1); // Tracks the current page for pagination
  const [selectedtier, setSelectedtier] = useState(null); // Tracks the selected tier for the modal
  const [currentTier, setcurrentTier] = useState({
    tier: { name: "Base" },
    status: "Active by default",
  });

  // Fetch tiers from the API
  const fetchtiers = async () => {
    try {
      setLoading(true);
      const response = await FetchWithAuth(
        `/tiers`,
        {
          method: "GET",
          credentials: "include",
        },
        "Failed to fetch tiers"
      );
      if (response.failed) {
        addNotification(response.message, "error");
      } else {
        const { tiers, message } = response;
        tiers && settiers(tiers);
        addNotification(message);
      }
    } catch (err) {
      addNotification("An error occurred", "error");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };
  // Fetch tiers from the API
  const fetchtCurrentTier = async () => {
    try {
      setLoading(true);
      const response = await FetchWithAuth(
        `/current-tier`,
        {
          method: "GET",
          credentials: "include",
        },
        "Failed to fetch tiers"
      );
      if (response.failed) {
        addNotification(response.message, "error");
      } else {
        const { currentTier, message } = response;
        currentTier && setcurrentTier(currentTier);
        addNotification(message);
      }
    } catch (err) {
      addNotification("An error occurred", "error");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchtiers();
    fetchtCurrentTier(); // Fetch the current tier when the component mounts
    // Cleanup function to reset the loading state when the component unmounts
    return () => {
      setLoading(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tiers_PER_PAGE = 4; // Number of tiers to display per page
  const indexOfLasttier = currentPage * tiers_PER_PAGE;
  const indexOfFirsttier = indexOfLasttier - tiers_PER_PAGE;
  const currenttiers = tiers.slice(indexOfFirsttier, indexOfLasttier); // tiers for the current page
  const totalPages = Math.ceil(tiers.length / tiers_PER_PAGE); // Total number of pages

  // Navigate to the next page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Navigate to the previous page
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Select a tier to invest in
  const selecttier = (tier) => {
    setSelectedtier(tier);
  };

  return (
    <section className='w-full h-full pb-4'>
      {/* Card showcase */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4'>
        {loading ? (
          <Loader />
        ) : (
          currenttiers.map((tier, index) => (
            <Card key={index} className='w-full p-6 bg-primary-default'>
              <CardHeader
                floated={false}
                shadow={false}
                color='transparent'
                className='m-0 mb-8 rounded-none border-b border-white/10 pb-8 text-center'>
                <Typography variant='small' color='white' className='font-normal uppercase'>
                  {tier.name}
                </Typography>
              </CardHeader>
              <CardBody className='p-0 text-text-light'>
                <ul className='flex flex-col gap-4'>
                  <li className='flex items-center gap-4'>
                    <CheckCircleIcon className='w-5 h-5 text-primary-mild' />
                    <Typography className='font-normal'>{tier.details}</Typography>
                  </li>
                </ul>
              </CardBody>
              <CardFooter className='mt-6 p-0'>
                <Button
                  className='accent-btn'
                  disabled={loading || tier?.name === currentTier?.tier.name}
                  ripple={false}
                  fullWidth={true}
                  onClick={() => selecttier(tier)}>
                  {tier?.name === currentTier?.tier.name ? currentTier?.status : "Request Upgrade"}
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
      {/* Pagination */}
      <div className='flex justify-between items-center mt-4'>
        <Button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className='bg-primary-light text-text-dark hover:bg-primary-light'>
          Previous
        </Button>
        <Typography variant='small' color='gray'>
          Page {currentPage} of {totalPages} ({tiers.length} items)
        </Typography>
        <Button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className='bg-primary-light text-text-dark hover:bg-primary-light'>
          Next
        </Button>
      </div>
      {/* Investment Modal */}
      {selectedtier && (
        <UpgradeModal
          selectedTier={selectedtier}
          onClose={() => setSelectedtier(null)}
          currentTier={currentTier}
        />
      )}
    </section>
  );
}

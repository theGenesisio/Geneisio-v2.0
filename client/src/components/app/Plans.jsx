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
import InvestmentModal from "./InvestmentModal";

export default function PricingCard() {
  const { addNotification } = useNotification();
  const [plans, setPlans] = useState([]); // Stores the list of plans
  const [loading, setLoading] = useState(false); // Indicates if data is being fetched
  const [currentPage, setCurrentPage] = useState(1); // Tracks the current page for pagination
  const [selectedPlan, setSelectedPlan] = useState(null); // Tracks the selected plan for the modal

  // Fetch plans from the API
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await FetchWithAuth(
        `/plans`,
        {
          method: "GET",
          credentials: "include",
        },
        "Failed to fetch plans"
      );
      if (response.failed) {
        addNotification(response.message, "error");
      } else {
        const { plans, message } = response;
        plans && setPlans(plans);
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
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const PLANS_PER_PAGE = 4; // Number of plans to display per page
  const indexOfLastPlan = currentPage * PLANS_PER_PAGE;
  const indexOfFirstPlan = indexOfLastPlan - PLANS_PER_PAGE;
  const currentPlans = plans.slice(indexOfFirstPlan, indexOfLastPlan); // Plans for the current page
  const totalPages = Math.ceil(plans.length / PLANS_PER_PAGE); // Total number of pages

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

  // Select a plan to invest in
  const selectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  return (
    <section className='w-full h-full pb-4'>
      {/* Card showcase */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4'>
        {loading ? (
          <Loader />
        ) : (
          currentPlans.map((plan, index) => (
            <Card key={index}  className='w-full p-6 bg-primary-default text-text-light'>
              <CardHeader
                floated={false}
                shadow={false}
                color='transparent'
                className='m-0 mb-8 rounded-none border-b border-white/10 pb-8 text-center'>
                <Typography variant='small' color='white' className='font-normal uppercase'>
                  {plan.name}
                </Typography>
                <Typography
                  variant='h1'
                  color='white'
                  className='mt-6 flex justify-center gap-1 text-6xl font-normal'>
                  {plan.ROIPercentage}% <span className='self-end text-xl'>ROI</span>
                </Typography>
              </CardHeader>
              <CardBody className='p-0'>
                <ul className='flex flex-col gap-4'>
                  <li className='flex items-center gap-4'>
                    <CheckCircleIcon className='w-5 h-5 text-primary-mild' />
                    <Typography className='font-normal'>Min: ${plan.limits.min}</Typography>
                  </li>
                  <li className='flex items-center gap-4'>
                    <CheckCircleIcon className='w-5 h-5 text-primary-mild' />
                    <Typography className='font-normal'>Max: ${plan.limits.max}</Typography>
                  </li>
                  <li className='flex items-center gap-4'>
                    <CheckCircleIcon className='w-5 h-5 text-primary-mild' />
                    <Typography className='font-normal'>Duration: {plan.duration} days</Typography>
                  </li>
                </ul>
              </CardBody>
              <CardFooter className='mt-6 p-0'>
                <Button
                  className='accent-btn'
                  disabled={loading}
                  ripple={false}
                  fullWidth={true}
                  onClick={() => selectPlan(plan)}>
                  Invest Now
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
          Page {currentPage} of {totalPages} ({plans.length} items)
        </Typography>
        <Button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className='bg-primary-light text-text-dark hover:bg-primary-light'>
          Next
        </Button>
      </div>
      {/* Investment Modal */}
      {selectedPlan && (
        <InvestmentModal selectedPlan={selectedPlan} onClose={() => setSelectedPlan(null)} />
      )}
    </section>
  );
}

import {
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import FetchWithAuth from "../../auth/api";

const RangeBarChart = () => {
  const options = {
    chart: {
      height: 200,
      type: "rangeBar",
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false, // Toolbar disabled
      },
    },
    plotOptions: {
      bar: {
        isDumbbell: true,
        columnWidth: "5%",
        dumbbellColors: [["#388e3c", "#0D9488"]], // Changed color to #7B1FA2
      },
    },
    legend: {
      show: false, // Disabled legend
    },
    fill: {
      type: "gradient",
      gradient: {
        type: "vertical",
        gradientToColors: ["#0D9488"], // Gradient matching the theme
        inverseColors: true,
        stops: [0, 100],
      },
    },
    grid: {
      show: false, // Removed grid
    },
    xaxis: {
      tickPlacement: "on",
      labels: {
        show: false, // Disabled axis labels
      },
    },
    yaxis: {
      labels: {
        show: false, // Disabled axis labels
      },
    },
    dataLabels: {
      enabled: false, // Disabled data labels
    },
    tooltip: {
      enabled: false, // Disabled tooltips
    },
    theme: {
      mode: "transparent", // Set to dark theme
    },
  };

  const series = [
    {
      data: [
        { x: "2011", y: [3000, 4600] },
        { x: "2010", y: [2950, 7800] },
        { x: "2014", y: [2300, 5600] },
        { x: "2012", y: [2500, 4100] },
        { x: "2008", y: [2800, 4500] },
        { x: "2009", y: [3200, 8100] },
        { x: "2013", y: [4500, 6500] },
      ],
    },
  ];

  return <Chart options={options} series={series} type='rangeBar' height='200' />;
};
/**
 * LastWithdrawal component fetches and displays the last withdrawal information.
 *
 * This component uses the FetchWithAuth function to retrieve the last withdrawal data from the server.
 * It displays the withdrawal amount and status using appropriate icons.
 *
 * @component
 * @example
 * return (
 *   <LastWithdrawal />
 * )
 *
 * @returns {JSX.Element} The LastWithdrawal component.
 *
 * @function
 * @name LastWithdrawal
 *
 * @description
 * - Uses `useState` to manage the withdrawal state.
 * - Uses `useEffect` to fetch the last withdrawal data when the component mounts.
 * - Displays different icons based on the withdrawal status (completed, pending, or failed).
 * - Formats the withdrawal amount to a locale string.
 */
const LastWithdrawal = () => {
  const [withdrawal, setwithdrawal] = useState("0.00");
  const fetchLastWithdrawal = async () => {
    try {
      const response = await FetchWithAuth(
        `/dashboard/lastWithdrawal`,
        {
          method: "GET",
          credentials: "include",
        },
        "Failed to fetch lastWithdrawal"
      );
      if (response.failed) {
        console.log(response.message, "error");
      } else {
        const { withdrawal } = response;
        withdrawal && setwithdrawal(withdrawal);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchLastWithdrawal();
  }, []);
  return (
    <div className='dashboard-box flex flex-col !pb-0'>
      <div className='flex flex-col'>
        <h2 className='font-semibold text-2xl lg:text-3xl flex flex-col'>
          <div className='flex flex-row justify-between'>
            <DocumentTextIcon className='h-7 w-7 text-success-dark' />
            {withdrawal.status === "completed" ? (
              <CheckCircleIcon
                className='h-7 w-7 hover:scale-110 transition-all cursor-help text-success-light'
                title='Withdrawal completed'
              />
            ) : withdrawal.status === "pending" ? (
              <ClockIcon
                className='h-7 w-7 hover:scale-110 transition-all cursor-help text-warning-dark'
                title='Withdrawal in progress'
              />
            ) : (
              <XCircleIcon
                className='h-7 w-7 hover:scale-110 transition-all cursor-help text-error-light'
                title='Withdrawal failed'
              />
            )}
          </div>
          ${parseFloat(withdrawal?.amount || "0.00").toLocaleString()}
        </h2>
        <p className='text-sm text-primary-light'>Last Withdrawal</p>
      </div>
      <div className=''>
        <RangeBarChart />
      </div>
    </div>
  );
};
export default LastWithdrawal;

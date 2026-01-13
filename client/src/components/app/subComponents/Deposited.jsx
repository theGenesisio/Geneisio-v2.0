import { BanknotesIcon } from "@heroicons/react/24/solid";
import Chart from "react-apexcharts";
import useAuth from "../../auth/useAuth";

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
      animations: {
        enabled: true, // Enables animations
        easing: "easeinout", // Defines the easing function
        speed: 800, // Animation speed in milliseconds
        animateGradually: {
          enabled: true,
          delay: 150, // Delay between each series animation
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350, // Speed of dynamic animations
        },
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
      mode: "dark", // Set to dark theme
    },
  };

  const series = [
    {
      data: [
        { x: "2008", y: [2800, 4420] },
        { x: "2009", y: [3250, 4100] },
        { x: "2010", y: [2950, 7800] },
        { x: "2011", y: [3000, 4600] },
        { x: "2012", y: [3500, 4100] },
        { x: "2013", y: [4500, 6500] },
        { x: "2014", y: [4100, 5600] },
      ],
    },
  ];

  return <Chart options={options} series={series} type='rangeBar' height='200' />;
};
/**
 * Deposited component displays the total amount deposited by the user.
 * It shows the amount in a formatted currency style and includes a chart.
 *
 * @component
 * @example
 * return (
 *   <Deposited />
 * )
 *
 * @returns {JSX.Element} The Deposited component.
 */
const Deposited = () => {
  const { user } = useAuth();
  return (
    <div className='dashboard-box flex flex-col !pb-0'>
      <div className='flex flex-col'>
        <h2 className='font-semibold text-2xl lg:text-3xl flex flex-col'>
          <BanknotesIcon className='h-7 w-7 text-success-light' />
          {`$${parseFloat(user?.wallet?.totalDeposit || "0.00").toLocaleString()}`}
        </h2>
        <p className='text-sm text-primary-light'>Amount Deposited</p>
      </div>
      <RangeBarChart />
    </div>
  );
};

export default Deposited;

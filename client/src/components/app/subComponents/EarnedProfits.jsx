import Chart from "react-apexcharts";
import useAuth from "../../auth/useAuth";
import { liveTradeIcon } from "../../../assets/icons";

const AreaChart = () => {
  const series = [
    {
      name: "STOCK ABC",
      data: [8200, 8250, 8230, 8300, 8350],
    },
  ];

  const options = {
    chart: {
      type: "area",
      height: 200,
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false, // Removes the toolbar
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
    colors: ["#0D9488"], // Sets the area chart color
    dataLabels: {
      enabled: false, // Hides data labels
    },
    stroke: {
      curve: "smooth", // Makes the stroke smooth
    },
    grid: {
      show: false, // Removes the grid
    },
    labels: ["2024-11-01", "2024-11-02", "2024-11-03", "2024-11-04", "2024-11-05"],
    xaxis: {
      type: "datetime",
      labels: {
        show: false, // Hides x-axis labels
      },
      axisBorder: {
        show: false, // Hides x-axis border
      },
      axisTicks: {
        show: false, // Hides x-axis ticks
      },
    },
    yaxis: {
      opposite: true,
      labels: {
        show: false, // Hides y-axis labels
      },
    },
    tooltip: {
      enabled: false, // Disables tooltips
    },
    legend: {
      show: false, // Hides the legend
    },
    theme: {
      mode: "dark", // Set to dark theme
    },
  };

  return <Chart options={options} series={series} type='area' height='200' />;
};

/**
 * EarnedProfits component displays the user's earned profits in a formatted manner.
 * It fetches the user data using the useAuth hook and displays the profits in a styled box.
 * The component also includes an AreaChart to visualize the profits.
 *
 * @component
 * @example
 * return (
 *   <EarnedProfits />
 * )
 */
const EarnedProfits = () => {
  const { user } = useAuth();
  const profit = parseFloat(user?.wallet?.profits || "0.00");
  const formattedProfit =
    profit < 0 ? `-$${Math.abs(profit).toLocaleString()}` : `$${profit.toLocaleString()}`;

  return (
    <div className='dashboard-box flex flex-col !px-0 !pb-0'>
      <div className='px-4 flex flex-col'>
        <h2 className='font-semibold text-2xl lg:text-3xl flex flex-col'>
          <span className='h-4 w-4 mb-4'>{liveTradeIcon}</span>
          <span
            className={`${
              user?.wallet?.profits > 0
                ? "text-success-dark"
                : user?.wallet?.profits < 0
                ? "text-error-dark"
                : ""
            }`}>
            {formattedProfit}
          </span>
        </h2>
        <p className='text-sm text-primary-light'> Earned Profits</p>
      </div>
      <AreaChart />
    </div>
  );
};

export default EarnedProfits;

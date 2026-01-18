import Chart from "react-apexcharts";
import { WifiIcon } from "@heroicons/react/24/solid";
import { useNotification } from "../../layout/NotificationHelper";
import { Card } from "@material-tailwind/react";
import useAuth from "../../auth/useAuth";
const ProgressChart = () => {
  const { offline } = useNotification();
  const { user } = useAuth();

  const series = [offline ? 0 : user.signal || 0]; // Progress percentage array
  const options = {
    chart: {
      type: "radialBar",
      offsetY: 0,
      toolbar: {
        show: false, // Removes the toolbar
      },
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: "45%", // Hollow area size
        },
        track: {
          background: user.signal >= 0 ? "#15100d" : "#d32f2f", // Dark background for track
        },
        dataLabels: {
          show: true,
          name: {
            show: false, // Hides the label name
          },
          value: {
            fontSize: "16px", // Smaller font size for progress value
            color: user.signal >= 0 ? "#FFFFFF" : "#d32f2f", // Text color
            offsetY: 5,
            show: true, // Shows progress value
          },
        },
        startAngle: -135, // Makes the bar start at the top-left
        endAngle: 135, // Ends at the top-right
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "horizontal",
        gradientToColors: ["#f59e0b"], // Color at 100%
        stops: [0, 100], // Defines gradient progression
        colors: ["#A16207"], // Color at 0%
        // colors: ["#d32f2f"], // Color at 0%
      },
    },
    grid: {
      show: false, // Removes the grid
    },
    tooltip: {
      enabled: false, // Disables tooltips
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
  };

  return <Chart options={options} series={series} type='radialBar' height='200' />;
};

/**
 * Signal component displays a card with signal strength information.
 * It includes a title with an icon, a description, and a progress chart.
 *
 * @component
 * @example
 * return (
 *   <Signal />
 * )
 */
const Signal = () => {
  return (
    <div className='dashboard-box flex flex-col'>
      <div className='flex flex-col'>
        <p className='font-semibold text-xl flex flex-col'>
          <WifiIcon className='h-7 w-7' /> Signal
        </p>
        <p className='text-sm text-primary-light capitalize'>
          Higher signal strength gurantees faster earning
        </p>
      </div>
      <div className=''>
        <ProgressChart />
      </div>
    </div>
  );
};

export default Signal;

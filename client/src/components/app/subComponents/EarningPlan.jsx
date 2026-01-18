import {
  BoltIcon,
  BoltSlashIcon,
  ClockIcon,
  ExclamationCircleIcon,
  SquaresPlusIcon,
} from "@heroicons/react/24/solid";
import { Card } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import Charts from "react-apexcharts";
import FetchWithAuth from "../../auth/api";
import Loader from "./Loader";
import { formatToNewYorkTime } from "../../../assets/helpers";

const PolarChart = () => {
  /**
   * Configuration options for the Polar Area chart.
   *
   * @type {Object}
   * @property {Array<number>} series - Data series for the chart.
   * @property {Object} chart - Chart configuration.
   * @property {number} chart.width - Width of the chart.
   * @property {string} chart.type - Type of the chart.
   * @property {Array<string>} labels - Labels for the data series.
   * @property {Object} fill - Fill configuration.
   * @property {number} fill.opacity - Opacity of the fill.
   * @property {Object} stroke - Stroke configuration.
   * @property {number} stroke.width - Width of the stroke.
   * @property {Array<string>|undefined} stroke.colors - Colors of the stroke.
   * @property {Object} yaxis - Y-axis configuration.
   * @property {boolean} yaxis.show - Whether to show the Y-axis.
   * @property {Object} legend - Legend configuration.
   * @property {boolean} legend.show - Whether to show the legend.
   * @property {Object} tooltip - Tooltip configuration.
   * @property {boolean} tooltip.enabled - Whether to enable tooltips.
   * @property {Object} plotOptions - Plot options configuration.
   * @property {Object} plotOptions.polarArea - Polar Area specific options.
   * @property {Object} plotOptions.polarArea.rings - Rings configuration.
   * @property {number} plotOptions.polarArea.rings.strokeWidth - Stroke width of the rings.
   * @property {Object} plotOptions.polarArea.spokes - Spokes configuration.
   * @property {number} plotOptions.polarArea.spokes.strokeWidth - Stroke width of the spokes.
   * @property {Object} theme - Theme configuration.
   * @property {Object} theme.monochrome - Monochrome theme configuration.
   * @property {boolean} theme.monochrome.enabled - Whether to enable monochrome theme.
   * @property {string} theme.monochrome.color - Base color for the monochrome theme.
   * @property {string} theme.monochrome.shadeTo - Shade direction for the monochrome theme.
   * @property {number} theme.monochrome.shadeIntensity - Shade intensity for the monochrome theme.
   */
  const options = {
    series: [42, 47, 52, 58, 65],
    chart: {
      width: 300,
      type: "polarArea",
    },
    labels: ["Rose A", "Rose B", "Rose C", "Rose D", "Rose E"],
    fill: {
      opacity: 1,
    },
    stroke: {
      width: 2,
      colors: undefined,
    },
    yaxis: {
      show: false, // Hide Y-axis
    },
    legend: {
      show: false, // Disable legend
    },
    tooltip: {
      enabled: false, // Disable tooltips
    },
    plotOptions: {
      polarArea: {
        rings: {
          strokeWidth: 0, // Remove the ring borders
        },
        spokes: {
          strokeWidth: 0, // Remove the spokes
        },
      },
    },
    theme: {
      monochrome: {
        enabled: true,
        color: "#f59e0b",
        shadeTo: "light",
        shadeIntensity: 0.5,
      },
    },
  };

  return (
    <div id='chart'>
      <Charts options={options} series={options.series} type='polarArea' width={300} />
    </div>
  );
};
const actionIcons = [
  { Icon: BoltIcon, status: "active", color: "text-success-light", title: "Active" },
  { Icon: BoltSlashIcon, status: "expired", color: "text-warning-light", title: "Expired" },
  { Icon: ExclamationCircleIcon, status: "failed", color: "text-error-light", title: "Failed" },
  { Icon: ClockIcon, status: "pending", color: "text-warning-dark", title: "Pending" },
];
const Earning = () => {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchCurrentPlan = async () => {
    setLoading(true);
    try {
      const response = await FetchWithAuth(
        `/dashboard/current-plan`,
        {
          method: "GET",
          credentials: "include",
        },
        "Failed to fetch current plan"
      );
      if (response.failed) {
        console.log(response.message);
      } else {
        const { currentPlan } = response;
        currentPlan && setCurrentPlan(currentPlan);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentPlan();
  }, []);
  const formattedDate = formatToNewYorkTime(currentPlan?.expiryDate);
  const displayDate = formattedDate.startsWith("Error:") ? "Unavailable" : formattedDate;

  return (
    <div className='dashboard-box flex flex-col !pb-0'>
      {loading ? (
        <Loader />
      ) : (
        <div className='flex flex-col'>
          <h2 className='font-semibold text-xl flex flex-col'>
            <div className='flex flex-row justify-between'>
              <SquaresPlusIcon className='h-7 w-7' />
              {(() => {
                const foundIcon = actionIcons.find((icon) => icon.status === currentPlan?.status);
                return foundIcon ? (
                  <foundIcon.Icon
                    className={`h-7 w-7 hover:scale-110 transition-all cursor-pointer ${foundIcon.color}`}
                    title={foundIcon.title || "Unavailable"}
                  />
                ) : null;
              })()}
            </div>
            {currentPlan?.plan?.name || "Unavailable"}
          </h2>
          <div className='flex flex-row justify-between'>
            <p className='text-sm text-primary-light capitalize'>Expiry Date</p>
            <p className='text-sm text-primary-light' title='Expires'>
              {displayDate}
            </p>
          </div>
          <div className='flex flex-row justify-between'>
            <p className='text-sm text-primary-light capitalize'>Frequency</p>
            <p className='text-sm text-primary-light' title='Frequency'>
              {`${currentPlan?.frequency || 0} days`}
            </p>
          </div>
        </div>
      )}
      <div className='flex justify-center'>
        <PolarChart />
      </div>
    </div>
  );
};

export default Earning;

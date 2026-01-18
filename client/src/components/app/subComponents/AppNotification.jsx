import { useState, useEffect } from "react";
import { Carousel, Alert, Badge } from "@material-tailwind/react";
import { EyeIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { warningIcon, successIcon, errorIcon, notificationIcon } from "../../../assets/icons";
import FetchWithAuth from "../../auth/api";

const AppNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const classes = {
    success: { box: "bg-success-light/20 text-success-light", text: "text-success-light" },
    error: { box: "bg-error-light/20 text-error-light", text: "text-error-light" },
    warning: { box: "bg-warning-light/20 text-warning-light", text: "text-warning-light" },
    info: { box: "bg-primary-default text-text-light", text: "text-text-light" },
  };

  const getNotificationClass = (type) => classes[type] || classes.info;

  const fetchNotifications = async () => {
    try {
      const response = await FetchWithAuth(
        `/notifications`,
        {
          method: "GET",
          credentials: "include",
        },
        "Failed to fetch notifications"
      );
      if (response.failed) {
        console.error(response.message);
      } else {
        const { notifications } = response;
        notifications && setNotifications(notifications.reverse());
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every 5 minutes
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const markRead = async (_id) => {
    try {
      const response = await FetchWithAuth(
        `/notifications`,
        {
          method: "PUT",
          credentials: "include",
          body: JSON.stringify({ notificationId: _id }),
        },
        "Failed to mark notification as read"
      );
      if (response.failed) {
        console.error(response.message);
      } else {
        setNotifications((prev) => prev.filter((notification) => notification._id !== _id));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleClose = (_id) => {
    setNotifications((prev) => prev.filter((notification) => notification._id !== _id));
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return successIcon;
      case "error":
        return errorIcon;
      case "warning":
        return warningIcon;
      default:
        return notificationIcon;
    }
  };

  return notifications.length > 0 ? (
    <Badge
      content={notifications?.length}
      className={`${getNotificationClass(notifications[0].type).box} border-2`}
      placement='top-start'>
      <Carousel
        transition={{ duration: 1 }}
        autoplay={true}
        autoplayDelay={50000}
        loop={true}
        className='w-full rounded-lg mb-4 mt-2'
        navigation={({ setActiveIndex, activeIndex, length }) => (
          <div className='absolute bottom-4 left-2/4 z-50 flex -translate-x-2/4 gap-2'>
            {new Array(length).fill("").map((_, i) => (
              <span
                key={i}
                className={`block h-1 cursor-pointer rounded-2xl transition-all ${
                  activeIndex === i ? "w-8 bg-white" : "w-4 bg-white/50"
                }`}
                onClick={() => setActiveIndex(i)}
              />
            ))}
          </div>
        )}>
        {notifications.map((notification) => (
          <Alert
            key={notification._id}
            icon={getIcon(notification.type)}
            open={true}
            className={`rounded-none h-full w-full -ml-0.5 ${
              getNotificationClass(notification.type).box
            } font-medium md:min-h-[5rem] sm:min-h-[8rem]`}
            action={
              <div className='flex flex-row !absolute top-3 right-3 space-x-2'>
                <EyeIcon
                  className={`w-5 h-5 cursor-pointer ${getNotificationClass(notification.type).text}`}
                  onClick={() => markRead(notification._id)}
                />
                <XCircleIcon
                  className={`w-5 h-5 cursor-pointer ${getNotificationClass(notification.type).text}`}
                  onClick={() => handleClose(notification._id)}
                />
              </div>
            }>
            {notification.message}
          </Alert>
        ))}
      </Carousel>
    </Badge>
  ) : (
    <Alert
      icon={notificationIcon}
      open={true}
      className={`${classes.info.box} font-medium md:min-h-[5rem] sm:min-h-[8rem] rounded-lg mb-4 mt-2`}>
      No notifications available right now
    </Alert>
  );
};

export default AppNotification;

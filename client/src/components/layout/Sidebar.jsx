import { useEffect, useState } from "react";
import PropTypes from "prop-types";
// import UtcTime from "../app/subComponents/Time";
import useAuth from "../auth/useAuth";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  // clockIcon,
  liveTradeIcon,
  plansIcon,
  securityIcon,
  supportIcon,
  traderIcon,
  transactionIcon,
  walletIcon,
} from "../../assets/icons";
import {
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  Accordion,
  AccordionHeader,
  AccordionBody,
  Drawer,
  Card,
} from "@material-tailwind/react";
import {
  PresentationChartBarIcon,
  UserCircleIcon,
  PowerIcon,
  IdentificationIcon,
  HomeIcon,
  TrophyIcon,
} from "@heroicons/react/24/solid";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Logo } from "../../assets/utilities";
import Footer from "./Footer";
import { openEmailClient } from "../../assets/helpers";
import Whatsapp from "../app/subComponents/Whatsapp";
export default function Sidebar() {
  const [openAlert, setOpenAlert] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation(); // Get current location

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  // Close drawer on navigation
  useEffect(() => {
    closeDrawer();
  }, [location]);

  return (
    <>
      {/* Hamburger Button for Mobile */}
      <IconButton
        variant='text'
        size='sm'
        onClick={openDrawer}
        className='lg:hidden text-text-light'>
        {isDrawerOpen ? (
          <XMarkIcon className='h-6 w-6 stroke-2' />
        ) : (
          <Bars3Icon className='h-5 w-5 stroke-2' />
        )}
      </IconButton>

      {/* Sidebar Drawer for Mobile */}
      <Drawer open={isDrawerOpen} onClose={closeDrawer} className='lg:hidden bg-primary-default'>
        <SidebarContent openAlert={openAlert} setOpenAlert={setOpenAlert} />
      </Drawer>

      {/* Fixed Sidebar for Large Screens */}
      <div className='hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:left-0 bg-primary-default lg:p-4'>
        <SidebarContent openAlert={openAlert} setOpenAlert={setOpenAlert} />
      </div>
    </>
  );
}

function SidebarContent() {
  const { logout } = useAuth();
  const [open, setOpen] = useState(0);
  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
  };
  const navigate = useNavigate();
  return (
    <Card
      shadow={false}
      className='h-[calc(100vh-2rem)] w-full p-4 bg-inherit overflow-y-auto overflow-x-hidden'>
      {/* Close button for mobile view */}
      <Link
        to='/'
        className='mb-0 flex items-center p-4 text-text-light hover:scale-105 duration-500 delay-100 transition-all'>
        <img src={Logo} alt='brand' className='m-0 w-16 h-16 object-cover' />
        <Typography variant='h6' className='font-extrabold'>
          Genesisio
        </Typography>
      </Link>
      <List className='text-text-light'>
        {/* <ListItem>
          <ListItemPrefix>
            <span className='h-5 w-5 scale-125'>{clockIcon}</span>
          </ListItemPrefix>
          <UtcTime />
        </ListItem> */}
        <Accordion
          open={open === 1}
          icon={
            <ChevronDownIcon
              strokeWidth={2.5}
              className={`mx-auto h-4 w-4 transition-transform hover:text-text-dark ${
                open === 1 ? "rotate-180" : "text-text-light"
              }`}
            />
          }>
          <ListItem className='p-0' selected={open === 1}>
            <AccordionHeader
              onClick={() => handleOpen(1)}
              className='border-b-0 p-3 text-text-light'>
              <ListItemPrefix>
                <PresentationChartBarIcon className='h-5 w-5' />
              </ListItemPrefix>
              <Typography className='mr-auto font-normal'>Dashboard</Typography>
            </AccordionHeader>
          </ListItem>
          <AccordionBody className='py-1'>
            <List className='p-0 text-text-light'>
              <ListItem onClick={() => navigate("./dashboard")}>
                <ListItemPrefix>
                  <HomeIcon strokeWidth={3} className='h-5 w-5' />
                </ListItemPrefix>
                Home
              </ListItem>
              <ListItem onClick={() => navigate("./profile")}>
                <ListItemPrefix>
                  <UserCircleIcon className='h-5 w-5' />
                </ListItemPrefix>
                Profile
              </ListItem>
            </List>
          </AccordionBody>
        </Accordion>
        <Accordion
          open={open === 2}
          icon={
            <ChevronDownIcon
              strokeWidth={2.5}
              className={`mx-auto h-4 w-4 transition-transform hover:text-text-dark ${
                open === 2 ? "rotate-180" : "text-text-light"
              }`}
            />
          }>
          <ListItem className='p-0' selected={open === 2}>
            <AccordionHeader
              onClick={() => handleOpen(2)}
              className='border-b-0 p-3 text-text-light'>
              <ListItemPrefix>
                <span className='h-5 w-5 scale-125'>{transactionIcon}</span>
              </ListItemPrefix>
              <Typography className='mr-auto font-normal'>Transactions</Typography>
            </AccordionHeader>
          </ListItem>
          <AccordionBody className='py-1'>
            <List className='p-0 text-text-light'>
              <ListItem onClick={() => navigate("./deposit")}>
                <ListItemPrefix>
                  <ChevronRightIcon strokeWidth={3} className='h-3 w-5' />
                </ListItemPrefix>
                Deposit
              </ListItem>
              <ListItem onClick={() => navigate("./withdrawal")}>
                <ListItemPrefix>
                  <ChevronRightIcon strokeWidth={3} className='h-3 w-5' />
                </ListItemPrefix>
                Withdrawals
              </ListItem>
              <ListItem onClick={() => navigate("./transaction")}>
                <ListItemPrefix>
                  <ChevronRightIcon strokeWidth={3} className='h-3 w-5' />
                </ListItemPrefix>
                Transaction History
              </ListItem>
            </List>
          </AccordionBody>
        </Accordion>
        <hr className='my-2 border-primary-light' />
        <ListItem onClick={() => navigate("./assets")}>
          <ListItemPrefix>
            <span className='h-5 w-5 scale-125'>{walletIcon}</span>
          </ListItemPrefix>
          Assets
        </ListItem>
        <ListItem onClick={() => navigate("./upgrade")}>
          <ListItemPrefix>
            <TrophyIcon className='h-5 w-5' />
          </ListItemPrefix>
          Upgrade
        </ListItem>
        <ListItem onClick={() => navigate("./plans")}>
          <ListItemPrefix>
            <span className='h-5 w-5 scale-125'>{plansIcon}</span>
          </ListItemPrefix>
          Investments
        </ListItem>
        <ListItem onClick={() => navigate("./trade")}>
          <ListItemPrefix>
            <span className='h-5 w-5 scale-125'>{liveTradeIcon}</span>
          </ListItemPrefix>
          Live Trade
        </ListItem>
        <ListItem onClick={() => navigate("./copy-trading")}>
          <ListItemPrefix>
            <span className='h-5 w-5 scale-125'>{traderIcon}</span>
          </ListItemPrefix>
          Copy Trading
        </ListItem>
        <ListItem onClick={() => navigate("./kyc")}>
          <ListItemPrefix>
            <IdentificationIcon className='h-5 w-5' />
          </ListItemPrefix>
          KYC
        </ListItem>
        <ListItem onClick={() => navigate("./security")}>
          <ListItemPrefix>
            <span className='h-5 w-5 scale-125'>{securityIcon}</span>
          </ListItemPrefix>
          Security
        </ListItem>
        {/* get from db */}
        <ListItem
          onClick={() =>
            // todo change to support email
            openEmailClient(
              "notifications@genesisio.net",
              "Edit to match your complaint",
              "I need help with..."
            )
          }>
          <ListItemPrefix>
            <span className='h-5 w-5 scale-125'>{supportIcon}</span>
          </ListItemPrefix>
          Support
        </ListItem>
        <Whatsapp />
        <ListItem onClick={() => logout()}>
          <ListItemPrefix>
            <PowerIcon className='h-5 w-5' />
          </ListItemPrefix>
          Log Out
        </ListItem>
      </List>
      <Footer />
    </Card>
  );
}

// Prop-Types validation for SidebarContent props
SidebarContent.propTypes = {
  closeDrawer: PropTypes.func,
  openAlert: PropTypes.bool.isRequired,
  setOpenAlert: PropTypes.func.isRequired,
};

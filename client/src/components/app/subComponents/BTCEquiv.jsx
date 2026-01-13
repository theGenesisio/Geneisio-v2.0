import { Card } from "@material-tailwind/react";
import { btcIcon } from "../../../assets/icons";
const BTCEquiv = () => {
  return (
    <Card className='dashboard-box flex flex-col' >
      <h2 className='font-semibold text-xl flex flex-col'>
        <span className='h-7 w-7 scale-150 ms-1'>{btcIcon}</span>
        Bitcoin Equivalent
      </h2>
      <p className='text-sm text-primary-light capitalize'>Returns in crypto</p>
      <p className='font-semibold text-2xl lg:text-3xl'>$10,783.22</p>
    </Card>
  );
};

export default BTCEquiv;

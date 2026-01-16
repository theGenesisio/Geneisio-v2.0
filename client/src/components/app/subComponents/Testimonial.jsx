import { Carousel, Card, CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { Testimony1, Testimony2, Testimony3 } from "../../../assets/utilities";
import { staggerFadeIn } from "../../../assets/gsap";

const testimonials = [
  {
    id: 1,
    name: "Arjun Patel",
    role: "UI/UX Designer",
    image: Testimony1,
    review:
      "This platform has redefined my creative workflow. Its seamless interface and powerful features allow me to focus on design without any friction.",
  },
  {
    id: 2,
    name: "Mateo Silva",
    role: "Logistics Coordinator",
    image: Testimony2,
    review:
      "Our collaboration with this team has been outstanding. The tools provided have drastically enhanced our operational efficiency and project turnaround times.",
  },
  {
    id: 3,
    name: "Amira Hassan",
    role: "Digital Marketing Strategist",
    image: Testimony3,
    review:
      "The most user-friendly platform I've encountered. It has optimized our digital strategies, delivering exceptional performance and measurable growth.",
  },
];

const Testimonials = () => {
  staggerFadeIn(".gsapTestimony");
  return (
    <section className='my-5 bg-inherit overflow-hidden min-h-[75dvh] md:min-h-[50dvh]'>
      <div className='container mt-24 mx-auto'>
        <div className='text-center'>
          <div className='mb-8 gsapTestimony'>
            <Typography variant='h4' color='text'>
              What our Customers say!
            </Typography>
            <Typography
              variant='paragraph'
              className='text-text-light text-center max-w-xl mx-auto'>
              You can take our word for it, here&apos;s what some of our clients have to say about
              us.
            </Typography>
          </div>
        </div>

        <Carousel autoplay={true} loop={true} autoplayDelay={3000} className='mt-10 gsapTestimony'>
          {testimonials.map(({ id, name, role, image, review }) => (
            <div key={id} className='flex justify-center items-center h-[400px]'>
              <Card className='m-2 shadow-lg bg-primary-default' >
                <CardHeader floated={false} className='mx-auto'>
                  <img src={image} alt={name} className='rounded-none object-cover w-32 h-32' />
                </CardHeader>
                <CardBody className='text-center'>
                  <Typography variant='h6' className='text-text-light'>
                    {name}
                    <small className='block text-sm text-text-light'>{role}</small>
                  </Typography>
                  <div className='flex mb-2 justify-self-center'>
                    {Array(5)
                      .fill("")
                      .map((_, index) => (
                        <span key={index} className='text-yellow-500 text-lg'>
                          ★
                        </span>
                      ))}
                  </div>
                  <Typography className='text-text-light italic'>{`"${review}"`}</Typography>
                </CardBody>
              </Card>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
};

export default Testimonials;

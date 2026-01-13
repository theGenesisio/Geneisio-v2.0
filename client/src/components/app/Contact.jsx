import { EnvelopeIcon, MapPinIcon, PhoneIcon } from "@heroicons/react/24/solid";
import { openEmailClient } from "../../assets/helpers";
import React from "react";

const contactInfo = [
  {
    iconClass: <PhoneIcon className='w-7 h-7' />,
    title: "Phone Number",
    link: "tel:+1 (542) 000 1111",
    linkText: "+1 (542) 000 1111",
  },
  {
    iconClass: <EnvelopeIcon className='w-7 h-7' />,
    title: "Email",
    link: "mailto:notifications@genesisio.net",
    linkText: "notifications@genesisio.net",
  },
  {
    iconClass: <MapPinIcon className='w-7 h-7' />,
    title: "Address",
    link: null,
    linkText: "1900 Powell St, Emeryville, CA 94608",
  },
];

const Contact = () => {
  const [errors, setErrors] = React.useState({});
  const [success, setSuccess] = React.useState(false);

  const validateForm = (formData) => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[\w.-]+@[\w-]+\.[a-z]{2,4}$/i.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData);
    const validationErrors = validateForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    openEmailClient(
      "notifications@genesisio.net",
      values.subject || "Edit to match your complaint",
      values.comments || "I need help with..."
    );
    setSuccess(true);
    e.target.reset();
  };

  return (
    <section className='py-12'>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {contactInfo.map((info, index) => (
            <div key={index} className='text-center bg-primary-default shadow-lg rounded-lg p-6'>
              <div className='text-white mb-4 flex flex-row gap-4 justify-center text-center'>
                {info.iconClass}
              </div>
              <h5 className='font-semibold text-lg mb-2'>{info.title}</h5>
              {info.link ? (
                <a href={info.link} className='text-text-light hover:underline'>
                  {info.linkText}
                </a>
              ) : (
                <p className='text-text-light'>{info.linkText}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className='container mx-auto mt-16 px-4'>
        <div className='bg-primary-default shadow-lg rounded-lg p-8'>
          <h4 className='text-2xl font-semibold mb-6'>Get in Touch!</h4>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block font-medium text-text-light mb-1'>
                  Your Name <span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <input
                    name='name'
                    id='name'
                    type='text'
                    placeholder='e.g., John Doe'
                    className={`form-input w-full ${errors.name ? "border-red-500" : ""}`}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && <p className='text-red-500 text-sm mt-1'>{errors.name}</p>}
                </div>
              </div>
              <div>
                <label className='block font-medium text-text-light mb-1'>
                  Your Email <span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <input
                    name='email'
                    id='email'
                    type='email'
                    placeholder='Your email'
                    className={`form-input w-full ${errors.email ? "border-red-500" : ""}`}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email}</p>}
                </div>
              </div>
            </div>
            <div>
              <label className='block font-medium text-text-light mb-1'>Subject</label>
              <div className='relative'>
                <input
                  name='subject'
                  id='subject'
                  type='text'
                  placeholder='Subject'
                  className='form-input w-full'
                />
              </div>
            </div>
            <div>
              <label className='block font-medium text-text-light mb-1'>Comments</label>
              <div className='relative'>
                <textarea
                  name='comments'
                  id='comments'
                  rows='4'
                  placeholder='Your Message'
                  className='form-input w-full'></textarea>
              </div>
            </div>
            <div>
              <button type='submit' className='w-full accent-btn'>
                Send Message
              </button>
            </div>
          </form>
          {success && <p className='text-green-500 mt-4'>Message sent successfully!</p>}
        </div>
      </div>
    </section>
  );
};

export default Contact;

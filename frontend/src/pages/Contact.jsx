import React from "react";
import Footer from "../components/Footer";
import {
  FaEnvelope,
  FaFileContract,
  FaHeadphones,
  FaLocationDot,
  FaMessage,
  FaPhone,
} from "react-icons/fa6";
import Tittle from "../components/Tittle";

const Contact = () => {
  return (
    <section className="max-padd-container mt-24">
      {/*Contact form and Details*/}
      <div className="flex flex-col xl:flex-row gap-20 py-6">
        {/*Contact Form*/}
        <div>
          {/*Tittle*/}
          <Tittle title1={"Get "} title2={"in Touch"} titleStyles={"h3"} />
          <p className="mb-5 max-w-xl">
            Have questions or need help? Send us a message , and we all get back
            to you as soon possible
          </p>

          <form>
            <div className="flex gap-x-5">
              <div className="w-1/2 mb-4">
                <input
                  type="text"
                  id="name"
                  placeholder="Enter your name"
                  className="w-full mt-1 py-1.5 px-3 border-none ring-1 ring-slate-900/5 regular-14 rounded"
                />
              </div>

              <div className="w-1/2 mb-4">
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your Email"
                  className="w-full mt-1 py-1.5 px-3 border-none ring-1 ring-slate-900/5 regular-14 rounded"
                />
              </div>
            </div>

            <div className="mb-4">
              <textarea
                id="message"
                rows="4"
                placeholder="Write your message aqui"
                className="w-full mt-1 py-1.5 px-3 border-none ring-1 ring-slate-900/5 regular-14 rounded resize-none"
              ></textarea>
            </div>
            <button type="submit" className="btn-dark !rounded shadow-sm">
              Send Message
            </button>
          </form>
        </div>

        {/*Contact Details*/}
        <div>
          {/*tittle */}
          <Tittle title1={"Contact "} title2={"Details"} titleStyles={"h3"} />
          <p className="max-w-xl mb-4">
            We are always here to assist you! Feel Free to reach out to us
            through any of the following methods
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col">
              <h5 className="h5 capitalize mr-4">Location :</h5>
              <p className="flexStart gap-x-2">
                <FaLocationDot /> Food Street , Food City{" "}
              </p>
            </div>

            <div className="flex flex-col">
              <h5 className="h5 capitalize mr-4">Email :</h5>
              <p className="flexStart gap-x-2">
                <FaEnvelope /> Food@gmail.com{" "}
              </p>
            </div>

            <div className="flex flex-col">
              <h5 className="h5 capitalize mr-4">Phone :</h5>
              <p className="flexStart gap-x-2">
                <FaPhone /> (+53) 5555555
              </p>
            </div>

            <div className="flex flex-col">
              <h5 className="h5 capitalize mr-4">Support :</h5>
              <p className="flexStart gap-x-2">
                <FaHeadphones /> 24/7 Support is open
              </p>
            </div>
          </div>
        </div>
      </div>

      {/*Location Map*/}
      <div className="py-20">
        <Tittle title1={"Find"} title2={" us Here"} titleStyles={"h1"} />
        <div className="w-full h-96 rounded-lg overflow-hidden shadow-sm">
          <iframe
            className="w-full h-full"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29354.54581712761!2d-82.38796286848145!3d23.122040631624!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88cd79ba59e75879%3A0x1a4753dc1298f505!2sCapitolio%20Nacional%20de%20Cuba!5e0!3m2!1ses-419!2scu!4v1741537286448!5m2!1ses-419!2scu"
            allowfullscreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>

      <Footer/>
    </section>
  );
};

export default Contact;

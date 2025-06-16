import React from "react";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Process from "../components/Process";
import PopularFoods from "../components/PopularFoods";
import Promo from "../components/Promo";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <>
      <Hero />
      <Features />
      <Process />
      <PopularFoods />
      <Promo />
      <Footer />
    </>
  );
};

export default Home;

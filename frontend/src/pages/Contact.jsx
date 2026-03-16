import React from "react";
import Footer from "../components/Footer";
import {
  FaUtensils,
  FaHeart,
  FaTruck,
  FaStar,
} from "react-icons/fa6";
import Tittle from "../components/Tittle";

const About = () => {
  return (
    <section className="max-padd-container mt-24 px-4">
      {/* Sobre Nosotros */}
      <div className="py-10">
        <Tittle title1={"Sobre "} title2={"Nosotros"} titleStyles={"h3"} />
        
        <div className="max-w-3xl mx-auto text-center mt-6">
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
            <span className="font-bold text-secondary">Sudy's Food</span> nació en el corazón de La Habana con un sueño sencillo: 
            llevar el mejor sabor cubano directo a tu puerta. Somos una familia amante de la cocina criolla, 
            comprometidos con ofrecer platos hechos con ingredientes frescos, mucho sazón y esa pasión 
            que solo se encuentra en las cocinas cubanas.
          </p>
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
            Desde la clásica ropa vieja hasta los postres más dulces, cada plato que preparamos 
            lleva un pedacito de nuestra cultura y tradición. Creemos que la buena comida es la mejor 
            forma de unir a las personas, y eso es exactamente lo que hacemos todos los días.
          </p>
          <p className="text-gray-600 text-sm italic">
            "La comida cubana no es solo alimento, es identidad." 🇨🇺
          </p>
        </div>
      </div>

      {/* Valores */}
      <div className="py-10">
        <Tittle title1={"Nuestros "} title2={"Valores"} titleStyles={"h3"} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 text-center hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
              <FaUtensils className="text-secondary text-xl" />
            </div>
            <h4 className="font-bold text-lg mb-2">Calidad</h4>
            <p className="text-gray-600 text-sm">Ingredientes frescos y recetas auténticas en cada plato que servimos.</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 text-center hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
              <FaHeart className="text-secondary text-xl" />
            </div>
            <h4 className="font-bold text-lg mb-2">Pasión</h4>
            <p className="text-gray-600 text-sm">Cocinamos con el amor y la dedicación que caracteriza al pueblo cubano.</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 text-center hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
              <FaTruck className="text-secondary text-xl" />
            </div>
            <h4 className="font-bold text-lg mb-2">Rapidez</h4>
            <p className="text-gray-600 text-sm">Entregamos tu pedido caliente y a tiempo en toda La Habana.</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 text-center hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
              <FaStar className="text-secondary text-xl" />
            </div>
            <h4 className="font-bold text-lg mb-2">Sabroso</h4>
            <p className="text-gray-600 text-sm">Ese toquecito de la abuela que hace especial cada bocado.</p>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="py-10">
        <Tittle title1={"Encuéntranos"} title2={" Aquí"} titleStyles={"h3"} />
        <div className="w-full h-72 sm:h-96 rounded-lg overflow-hidden shadow-sm mt-6">
          <iframe
            className="w-full h-full"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29354.54581712761!2d-82.38796286848145!3d23.122040631624!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88cd79ba59e75879%3A0x1a4753dc1298f505!2sCapitolio%20Nacional%20de%20Cuba!5e0!3m2!1ses-419!2scu!4v1741537286448!5m2!1ses-419!2scu"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>

      <Footer/>
    </section>
  );
};

export default About;

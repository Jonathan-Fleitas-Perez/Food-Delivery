import { Link } from "react-router-dom";
import logo from "../assets/logoS.png";
import footer from "../assets/logoS.png";
//import footer from '../assets/footer.jpg'
import { FaInstagram } from "react-icons/fa6";
import { FaWhatsapp } from "react-icons/fa";


const Footer = () => {

  return (
    <footer className="max-padd-container flexStart pb-14 pt-20 bg-pattern bg-cover bg-no-repeat rounded-2xl">
      <div className="flex flex-col w-full">
        <div className="flex flex-col items-start justify-center gap-10 md:flex-row p-4 sm:p-8 rounded-t-xl">
          <div className="flex flex-wrap gap-10 sm:gap-16 w-full justify-between">
            {/* Logo y descripción */}
            <div className="max-w-60">
              <Link to={"/"} className="bold-24 flex flex-1 items-baseline">
                <img src={logo} alt="Logo de la empresa" height={24} width={24} className="flex" />
                <span className="text-secondary pl-2">Sudy's</span>{" "}
                <span className="pl-2">Food</span>
              </Link>

              <div>
                <p className="mt-3 text-sm">Sirviendo platos criollos hechos con los ingredientes más frescos todos los días.</p>
                <img src={footer} alt="Plato de comida cubana" className="rounded-md mt-6 w-36 sm:w-44" />
              </div>
            </div>

            {/* Navegación */}
            <div className="flex flex-col gap-4">
              <h4 className="bold-18 whitespace-nowrap">Navegación</h4>
              <ul className="flex flex-col gap-3 regular-14 text-gray-20">
                <Link to={'/'}>Inicio</Link>
                <Link to={'/menu'}>Menú</Link>
                <Link to={'/about'}>Sobre Nosotros</Link>
                <Link to={'/orders'}>Mis Pedidos</Link>
                <Link to={'/profile'}>Mi Perfil</Link>
              </ul>
            </div>

            {/* Contacto */}
            <div className="flex flex-col gap-4">
              <h4 className="bold-18 whitespace-nowrap">Contáctanos</h4>
              <div className="flex flex-col gap-3 regular-14">
                <p>📞 +53 52375485</p>
                <p>📧 info@sudysfood.cu</p>
                <p>📍 La Habana, Cuba</p>
              </div>
            </div>

            {/* Redes Sociales */}
            <div className="flex flex-col gap-4">
              <h4 className="bold-18">Síguenos</h4>
              <div className="flex gap-4">
                <a href="https://wa.me/5352375485" target="_blank" rel="noopener noreferrer" className="text-2xl text-green-600 hover:scale-110 transition-transform">
                  <FaWhatsapp/>
                </a>
                <a href="#" className="text-2xl text-pink-500 hover:scale-110 transition-transform">
                  <FaInstagram/>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-6 pt-4 text-center text-sm text-gray-500">
          <p>© 2026 Sudy's Food. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

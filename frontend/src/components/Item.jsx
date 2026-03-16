import React, { useContext, useState, useRef, useEffect } from "react";
import { FaStar, FaStarHalfStroke } from "react-icons/fa6";
import { TbShoppingBagPlus } from "react-icons/tb";
import { ShopConstest } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Modal from "./Modal";

const Item = ({ food }) => {
  const { currency, addToCart, refreshFoods, backendUrl } = useContext(ShopConstest);
  const { token } = useContext(ShopConstest);
  const navigate = useNavigate();
  
  const [isVisible, setIsVisible] = useState(false);
  const itemRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  // Observador de intersección para lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = itemRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const handleAddToCart = () => {
    if (!token) {
      toast.error("Debes iniciar sesión para agregar productos al carrito");
      navigate("/login");
      return;
    }
    addToCart(food._id);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "/placeholder-food.jpg";
    setImageLoaded(true);
  };

  const submitRating = async () => {
    if (!token) {
      toast.error("Debes iniciar sesión para calificar");
      navigate("/login");
      return;
    }
    try {
      setSubmittingRating(true);
      const res = await axios.post(
        `${backendUrl}/api/product/${food._id}/rate`,
        { rating, comment },
        { headers: { token } },
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setShowReviews(false);
        setComment("");
        refreshFoods();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al calificar");
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div
      ref={itemRef}
      className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
    >
      <div className="flexCenter py-6 px-4 bg-white">
        <div
          className={`relative w-[160px] h-[160px] ${!imageLoaded ? "bg-gray-100 animate-pulse rounded-xl" : ""}`}
        >
          {isVisible && (
            <img
              src={food.image}
              alt={food.name}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>
      </div>

      <div className="px-4 pb-4 flex-grow flex flex-col">
        <div className="mb-3">
          <h4 className="mb-1 font-bold text-base line-clamp-1">{food.name}</h4>
          <div className="flex items-start justify-between pb-1">
            <span className="text-sm text-gray-500">{food.category}</span>
            <div
              className="flex items-center justify-start gap-x-1 text-yellow-500 font-bold text-sm cursor-pointer hover:underline"
              title={`Ver ${food.totalReviews || 0} reseñas`}
              onClick={() => setShowReviews(!showReviews)}
            >
              {[...Array(5)].map((_, index) => {
                const avgRate = food.averageRating || 0;
                if (index < Math.floor(avgRate)) {
                  return <FaStar key={index} />;
                } else if (
                  index === Math.floor(avgRate) &&
                  !Number.isInteger(avgRate)
                ) {
                  return <FaStarHalfStroke key={index} />;
                } else {
                  return <FaStar className="text-gray-300" key={index} />;
                }
              })}
              <span className="text-gray-600 ml-1">
                {food.averageRating ? food.averageRating.toFixed(1) : "Nuevo"}
              </span>
            </div>
          </div>
          <p className="line-clamp-3 text-gray-600 text-sm">
            {food.description}
          </p>
        </div>

        <Modal
          isOpen={showReviews}
          onClose={() => setShowReviews(false)}
          title="Reseñas del Producto"
        >
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl font-bold text-gray-800">
                  {food.averageRating ? food.averageRating.toFixed(1) : "Nuevo"}
                </span>
                <div className="flex text-yellow-500 text-lg">
                  {[...Array(5)].map((_, index) => {
                    const avgRate = food.averageRating || 0;
                    if (index < Math.floor(avgRate))
                      return <FaStar key={index} />;
                    if (
                      index === Math.floor(avgRate) &&
                      !Number.isInteger(avgRate)
                    )
                      return <FaStarHalfStroke key={index} />;
                    return <FaStar className="text-gray-200" key={index} />;
                  })}
                </div>
              </div>
              <p className="text-sm text-gray-500">
                {food.totalReviews || 0} calificaciones en total
              </p>
            </div>

            <div className="flex-grow overflow-y-auto pr-1 mb-4 space-y-3 custom-scrollbar max-h-60">
              {!food.ratings || food.ratings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                  <FaStar className="text-4xl text-gray-200 mb-2" />
                  <p className="text-sm">
                    Sé el primero en opinar sobre este plato.
                  </p>
                </div>
              ) : (
                food.ratings.map((r, i) => (
                  <div
                    key={i}
                    className="bg-white p-3 rounded-lg border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                        <div className="w-6 h-6 bg-secondary/10 text-secondary rounded-full flex items-center justify-center font-bold text-xs">
                          {r.userName.charAt(0).toUpperCase()}
                        </div>
                        {r.userName}
                      </span>
                      <span className="text-yellow-500 text-xs flex gap-0.5 mt-1">
                        {[...Array(r.rating)].map((_, idx) => (
                          <FaStar key={idx} />
                        ))}
                        {[...Array(5 - r.rating)].map((_, idx) => (
                          <FaStar className="text-gray-200" key={idx} />
                        ))}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {r.comment}
                      </p>
                    )}
                    <span className="text-xs text-gray-400 mt-2 block">
                      {new Date(r.date || Date.now()).toLocaleDateString(
                        "es-ES",
                        { year: "numeric", month: "long", day: "numeric" },
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>

            {token ? (
              <div className="pt-4 border-t border-gray-100 mt-auto">
                <h4 className="font-semibold text-gray-800 text-sm mb-3">
                  Tu opinión nos importa
                </h4>
                <div className="flex items-center gap-2 text-2xl mb-3 justify-center">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <FaStar
                      key={num}
                      onClick={() => setRating(num)}
                      className={`cursor-pointer transition-all hover:scale-110 ${rating >= num ? "text-yellow-500 drop-shadow-sm" : "text-gray-200"}`}
                    />
                  ))}
                </div>
                <textarea
                  className="w-full border border-gray-200 p-3 text-sm rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all resize-none"
                  placeholder="¿Qué te pareció este plato? Escribe tu experiencia..."
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button
                  onClick={submitRating}
                  disabled={submittingRating}
                  className={`w-full text-white rounded-lg p-3 text-sm font-bold transition-all shadow-md
                            ${
                              submittingRating
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-[#FFB800] to-secondary hover:shadow-lg hover:-translate-y-0.5"
                            }`}
                >
                  {submittingRating ? "Publicando..." : "Publicar mi reseña"}
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-100 mt-auto text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Para dejar una reseña necesitas tu cuenta activa.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg p-3 text-sm font-bold transition-colors"
                >
                  Iniciar Sesión
                </button>
              </div>
            )}
          </div>
        </Modal>

        {/* Botón Añadir al carrito y Precio */}
        <div className="mt-auto mb-3 flex items-center justify-between">
          <div className="flex flex-col">
             <span className="text-gray-500 text-xs">Precio</span>
             <span className="font-bold text-secondary text-lg">
               {currency}{food.price}
             </span>
          </div>
          <button
            onClick={handleAddToCart}
            className="flexCenter gap-x-1 text-lg bg-secondary hover:bg-secondary-dark text-white rounded-full p-2 transition-colors shadow-md"
            aria-label="Agregar al carrito"
          >
            <TbShoppingBagPlus />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Item;

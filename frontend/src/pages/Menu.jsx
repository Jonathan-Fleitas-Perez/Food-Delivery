import React, { useContext, useEffect, useState, useRef } from "react";
import { RiSearch2Line } from "react-icons/ri";
import { LuSettings2 } from "react-icons/lu";
import { categories } from "../assets/data";
import Tittle from "../components/Tittle";
import Item from "../components/Item";
import { ShopConstest } from "../context/ShopContext";
import Footer from "../components/Footer";

const Menu = () => {
  const { foods, categories: dbCategories } = useContext(ShopConstest);
  const displayCategories = dbCategories.length > 0 ? dbCategories : categories;
  const [category, setCategory] = useState([]);
  const [sortType, setSortType] = useState("relavent");
  const [search, setSearch] = useState("");
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  
  // Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState(10);
  const loadingRef = useRef(null);

  const toggleFilter = (value, setState) => {
    setState((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const applyFilters = () => {
    let filtered = [...foods];

    if (search)
      filtered = filtered.filter((food) =>
        food.name.toLowerCase().includes(search.toLocaleLowerCase())
      );

    if (category.length)
      filtered = filtered.filter((food) => category.includes(food.category));

    return filtered;
  };

  const applySorting = (foodsList) => {
    const sortedFoods = [...foodsList];

    switch (sortType) {
      case "low":
        return sortedFoods.sort((a, b) => {
          const aPrice = Object.values(a.price)[0];
          const bPrice = Object.values(b.price)[0];
          return aPrice - bPrice;
        });

      case "high":
        return sortedFoods.sort((a, b) => {
          const aPrice = Object.values(a.price)[0];
          const bPrice = Object.values(b.price)[0];
          return bPrice - aPrice;
        });

      default:
        return sortedFoods;
    }
  };

  const toggleShowCategories = () => {
    setShowCategories(!showCategories);
  };

  // Effect to handle filtering and sorting
  useEffect(() => {
    let filtered = applyFilters();
    let sorted = applySorting(filtered);
    setFilteredFoods(sorted);
    setVisibleCount(10); // Reset count when filters change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sortType, foods, search]);

  // Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredFoods.length) {
          setVisibleCount((prev) => prev + 10);
        }
      },
      { threshold: 0.5 }
    );

    const currentLoadingRef = loadingRef.current;
    if (currentLoadingRef) {
      observer.observe(currentLoadingRef);
    }

    return () => {
      if (currentLoadingRef) {
        observer.unobserve(currentLoadingRef);
      }
    };
  }, [visibleCount, filteredFoods.length]);

  return (
    <section className="max-padd-container mt-24">
      {/*search box*/}
      <div className="w-full max-w-2xl flexCenter">
        <div className="inline-flex items-center justify-center bg-white overflow-hidden w-full rounded-full p-4 px-5">
          <div className="text-lg cursor-pointer">
            <RiSearch2Line />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Buscar..."
            className="border-none outline-none w-full text-sm pl-4"
          />
          <div
            onClick={toggleShowCategories}
            className="flexCenter cursor-pointer text-lg border-l pl-2"
          >
            <LuSettings2 />
          </div>
        </div>
      </div>

      {/*Categories filter */}
      {showCategories && (
        <div className="my-14">
          <h3 className="h4 mb-4 hidden sm:flex">Categories :</h3>
          <div className="flexCenter sm:flexStart flex-wrap gap-x-12 gap-y-4">
            {displayCategories.map((cat) => (
              <label key={cat.name}>
                <input
                  value={cat.name}
                  onChange={(e) => toggleFilter(e.target.value, setCategory)}
                  type="checkbox"
                  className="hidden peer"
                />

                <div className="flexCenter flex-col gap-2 peer-checked:text-secondary cursor-pointer">
                  <div className="bg-white h-20 w-20 flexCenter rounded-full">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="object-cover h-10 w-10"
                    />
                  </div>
                  <span className="medium-14">{cat.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/*Food container */}
      <div className="my-6 mb-20">
        {/*title and sort */}
        <div className="flexBetween !items-start gap-7 flex-wrap pb-16 max-sm:flexCenter text-center max-sm:pb-24">
          <Tittle
            title1={"Nuestros"}
            title2={" Platillos"}
            titleStyles={"!pb-0"}
            paraStyle={"!block"}
          />

          <div className="flexCenter gap-x-12">
            <span className="hidden sm:flex medium-16">Ordenar por :</span>
            <select
              onChange={(e) => setSortType(e.target.value)}
              className="text-sm p-2.5 outline-none bg-white text-gray-30 rounded"
            >
              <option value="relevant">Relevancia</option>
              <option value="low">Precio bajo</option>
              <option value="high">Precio alto</option>
            </select>
          </div>
        </div>
        {/*Foods */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 gap-y-12 sm:gap-y-36 mt-14 xl:mt-28">
          {filteredFoods.length > 0 ? (
            filteredFoods.slice(0, visibleCount).map((food) => <Item food={food} key={food._id} />)
          ) : (
            <p className="capitalize col-span-full text-center py-20 text-gray-400"> No se encontraron comidas con esos filtros</p>
          )}
        </div>

        {/* Loading Sentinel for Infinite Scroll */}
        {visibleCount < filteredFoods.length && (
          <div ref={loadingRef} className="flexCenter py-20 w-full">
             <div className="w-8 h-8 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Menu;

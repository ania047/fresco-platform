import React from "react";
import { FaLeaf, FaRegLightbulb, FaRecycle } from "react-icons/fa";
import { MdOutlineWaterDrop } from "react-icons/md";
import { GiCookingPot } from "react-icons/gi";

const AdviceSectionNewDesign = () => {
  return (
    <div className="min-h-screen bg-green-100 mt-24 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
            De ce este risipa alimentară o problemă?
          </h1>
          <p className="text-lg text-gray-600">
            Află cum poți contribui la reducerea risipei alimentare și la
            protejarea mediului.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300">
            <MdOutlineWaterDrop className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-blue-500 mb-2 text-center">
              25%
            </h2>
            <p className="text-gray-700 text-center">
              din apa dulce utilizată anual merge către producerea alimentelor
              care sunt risipite
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300">
            <FaLeaf className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-500 mb-2 text-center">
              15%
            </h2>
            <p className="text-gray-700 text-center">
              din suprafața pământului este folosită pentru alimente
              neconsumate.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300">
            <FaRecycle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-yellow-500 mb-2 text-center">
              $1.1T
            </h2>
            <p className="text-gray-700 text-center">
              se pierd anual în economie din cauza risipei alimentare.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-2xl p-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Cum poți evita risipa alimentară?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4 p-4 hover:bg-yellow-50 rounded-lg transition-all duration-300">
              <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-full">
                <FaRegLightbulb className="text-yellow-600 w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Planifică-ți cumpărăturile
                </h3>
                <p className="text-gray-600 mt-2">
                  Fă o listă detaliată înainte de a merge la cumpărături și
                  cumpără doar ce ai nevoie.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 hover:bg-red-50 rounded-lg transition-all duration-300">
              <div className="flex-shrink-0 bg-red-100 p-3 rounded-full">
                <GiCookingPot className="text-red-600 w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Gătește cu grijă
                </h3>
                <p className="text-gray-600 mt-2">
                  Folosește resturile pentru a crea rețete noi și savuroase,
                  evitând aruncarea alimentelor.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 hover:bg-green-50 rounded-lg transition-all duration-300">
              <div className="flex-shrink-0 bg-green-100 p-3 rounded-full">
                <FaRecycle className="text-green-600 w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Reciclează și Donează
                </h3>
                <p className="text-gray-600 mt-2">
                  Dacă ai alimente în exces, donează-le sau transformă-le pentru
                  a le reutiliza.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 hover:bg-blue-50 rounded-lg transition-all duration-300">
              <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                <MdOutlineWaterDrop className="text-blue-600 w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Păstrează corect alimentele
                </h3>
                <p className="text-gray-600 mt-2">
                  Stochează produsele alimentare în condiții optime pentru a le
                  prelungi durata de valabilitate.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdviceSectionNewDesign;

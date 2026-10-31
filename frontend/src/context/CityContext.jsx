import React, { createContext, useContext, useState, useEffect } from 'react';

const CityContext = createContext();

export const CITIES = ['Indore', 'Bhopal', 'Mumbai', 'Delhi', 'Pune', 'Bengaluru'];

export const CityProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('imovies_city') || 'Indore';
  });

  const changeCity = (cityName) => {
    setSelectedCity(cityName);
    localStorage.setItem('imovies_city', cityName);
  };

  return (
    <CityContext.Provider
      value={{
        selectedCity,
        changeCity,
        availableCities: CITIES
      }}
    >
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => useContext(CityContext);


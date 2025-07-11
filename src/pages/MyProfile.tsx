import React, { useState, useEffect } from "react";
import { extractCurrentUserProfileData } from "../services/profileDataExtractor";
import {
  UserProfileData,
  updateUserProfile,
} from "../services/userProfileService";
import {
  getSelectionValue,
  isOtherValue,
} from "../services/profileDataExtractor";

const MyProfile: React.FC = () => {
  // State for user data directly from database
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Add state for unit preferences (UI only, not stored in DB)
  const [heightUnit, setHeightUnit] = useState<"metric" | "imperial">("metric");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");

  // Add state for "Other" selections
  const [selectedDiet, setSelectedDiet] = useState<string>("");
  const [selectedAllergy, setSelectedAllergy] = useState<string>("");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("");
  const [selectedMedication, setSelectedMedication] = useState<string>("");

  // Map to handle displaying existing ethnicity values in the country dropdown
  const [displayEthnicity, setDisplayEthnicity] = useState<string>("");

  // Mapping of ethnicity values to countries for backward compatibility
  const ethnicityToCountryMap: Record<string, string> = {
    Asian: "China", // Default Asian to China for display purposes
    White: "United States", // Default White to USA for display purposes
    "African American": "United States", // Default African American to USA
    "Native Hawaiian or Other Pacific Islander": "United States",
    "American Indian or Alaska Native": "United States",
    "Hispanic or Latino": "Mexico", // Default Hispanic/Latino to Mexico
  };

  // Add state for imperial height
  const [feet, setFeet] = useState<string>("");
  const [inches, setInches] = useState<string>("");

  // Function to convert height units
  const convertHeight = (feet: string, inches: string): number => {
    if (!feet && !inches) return 0;
    const totalInches = (parseInt(feet) || 0) * 12 + (parseInt(inches) || 0);
    return Math.round(totalInches * 2.54); // Convert to cm
  };

  // Function to convert weight units
  const convertWeight = (weight: string, unit: "kg" | "lbs"): number => {
    if (!weight) return 0;
    const weightNum = parseFloat(weight);
    return unit === "kg" ? weightNum : Math.round(weightNum / 2.205); // Convert lbs to kg
  };

  // Function to map ethnicity to country for display purposes
  const mapEthnicityToCountry = (ethnicity: string | null): string => {
    if (!ethnicity) return "";

    // If ethnicity is already a country name, return it
    const allCountries = getCountryOptions().map((option) => option.value);
    if (allCountries.includes(ethnicity)) {
      return ethnicity;
    }

    // Otherwise map from ethnicity to country
    return ethnicityToCountryMap[ethnicity] || "";
  };

  // Add BMR calculation functions
  const calculateBMR = (
    weight: number,
    height: number,
    age: number,
    gender: string
  ): number => {
    if (gender === "Male") {
      return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    } else {
      return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const validateBMR = (enteredBMR: number, calculatedBMR: number): boolean => {
    return Math.abs(enteredBMR - calculatedBMR) <= 300;
  };

  // 添加数组字段列表
  const arrayFields = [
    "food_allergies",
    "dietary_preferences",
    "favorite_cuisines",
    "blood_sugar_goals",
  ];

  // 添加数据转换函数
  const convertEnumValues = (data: UserProfileData): UserProfileData => {
    const convertedData = { ...data };

    // 转换 physical_activity_level
    if (convertedData.physical_activity_level) {
      const activityMap: Record<string, string> = {
        Sedentary: "Sedentary",
        "Lightly active": "Lightly active",
        "Moderately active": "Moderately active",
        "Very active": "Very active",
        SEDENTARY: "Sedentary",
        LIGHTLY_ACTIVE: "Lightly active",
        MODERATELY_ACTIVE: "Moderately active",
        VERY_ACTIVE: "Very active",
      };
      convertedData.physical_activity_level =
        activityMap[convertedData.physical_activity_level] ||
        convertedData.physical_activity_level;
    }

    // 转换 cooking_frequency
    if (convertedData.cooking_frequency) {
      const frequencyMap: Record<string, string> = {
        "Multiple times a day": "Multiple times a day",
        "Once a day": "Once a day",
        "Multiple times a week": "Multiple times a week",
        "Once a week": "Once a week",
        Rarely: "Rarely",
        MULTIPLE_DAILY: "Multiple times a day",
        ONCE_DAILY: "Once a day",
        MULTIPLE_WEEKLY: "Multiple times a week",
        ONCE_WEEKLY: "Once a week",
        RARELY: "Rarely",
      };
      convertedData.cooking_frequency =
        frequencyMap[convertedData.cooking_frequency] ||
        convertedData.cooking_frequency;
    }

    // 确保数组字段是数组格式
    arrayFields.forEach((field) => {
      const value = (convertedData as any)[field];
      if (value && !Array.isArray(value)) {
        (convertedData as any)[field] = [value];
      }
    });

    return convertedData;
  };

  // Database extraction function - Fetches all profile data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const profileData = await extractCurrentUserProfileData();
        console.log("Fetched user profile data from database:", profileData);

        // 转换数据
        const convertedData = convertEnumValues(profileData);
        setUserData(convertedData);

        // Set form values based on database data
        if (convertedData) {
          // Map ethnicity to country for display if needed
          if (convertedData.ethnicity) {
            setDisplayEthnicity(mapEthnicityToCountry(convertedData.ethnicity));
            console.log(
              `Mapping ethnicity "${
                convertedData.ethnicity
              }" to "${mapEthnicityToCountry(
                convertedData.ethnicity
              )}" for display`
            );
          }

          // Convert height to feet/inches if needed for UI display
          if (convertedData.height && heightUnit === "imperial") {
            const totalInches = convertedData.height / 2.54;
            const calculatedFeet = Math.floor(totalInches / 12).toString();
            const calculatedInches = Math.round(totalInches % 12).toString();
            setFeet(calculatedFeet);
            setInches(calculatedInches);
          }

          // Set diet type if available
          if (convertedData.typical_diet) {
            setSelectedDiet(getSelectionValue(convertedData.typical_diet));
          }

          // Set food allergies if available and not None
          if (
            convertedData.food_allergies &&
            convertedData.food_allergies.length > 0 &&
            convertedData.food_allergies[0] !== "None"
          ) {
            setSelectedAllergy(
              getSelectionValue(convertedData.food_allergies[0])
            );
          }

          // Set favorite cuisines if available
          if (
            convertedData.favorite_cuisines &&
            convertedData.favorite_cuisines.length > 0
          ) {
            setSelectedCuisine(
              getSelectionValue(convertedData.favorite_cuisines[0])
            );
          }

          // Set medication selection if user takes medication
          if (convertedData.takes_medication && convertedData.medications) {
            setSelectedMedication(convertedData.medications);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error extracting user data from database:", err);
        setError(
          "Failed to load user data from database. Please try again later."
        );
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Function to get country options
  const getCountryOptions = () => [
    { value: "", label: "Select country" },
    { value: "Afghanistan", label: "Afghanistan" },
    { value: "Albania", label: "Albania" },
    { value: "Algeria", label: "Algeria" },
    { value: "Andorra", label: "Andorra" },
    { value: "Angola", label: "Angola" },
    { value: "Antigua and Barbuda", label: "Antigua and Barbuda" },
    { value: "Argentina", label: "Argentina" },
    { value: "Armenia", label: "Armenia" },
    { value: "Australia", label: "Australia" },
    { value: "Austria", label: "Austria" },
    { value: "Azerbaijan", label: "Azerbaijan" },
    { value: "Bahamas", label: "Bahamas" },
    { value: "Bahrain", label: "Bahrain" },
    { value: "Bangladesh", label: "Bangladesh" },
    { value: "Barbados", label: "Barbados" },
    { value: "Belarus", label: "Belarus" },
    { value: "Belgium", label: "Belgium" },
    { value: "Belize", label: "Belize" },
    { value: "Benin", label: "Benin" },
    { value: "Bhutan", label: "Bhutan" },
    { value: "Bolivia", label: "Bolivia" },
    { value: "Bosnia and Herzegovina", label: "Bosnia and Herzegovina" },
    { value: "Botswana", label: "Botswana" },
    { value: "Brazil", label: "Brazil" },
    { value: "Brunei", label: "Brunei" },
    { value: "Bulgaria", label: "Bulgaria" },
    { value: "Burkina Faso", label: "Burkina Faso" },
    { value: "Burundi", label: "Burundi" },
    { value: "Cabo Verde", label: "Cabo Verde" },
    { value: "Cambodia", label: "Cambodia" },
    { value: "Cameroon", label: "Cameroon" },
    { value: "Canada", label: "Canada" },
    { value: "Central African Republic", label: "Central African Republic" },
    { value: "Chad", label: "Chad" },
    { value: "Chile", label: "Chile" },
    { value: "China", label: "China" },
    { value: "Colombia", label: "Colombia" },
    { value: "Comoros", label: "Comoros" },
    { value: "Congo", label: "Congo" },
    { value: "Costa Rica", label: "Costa Rica" },
    { value: "Croatia", label: "Croatia" },
    { value: "Cuba", label: "Cuba" },
    { value: "Cyprus", label: "Cyprus" },
    { value: "Czech Republic", label: "Czech Republic" },
    { value: "Denmark", label: "Denmark" },
    { value: "Djibouti", label: "Djibouti" },
    { value: "Dominica", label: "Dominica" },
    { value: "Dominican Republic", label: "Dominican Republic" },
    { value: "East Timor", label: "East Timor" },
    { value: "Ecuador", label: "Ecuador" },
    { value: "Egypt", label: "Egypt" },
    { value: "El Salvador", label: "El Salvador" },
    { value: "Equatorial Guinea", label: "Equatorial Guinea" },
    { value: "Eritrea", label: "Eritrea" },
    { value: "Estonia", label: "Estonia" },
    { value: "Eswatini", label: "Eswatini" },
    { value: "Ethiopia", label: "Ethiopia" },
    { value: "Fiji", label: "Fiji" },
    { value: "Finland", label: "Finland" },
    { value: "France", label: "France" },
    { value: "Gabon", label: "Gabon" },
    { value: "Gambia", label: "Gambia" },
    { value: "Georgia", label: "Georgia" },
    { value: "Germany", label: "Germany" },
    { value: "Ghana", label: "Ghana" },
    { value: "Greece", label: "Greece" },
    { value: "Grenada", label: "Grenada" },
    { value: "Guatemala", label: "Guatemala" },
    { value: "Guinea", label: "Guinea" },
    { value: "Guinea-Bissau", label: "Guinea-Bissau" },
    { value: "Guyana", label: "Guyana" },
    { value: "Haiti", label: "Haiti" },
    { value: "Honduras", label: "Honduras" },
    { value: "Hungary", label: "Hungary" },
    { value: "Iceland", label: "Iceland" },
    { value: "India", label: "India" },
    { value: "Indonesia", label: "Indonesia" },
    { value: "Iran", label: "Iran" },
    { value: "Iraq", label: "Iraq" },
    { value: "Ireland", label: "Ireland" },
    { value: "Israel", label: "Israel" },
    { value: "Italy", label: "Italy" },
    { value: "Jamaica", label: "Jamaica" },
    { value: "Japan", label: "Japan" },
    { value: "Jordan", label: "Jordan" },
    { value: "Kazakhstan", label: "Kazakhstan" },
    { value: "Kenya", label: "Kenya" },
    { value: "Kiribati", label: "Kiribati" },
    { value: "Korea, North", label: "Korea, North" },
    { value: "Korea, South", label: "Korea, South" },
    { value: "Kosovo", label: "Kosovo" },
    { value: "Kuwait", label: "Kuwait" },
    { value: "Kyrgyzstan", label: "Kyrgyzstan" },
    { value: "Laos", label: "Laos" },
    { value: "Latvia", label: "Latvia" },
    { value: "Lebanon", label: "Lebanon" },
    { value: "Lesotho", label: "Lesotho" },
    { value: "Liberia", label: "Liberia" },
    { value: "Libya", label: "Libya" },
    { value: "Liechtenstein", label: "Liechtenstein" },
    { value: "Lithuania", label: "Lithuania" },
    { value: "Luxembourg", label: "Luxembourg" },
    { value: "Madagascar", label: "Madagascar" },
    { value: "Malawi", label: "Malawi" },
    { value: "Malaysia", label: "Malaysia" },
    { value: "Maldives", label: "Maldives" },
    { value: "Mali", label: "Mali" },
    { value: "Malta", label: "Malta" },
    { value: "Marshall Islands", label: "Marshall Islands" },
    { value: "Mauritania", label: "Mauritania" },
    { value: "Mauritius", label: "Mauritius" },
    { value: "Mexico", label: "Mexico" },
    { value: "Micronesia", label: "Micronesia" },
    { value: "Moldova", label: "Moldova" },
    { value: "Monaco", label: "Monaco" },
    { value: "Mongolia", label: "Mongolia" },
    { value: "Montenegro", label: "Montenegro" },
    { value: "Morocco", label: "Morocco" },
    { value: "Mozambique", label: "Mozambique" },
    { value: "Myanmar", label: "Myanmar" },
    { value: "Namibia", label: "Namibia" },
    { value: "Nauru", label: "Nauru" },
    { value: "Nepal", label: "Nepal" },
    { value: "Netherlands", label: "Netherlands" },
    { value: "New Zealand", label: "New Zealand" },
    { value: "Nicaragua", label: "Nicaragua" },
    { value: "Niger", label: "Niger" },
    { value: "Nigeria", label: "Nigeria" },
    { value: "North Macedonia", label: "North Macedonia" },
    { value: "Norway", label: "Norway" },
    { value: "Oman", label: "Oman" },
    { value: "Pakistan", label: "Pakistan" },
    { value: "Palau", label: "Palau" },
    { value: "Palestine", label: "Palestine" },
    { value: "Panama", label: "Panama" },
    { value: "Papua New Guinea", label: "Papua New Guinea" },
    { value: "Paraguay", label: "Paraguay" },
    { value: "Peru", label: "Peru" },
    { value: "Philippines", label: "Philippines" },
    { value: "Poland", label: "Poland" },
    { value: "Portugal", label: "Portugal" },
    { value: "Qatar", label: "Qatar" },
    { value: "Romania", label: "Romania" },
    { value: "Russia", label: "Russia" },
    { value: "Rwanda", label: "Rwanda" },
    { value: "Saint Kitts and Nevis", label: "Saint Kitts and Nevis" },
    { value: "Saint Lucia", label: "Saint Lucia" },
    {
      value: "Saint Vincent and the Grenadines",
      label: "Saint Vincent and the Grenadines",
    },
    { value: "Samoa", label: "Samoa" },
    { value: "San Marino", label: "San Marino" },
    { value: "Sao Tome and Principe", label: "Sao Tome and Principe" },
    { value: "Saudi Arabia", label: "Saudi Arabia" },
    { value: "Senegal", label: "Senegal" },
    { value: "Serbia", label: "Serbia" },
    { value: "Seychelles", label: "Seychelles" },
    { value: "Sierra Leone", label: "Sierra Leone" },
    { value: "Singapore", label: "Singapore" },
    { value: "Slovakia", label: "Slovakia" },
    { value: "Slovenia", label: "Slovenia" },
    { value: "Solomon Islands", label: "Solomon Islands" },
    { value: "Somalia", label: "Somalia" },
    { value: "South Africa", label: "South Africa" },
    { value: "South Sudan", label: "South Sudan" },
    { value: "Spain", label: "Spain" },
    { value: "Sri Lanka", label: "Sri Lanka" },
    { value: "Sudan", label: "Sudan" },
    { value: "Suriname", label: "Suriname" },
    { value: "Sweden", label: "Sweden" },
    { value: "Switzerland", label: "Switzerland" },
    { value: "Syria", label: "Syria" },
    { value: "Taiwan", label: "Taiwan" },
    { value: "Tajikistan", label: "Tajikistan" },
    { value: "Tanzania", label: "Tanzania" },
    { value: "Thailand", label: "Thailand" },
    { value: "Togo", label: "Togo" },
    { value: "Tonga", label: "Tonga" },
    { value: "Trinidad and Tobago", label: "Trinidad and Tobago" },
    { value: "Tunisia", label: "Tunisia" },
    { value: "Turkey", label: "Turkey" },
    { value: "Turkmenistan", label: "Turkmenistan" },
    { value: "Tuvalu", label: "Tuvalu" },
    { value: "Uganda", label: "Uganda" },
    { value: "Ukraine", label: "Ukraine" },
    { value: "United Arab Emirates", label: "United Arab Emirates" },
    { value: "United Kingdom", label: "United Kingdom" },
    { value: "United States", label: "United States" },
    { value: "Uruguay", label: "Uruguay" },
    { value: "Uzbekistan", label: "Uzbekistan" },
    { value: "Vanuatu", label: "Vanuatu" },
    { value: "Vatican City", label: "Vatican City" },
    { value: "Venezuela", label: "Venezuela" },
    { value: "Vietnam", label: "Vietnam" },
    { value: "Yemen", label: "Yemen" },
    { value: "Zambia", label: "Zambia" },
    { value: "Zimbabwe", label: "Zimbabwe" },
    { value: "Other (please specify)", label: "Other (please specify)" },
  ];

  // Submit updated profile to database
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (userData) {
        // 转换数据后再提交
        const convertedData = convertEnumValues(userData);
        const result = await updateUserProfile(convertedData);
      }
    } catch (error) {
      console.error("Error updating database with profile data:", error);
      setError("Failed to update database with profile data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading profile data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  // Helper functions for determining option values
  const getDietTypeOptions = () => [
    "Strict Vegetarian",
    "Vegetarian",
    "Pescatarian",
    "Omnivorous",
    "Low-Carb",
    "Gluten-Free",
    "Dairy-Free",
    "Keto",
    "Paleo",
    "None",
  ];

  const getAllergyOptions = () => [
    "None",
    "Peanuts",
    "Tree nuts",
    "Shellfish",
    "Fish",
    "Soy",
    "Milk",
    "Eggs",
    "Wheat",
    "Gluten",
    "Sesame seeds",
  ];

  const getCuisineOptions = () => [
    "Asian",
    "American",
    "Mexican",
    "Indian",
    "French",
    "Greek",
    "Middle Eastern",
    "Spanish",
    "Italian",
  ];

  const getMedicationOptions = () => [
    "Metformin",
    "Glipizide",
    "Glyburide",
    "Liraglutide",
    "Semaglutide",
    "Dapagliflozin",
    "Empagliflozin",
    "Insulin glargine",
    "Insulin detemir",
    "Insulin Lispro",
    "Insulin Aspart",
  ];

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-6">
        {userData?.name ? `${userData.name}'s Profile` : "My Profile"}
      </h1>

      {loading && (
        <p className="text-center">Loading profile data from database...</p>
      )}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && (
        <form onSubmit={handleSubmit}>
          {/* 1. Basic Information Section */}
          <div className="mb-6 bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h2 className="text-lg font-medium text-orange-600">
                1. Basic Information
              </h2>
            </div>
            <div className="p-4 space-y-4">
              {/* Date of Birth - Directly linked to database */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What is your date of birth?
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  id="date_of_birth"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  value={userData?.date_of_birth || ""}
                  onChange={(e) =>
                    setUserData({ ...userData!, date_of_birth: e.target.value })
                  }
                />
              </div>

              {/* Height - Directly linked to database */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What is your height?
                </label>
                <div className="flex">
                  {heightUnit === "metric" ? (
                    <input
                      type="number"
                      name="height"
                      id="height"
                      placeholder="Height in cm"
                      className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-orange-500 focus:border-orange-500"
                      value={userData?.height || ""}
                      onChange={(e) =>
                        setUserData({
                          ...userData!,
                          height: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  ) : (
                    <div className="flex flex-1">
                      <input
                        type="number"
                        name="feet"
                        id="feet"
                        placeholder="Feet"
                        value={feet}
                        onChange={(e) => {
                          setFeet(e.target.value);
                          if (userData && e.target.value && inches) {
                            setUserData({
                              ...userData,
                              height: convertHeight(e.target.value, inches),
                            });
                          }
                        }}
                        className="w-1/2 p-2 border border-gray-300 rounded-l-md focus:ring-orange-500 focus:border-orange-500"
                      />
                      <input
                        type="number"
                        name="inches"
                        id="inches"
                        placeholder="Inches"
                        value={inches}
                        onChange={(e) => {
                          setInches(e.target.value);
                          if (userData && feet && e.target.value) {
                            setUserData({
                              ...userData,
                              height: convertHeight(feet, e.target.value),
                            });
                          }
                        }}
                        className="w-1/2 p-2 border-t border-b border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  )}
                  <select
                    value={heightUnit}
                    onChange={(e) =>
                      setHeightUnit(e.target.value as "metric" | "imperial")
                    }
                    className="p-2 text-xs border border-gray-300 rounded-r-md focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                  >
                    <option value="metric">cm</option>
                    <option value="imperial">ft/in</option>
                  </select>
                </div>
              </div>

              {/* Weight - Directly linked to database */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What is your weight?
                </label>
                <div className="flex">
                  <input
                    type="number"
                    name="weight"
                    id="weight"
                    placeholder={
                      weightUnit === "kg" ? "Weight in kg" : "Weight in lbs"
                    }
                    className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-orange-500 focus:border-orange-500"
                    value={userData?.weight || ""}
                    onChange={(e) => {
                      if (weightUnit === "kg") {
                        setUserData({
                          ...userData!,
                          weight: parseFloat(e.target.value) || 0,
                        });
                      } else {
                        // Convert from lbs to kg for database storage
                        setUserData({
                          ...userData!,
                          weight: convertWeight(e.target.value, "lbs"),
                        });
                      }
                    }}
                  />
                  <select
                    value={weightUnit}
                    onChange={(e) =>
                      setWeightUnit(e.target.value as "kg" | "lbs")
                    }
                    className="p-2 text-xs border border-gray-300 rounded-r-md focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                  </select>
                </div>
              </div>

              {/* Gender - Directly linked to database */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What is your gender?
                </label>
                <select
                  name="gender"
                  id="gender"
                  value={userData?.gender || ""}
                  onChange={(e) =>
                    setUserData({ ...userData!, gender: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* Ethnicity - Directly linked to database */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What is your ethnicity?
                </label>
                <select
                  name="ethnicity"
                  id="ethnicity"
                  value={displayEthnicity || ""}
                  onChange={(e) => {
                    setDisplayEthnicity(e.target.value);
                    setUserData({ ...userData!, ethnicity: e.target.value });
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                >
                  {getCountryOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {userData?.ethnicity === "Other (please specify)" && (
                  <input
                    type="text"
                    placeholder="Please specify your country"
                    className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                )}
              </div>
            </div>
          </div>

          {/* 2. Dietary Habits Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h2 className="text-lg font-medium text-orange-600">
                2. Dietary Habits
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Typical Diet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What is your typical diet?
                </label>
                <select
                  name="typical_diet"
                  id="typical_diet"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  value={userData?.typical_diet || ""}
                  onChange={(e) =>
                    setUserData({ ...userData!, typical_diet: e.target.value })
                  }
                >
                  <option value="">Select diet type</option>
                  <option value="Strict Vegetarian">
                    Strict Vegetarian: No meat, poultry, or fish, but includes
                    eggs and dairy
                  </option>
                  <option value="Vegetarian">
                    Vegetarian: No meat, poultry, or fish, but may include eggs,
                    dairy, and other animal products
                  </option>
                  <option value="Pescatarian">
                    Pescatarian: Vegetarian with the addition of fish
                  </option>
                  <option value="Omnivorous">
                    Omnivorous: Eats a variety of foods, including meat,
                    poultry, fish, and plant-based foods
                  </option>
                  <option value="Low-Carb">
                    Low-Carb: Restricts carbohydrate intake, focusing on
                    proteins and fats
                  </option>
                  <option value="Gluten-Free">
                    Gluten-Free: Avoids gluten-containing grains like wheat,
                    barley, and rye
                  </option>
                  <option value="Dairy-Free">
                    Dairy-Free: Excludes dairy products like milk, cheese, and
                    yogurt
                  </option>
                  <option value="Keto">
                    Keto: High-fat, low-carb diet to induce ketosis
                  </option>
                  <option value="Paleo">
                    Paleo: Mimics the diet of our Paleolithic ancestors,
                    focusing on meats, fish, fruits, and vegetables
                  </option>
                  <option value="None">None</option>
                  <option value="Other (please specify)">
                    Other (please specify)
                  </option>
                </select>
                {/* Other Diet Specification */}
                {userData?.typical_diet === "Other (please specify)" && (
                  <input
                    type="text"
                    name="other_diet"
                    id="other_diet"
                    placeholder="If other, please specify"
                    className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                )}
              </div>

              {/* Food Allergies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Do you have any food allergies or intolerances?
                </label>
                <select
                  name="food_allergies"
                  id="food_allergies"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  value={
                    userData?.food_allergies &&
                    userData.food_allergies.length > 0
                      ? userData.food_allergies[0]
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    setUserData({
                      ...userData!,
                      food_allergies: value ? [value] : [],
                    });
                  }}
                >
                  <option value="">Select allergy</option>
                  <option value="None">None</option>
                  <option value="Peanuts">Peanuts</option>
                  <option value="Tree nuts">
                    Tree nuts (e.g., walnuts, almonds, hazelnuts)
                  </option>
                  <option value="Shellfish">
                    Shellfish (e.g., shrimp, crab, lobster)
                  </option>
                  <option value="Fish">Fish (e.g., tuna, salmon, cod)</option>
                  <option value="Soy">Soy</option>
                  <option value="Milk">Milk</option>
                  <option value="Eggs">Eggs</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Gluten">Gluten</option>
                  <option value="Sesame seeds">Sesame seeds</option>
                  <option value="Other (please specify)">
                    Other (please specify)
                  </option>
                </select>
                {/* Other Allergies Specification */}
                {userData?.food_allergies &&
                  userData.food_allergies.length > 0 &&
                  userData.food_allergies[0] === "Other (please specify)" && (
                    <input
                      type="text"
                      name="other_allergies"
                      id="other_allergies"
                      placeholder="If other allergies, please specify"
                      className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  )}
              </div>

              {/* Meals per Day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  How many meals do you usually eat per day?
                </label>
                <input
                  type="number"
                  name="meals_per_day"
                  id="meals_per_day"
                  min="1"
                  value={userData?.meals_per_day || ""}
                  onChange={(e) =>
                    setUserData({
                      ...userData!,
                      meals_per_day: parseInt(e.target.value),
                    })
                  }
                  placeholder="Enter number of meals"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Cooking Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  How frequently do you cook at home?
                </label>
                <select
                  name="cooking_frequency"
                  id="cooking_frequency"
                  value={userData?.cooking_frequency || ""}
                  onChange={(e) =>
                    setUserData({
                      ...userData!,
                      cooking_frequency: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select frequency</option>
                  <option value="Multiple times a day">
                    Multiple times a day
                  </option>
                  <option value="Once a day">Once a day</option>
                  <option value="Multiple times a week">
                    Multiple times a week
                  </option>
                  <option value="Once a week">Once a week</option>
                  <option value="Rarely">Rarely</option>
                </select>
              </div>

              {/* Cuisine Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What types of cuisines do you enjoy the most?
                </label>
                <select
                  name="favorite_cuisines"
                  id="favorite_cuisines"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  value={
                    userData?.favorite_cuisines &&
                    userData.favorite_cuisines.length > 0
                      ? userData.favorite_cuisines[0]
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    setUserData({
                      ...userData!,
                      favorite_cuisines: value ? [value] : [],
                    });
                  }}
                >
                  <option value="">Select cuisine</option>
                  <option value="Asian">Asian</option>
                  <option value="American">American</option>
                  <option value="Mexican">Mexican</option>
                  <option value="Indian">Indian</option>
                  <option value="French">French</option>
                  <option value="Greek">Greek</option>
                  <option value="Middle Eastern">Middle Eastern</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Italian">Italian</option>
                  <option value="Other (please specify)">
                    Other (please specify)
                  </option>
                </select>
                {/* Other Cuisine Specification */}
                {userData?.favorite_cuisines &&
                  userData.favorite_cuisines.length > 0 &&
                  userData.favorite_cuisines[0] ===
                    "Other (please specify)" && (
                    <input
                      type="text"
                      name="other_cuisine"
                      id="other_cuisine"
                      placeholder="If other cuisines, please specify"
                      className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  )}
              </div>

              {/* Favorite Foods */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What is your favorite dish or type of food?
                </label>
                <input
                  type="text"
                  name="favorite_foods"
                  id="favorite_foods"
                  value={userData?.favorite_foods || ""}
                  onChange={(e) =>
                    setUserData({
                      ...userData!,
                      favorite_foods: e.target.value,
                    })
                  }
                  placeholder="Enter your favorite foods"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Disliked Foods */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What is your most hated dish or type of food?
                </label>
                <input
                  type="text"
                  name="disliked_foods"
                  id="disliked_foods"
                  value={userData?.disliked_foods || ""}
                  onChange={(e) =>
                    setUserData({
                      ...userData!,
                      disliked_foods: e.target.value,
                    })
                  }
                  placeholder="Enter foods you dislike"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Health Status Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h2 className="text-lg font-medium text-orange-600">
                3. Health Status
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* 1. BMR Measurement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Have you ever measured your Basal Metabolic Rate (BMR)?
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="bmr_measured"
                      value="yes"
                      checked={userData?.bmr_measured === true}
                      onChange={() =>
                        setUserData({ ...userData!, bmr_measured: true })
                      }
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="bmr_measured"
                      value="no"
                      checked={userData?.bmr_measured === false}
                      onChange={() => {
                        // When user selects "No", calculate BMR automatically
                        if (
                          userData?.weight &&
                          userData?.height &&
                          userData?.date_of_birth &&
                          userData?.gender
                        ) {
                          const age = calculateAge(userData.date_of_birth);
                          const calculatedBMR = Math.round(
                            calculateBMR(
                              userData.weight,
                              userData.height,
                              age,
                              userData.gender
                            )
                          );
                          setUserData({
                            ...userData!,
                            bmr_measured: false,
                            bmr_value: calculatedBMR,
                          });
                        } else {
                          setUserData({ ...userData!, bmr_measured: false });
                          alert(
                            "Please fill in your weight, height, date of birth, and gender to calculate BMR automatically."
                          );
                        }
                      }}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm">No</span>
                  </label>
                </div>
              </div>

              {/* 2. BMR Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What is your Basal Metabolic Rate (BMR) in calories per day?
                  {!userData?.bmr_measured && userData?.bmr_value && (
                    <span className="text-sm text-gray-500 ml-2">
                      (Calculated based on your profile)
                    </span>
                  )}
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    name="bmr_value"
                    id="bmr_value"
                    value={userData?.bmr_value || ""}
                    onChange={(e) => {
                      const enteredBMR = parseInt(e.target.value);
                      if (
                        userData?.weight &&
                        userData?.height &&
                        userData?.date_of_birth &&
                        userData?.gender
                      ) {
                        const age = calculateAge(userData.date_of_birth);
                        const calculatedBMR = Math.round(
                          calculateBMR(
                            userData.weight,
                            userData.height,
                            age,
                            userData.gender
                          )
                        );

                        if (!validateBMR(enteredBMR, calculatedBMR)) {
                          alert(
                            `Warning: The entered BMR (${enteredBMR}) deviates significantly from our calculated estimate (${calculatedBMR}). Please verify your entry.`
                          );
                        }
                      }
                      setUserData({ ...userData!, bmr_value: enteredBMR });
                    }}
                    placeholder="Enter BMR in calories"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                  {userData?.weight &&
                    userData?.height &&
                    userData?.date_of_birth &&
                    userData?.gender && (
                      <p className="text-sm text-gray-500">
                        Estimated BMR based on your profile:{" "}
                        {Math.round(
                          calculateBMR(
                            userData.weight,
                            userData.height,
                            calculateAge(userData.date_of_birth),
                            userData.gender
                          )
                        )}{" "}
                        calories/day
                      </p>
                    )}
                </div>
              </div>

              {/* 3. Diabetes Diagnosis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Have you been diagnosed with a condition related to blood
                  sugar or diabetes?
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="has_diabetes"
                      value="yes"
                      checked={userData?.has_diabetes === true}
                      onChange={() =>
                        setUserData({ ...userData!, has_diabetes: true })
                      }
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="has_diabetes"
                      value="no"
                      checked={userData?.has_diabetes === false}
                      onChange={() =>
                        setUserData({ ...userData!, has_diabetes: false })
                      }
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm">No</span>
                  </label>
                </div>
              </div>

              {/* 4. Diabetes Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  If you're willing to share, what is your diagnosis?
                </label>
                <select
                  name="diabetes_diagnosis"
                  id="diabetes_diagnosis"
                  value={userData?.diabetes_diagnosis || ""}
                  onChange={(e) =>
                    setUserData({
                      ...userData!,
                      diabetes_diagnosis: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select diagnosis</option>
                  <option value="Pre-Diabetes">Pre-Diabetes</option>
                  <option value="Type 1 Diabetes">Type 1 Diabetes</option>
                  <option value="Type 2 Diabetes">Type 2 Diabetes</option>
                  <option value="Gestational diabetes mellitus">
                    Gestational diabetes mellitus
                  </option>
                </select>
              </div>

              {/* 5. Medications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Are you taking any medications or insulin to manage your blood
                  sugar?
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="takes_medication"
                      value="yes"
                      checked={userData?.takes_medication === true}
                      onChange={() =>
                        setUserData({ ...userData!, takes_medication: true })
                      }
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="takes_medication"
                      value="no"
                      checked={userData?.takes_medication === false}
                      onChange={() =>
                        setUserData({ ...userData!, takes_medication: false })
                      }
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm">No</span>
                  </label>
                </div>
              </div>

              {/* 6. Medication Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  If you're comfortable sharing, what medications are you
                  taking?
                </label>
                <select
                  name="medications"
                  id="medications"
                  value={userData?.medications || ""}
                  onChange={(e) =>
                    setUserData({ ...userData!, medications: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select medication</option>
                  <option value="metformin">Metformin</option>
                  <option value="glipizide">Glipizide</option>
                  <option value="glyburide">Glyburide</option>
                  <option value="liraglutide">Liraglutide</option>
                  <option value="semaglutide">Semaglutide</option>
                  <option value="dapagliflozin">Dapagliflozin</option>
                  <option value="empagliflozin">Empagliflozin</option>
                  <option value="insulin_glargine">Insulin glargine</option>
                  <option value="insulin_detemir">Insulin detemir</option>
                  <option value="insulin_lispro">Insulin Lispro</option>
                  <option value="insulin_aspart">Insulin Aspart</option>
                  <option value="other">Other (please specify)</option>
                </select>
                {/* Other Medications Specification */}
                {selectedMedication === "other" && (
                  <input
                    type="text"
                    placeholder="Other medications (please specify)"
                    className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                )}
              </div>

              {/* 7. Pregnancy Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Are you pregnant or breastfeeding?
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="is_pregnant_or_nursing"
                      value="yes"
                      checked={userData?.is_pregnant_or_nursing === true}
                      onChange={() =>
                        setUserData({
                          ...userData!,
                          is_pregnant_or_nursing: true,
                        })
                      }
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="is_pregnant_or_nursing"
                      value="no"
                      checked={userData?.is_pregnant_or_nursing === false}
                      onChange={() =>
                        setUserData({
                          ...userData!,
                          is_pregnant_or_nursing: false,
                        })
                      }
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm">No</span>
                  </label>
                </div>
              </div>

              {/* 8. Physical Activity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  How would you describe your physical activity level?
                </label>
                <select
                  name="physical_activity_level"
                  id="physical_activity_level"
                  value={userData?.physical_activity_level || ""}
                  onChange={(e) =>
                    setUserData({
                      ...userData!,
                      physical_activity_level: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select activity level</option>
                  <option value="Sedentary">
                    Sedentary (little or no exercise)
                  </option>
                  <option value="Lightly active">
                    Lightly active (light exercise/sports 1-3 days/week)
                  </option>
                  <option value="Moderately active">
                    Moderately active (moderate exercise/sports 3-5 days/week)
                  </option>
                  <option value="Very active">
                    Very active (hard exercise/sports 6-7 days a week)
                  </option>
                </select>
              </div>

              {/* 9. Other Health Concerns */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Do you have any other health concerns or special
                  considerations we should be aware of?
                </label>
                <textarea
                  name="other_health_concerns"
                  id="other_health_concerns"
                  value={userData?.other_health_concerns || ""}
                  onChange={(e) =>
                    setUserData({
                      ...userData!,
                      other_health_concerns: e.target.value,
                    })
                  }
                  placeholder="Describe any other health concerns or conditions that might be relevant"
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                ></textarea>
              </div>

              {/* 10. Other Medications and Supplements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Are there other medications and supplements you are taking?
                </label>
                <textarea
                  name="other_medications"
                  id="other_medications"
                  placeholder="Please list any other medications or supplements you take regularly"
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                ></textarea>
              </div>
            </div>
          </div>

          {/* 4. Health Goals Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h2 className="text-lg font-medium text-orange-600">
                4. Health Goals
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Primary Health Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What are your primary health goals?
                </label>
                <select
                  name="blood_sugar_goals"
                  id="blood_sugar_goals"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  value={
                    userData?.blood_sugar_goals &&
                    userData.blood_sugar_goals.length > 0
                      ? userData.blood_sugar_goals[0]
                      : ""
                  }
                  onChange={(e) => {
                    const newGoals = e.target.value ? [e.target.value] : [];
                    setUserData({ ...userData!, blood_sugar_goals: newGoals });
                  }}
                >
                  <option value="">Select your primary health goal</option>
                  <option value="Achieve and maintain a target HbA1c level">
                    Achieve and maintain a target HbA1c level
                  </option>
                  <option value="Reduce the frequency of hyperglycemic or hypoglycemic episodes">
                    Reduce the frequency of hyperglycemic or hypoglycemic
                    episodes
                  </option>
                  <option value="Improve overall blood sugar stability">
                    Improve overall blood sugar stability
                  </option>
                  <option value="Prevent or delay diabetes-related complications">
                    Prevent or delay diabetes-related complications
                  </option>
                  <option value="Lose weight">Lose weight</option>
                  <option value="Build muscle">Build muscle</option>
                  <option value="Build a healthier lifestyle">
                    Build a healthier lifestyle
                  </option>
                </select>
              </div>

              {/* Specific Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Please describe your specific goals in detail
                </label>
                <textarea
                  name="specific_goals"
                  id="specific_goals"
                  value={userData?.specific_goals || ""}
                  onChange={(e) =>
                    setUserData({
                      ...userData!,
                      specific_goals: e.target.value,
                    })
                  }
                  placeholder="What specific outcomes are you hoping to achieve?"
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="submit"
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Profile to Database"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default MyProfile;

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/Order.css";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { LoadScript, Autocomplete } from "@react-google-maps/api";


const libraries = ["places"];
const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const Order = () => {
  const { isAuthenticated } = useAuth();
  const [orderType, setOrderType] = useState("");
  const [cupcakeCount, setCupcakeCount] = useState("");
  const [cupcakeFlavor, setCupcakeFlavor] = useState("");
  const [frostingFlavor, setFrostingFlavor] = useState("");
  const [fruitToppings, setFruitToppings] = useState([]);
  const [flowerDecoration, setFlowerDecoration] = useState("");
  const [cupcakeDesign, setCupcakeDesign] = useState("");
  const [cakeSize, setCakeSize] = useState("");
  const [cakeFlavor, setCakeFlavor] = useState("");
  const [cakeFilling, setCakeFilling] = useState("");
  const [cakeDecoration, setCakeDecoration] = useState([]);
  const [cakeDesign, setCakeDesign] = useState("");
  const [pickupDate, setPickupDate] = useState(new Date());
  const [pickupOption, setPickupOption] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [photo, setPhoto] = useState(null);
  const [agreedToPolicies, setAgreedToPolicies] = useState(false);
  const [blockedDates, setBlockedDates] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [delivery_address, setDeliveryAddress] = useState("");  // Add state for delivery address
  const autocompleteRef = useRef(null);
  const navigate = useNavigate();  // Initialize useNavigate

  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        const response = await axios.get("http://localhost:3001/blocked-dates");
        setBlockedDates(response.data);
      } catch (error) {
        console.error("Error fetching blocked dates:", error);
      }
    };

    fetchBlockedDates();
  }, []);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place) {
      setDeliveryAddress(place.formatted_address);
    }
  };

// Inside your Order.js
const handleOrderSubmit = async (e) => {
    e.preventDefault();
  
    if (!isAuthenticated) {
      setError("Please log in to place an order.");
      return;
    }
  
    if (!orderType || !pickupDate || !photo) {
      setError("All fields are required.");
      return;
    }
  
    const formData = new FormData();
    formData.append("orderType", orderType);
    formData.append("cupcakeCount", cupcakeCount);
    formData.append("cupcakeFlavor", cupcakeFlavor);
    formData.append("frostingFlavor", frostingFlavor);
    formData.append("fruitToppings", JSON.stringify(fruitToppings)); // Convert array to JSON string
    formData.append("flowerDecoration", flowerDecoration);
    formData.append("cupcakeDesign", cupcakeDesign);
    formData.append("cakeSize", cakeSize);
    formData.append("cakeFlavor", cakeFlavor);
    formData.append("cakeFilling", cakeFilling);
    formData.append("cakeDecoration", JSON.stringify(cakeDecoration)); // Convert array to JSON string
    formData.append("cakeDesign", cakeDesign);
    formData.append("pickupDate", pickupDate.toISOString());
    formData.append("pickupOption", pickupOption);
    formData.append("dietaryRestrictions", dietaryRestrictions);
    formData.append("photo", photo);
    formData.append("delivery_address", delivery_address); // Ensure correct column name
  
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3001/order",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage("Order placed successfully");
      navigate("/order-success");  // Redirect to success page
    } catch (err) {
      console.error("Error placing order:", err);
      setError("Error placing order");
    }
  };
  

  const isBlockedDate = (date) => {
    const today = new Date();
    const twoDaysFromToday = new Date(today);
    twoDaysFromToday.setDate(today.getDate() + 2);
    
    return date < today || date <= twoDaysFromToday || blockedDates.some(
      (blockedDate) =>
        new Date(blockedDate).toDateString() === date.toDateString()
    );
  };

  return (
    <div className="order-container">
      <h1>Place Your Order</h1>
      {error && <p className="error">{error}</p>}
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleOrderSubmit}>
        <label>
          Order Type:
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
          >
            <option value="">Select...</option>
            <option value="Cake">Cake</option>
            <option value="Cupcake">Cupcake</option>
          </select>
        </label>

        {orderType === "Cupcake" && (
          <>
            <label>
              Cupcake Count:
              <select
                value={cupcakeCount}
                onChange={(e) => setCupcakeCount(e.target.value)}
              >
                <option value="">Select...</option>
                <option value="6">6 count - $20</option>
                <option value="12">12 count - $35</option>
              </select>
            </label>

            <label>
              Cupcake Flavor:
              <select
                value={cupcakeFlavor}
                onChange={(e) => setCupcakeFlavor(e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Vanilla">Vanilla</option>
                <option value="Chocolate">Chocolate</option>
                <option value="Lemon">Lemon</option>
                <option value="Raspberry">Raspberry</option>
                <option value="Orange">Orange</option>
                <option value="Green tea">Green tea</option>
                <option value="Earl Grey">Earl Grey</option>
                <option value="Carrot">Carrot</option>
                <option value="Red Velvet">Red Velvet</option>
              </select>
            </label>

            <label>Frosting Flavor:</label>
            <select
              value={frostingFlavor}
              onChange={(e) => setFrostingFlavor(e.target.value)}
              required
            >
              <option value="">Select...</option>
              <option value="Vanilla">Vanilla</option>
              <option value="Chocolate">Chocolate</option>
              <option value="Lemon">Lemon</option>
              <option value="Orange buttercream">Orange buttercream</option>
              <option value="Cream cheese">Cream cheese</option>
              <option value="White chocolate buttercream">
                White chocolate buttercream
              </option>
            </select>

            <label>Fruit Toppings:</label>
            <div className="fruit-toppings">
              <label>
                <input
                  type="checkbox"
                  value="Strawberry"
                  checked={fruitToppings.includes("Strawberry")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFruitToppings([...fruitToppings, e.target.value]);
                    } else {
                      setFruitToppings(
                        fruitToppings.filter((item) => item !== e.target.value)
                      );
                    }
                  }}
                />
                Strawberry + 0.83¢ per cupcake
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Blueberry"
                  checked={fruitToppings.includes("Blueberry")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFruitToppings([...fruitToppings, e.target.value]);
                    } else {
                      setFruitToppings(
                        fruitToppings.filter((item) => item !== e.target.value)
                      );
                    }
                  }}
                />
                Blueberry + 0.83¢ per cupcake
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Raspberry"
                  checked={fruitToppings.includes("Raspberry")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFruitToppings([...fruitToppings, e.target.value]);
                    } else {
                      setFruitToppings(
                        fruitToppings.filter((item) => item !== e.target.value)
                      );
                    }
                  }}
                />
                Raspberry + 0.83¢ per cupcake
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Blackberry"
                  checked={fruitToppings.includes("Blackberry")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFruitToppings([...fruitToppings, e.target.value]);
                    } else {
                      setFruitToppings(
                        fruitToppings.filter((item) => item !== e.target.value)
                      );
                    }
                  }}
                />
                Blackberry + 0.83¢ per cupcake
              </label>
            </div>

            <label>Flower Decoration:</label>
            <select
              value={flowerDecoration}
              onChange={(e) => setFlowerDecoration(e.target.value)}
            >
              <option value="">Select...</option>
              <option value="Yes">
                Yes, I would like flower decoration + 2$ per cupcake
              </option>
              <option value="No">No, I would NOT like flower decoration</option>
            </select>

            <label>Design:</label>
            <textarea
              value={cupcakeDesign}
              onChange={(e) => setCupcakeDesign(e.target.value)}
            ></textarea>
          </>
        )}

        {orderType === "Cake" && (
          <>
            <label>Size:</label>
            <select
              value={cakeSize}
              onChange={(e) => setCakeSize(e.target.value)}
              required
            >
              <option value="">Select...</option>
              <option value="6 inch">6" cake - 70$ - feeds 8-12 people</option>
              <option value="8 inch">
                8” cake - 100$ - feeds 12-25 people
              </option>
              <option value="10 inch">
                10“ cake - 140$ - feeds 30-35 people
              </option>
              <option value="12 inch">
                12” cake - 180$ - feeds 35-56 people
              </option>
              <option value="2 tiered">
                2 tiered cake - I will contact you for more details (starts at
                $180 for smallest size - feeds 30-35 people)
              </option>
            </select>

            <label>Cake Flavor:</label>
            <select
              value={cakeFlavor}
              onChange={(e) => setCakeFlavor(e.target.value)}
              required
            >
              <option value="">Select...</option>
              <option value="Chocolate">Chocolate</option>
              <option value="Vanilla">Vanilla</option>
              <option value="Red Velvet">Red Velvet</option>
            </select>

            <label>
              Cake Filling:
              <select
                value={cakeFilling}
                onChange={(e) => setCakeFilling(e.target.value)}
                required
              >
                <option value="">Select...</option>
                <option value="Strawberry Puree">Strawberry Puree</option>
                <option value="Blueberry Puree">Blueberry Puree</option>
                <option value="Chocolate Ganache">Chocolate Ganache</option>
                <option value="Buttercream">Buttercream</option>
              </select>
            </label>

            <label>
              Cake Decoration:
              <div className="cake-decoration">
                <label>
                  <input
                    type="checkbox"
                    value="Buttercream flower"
                    checked={cakeDecoration.includes("Buttercream flower")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCakeDecoration([...cakeDecoration, e.target.value]);
                      } else {
                        setCakeDecoration(
                          cakeDecoration.filter(
                            (item) => item !== e.target.value
                          )
                        );
                      }
                    }}
                  />
                  Buttercream flower + 10$
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Real flower"
                    checked={cakeDecoration.includes("Real flower")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCakeDecoration([...cakeDecoration, e.target.value]);
                      } else {
                        setCakeDecoration(
                          cakeDecoration.filter(
                            (item) => item !== e.target.value
                          )
                        );
                      }
                    }}
                  />
                  Real flower + 10$
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Sugar Fondant"
                    checked={cakeDecoration.includes("Sugar Fondant")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCakeDecoration([...cakeDecoration, e.target.value]);
                      } else {
                        setCakeDecoration(
                          cakeDecoration.filter(
                            (item) => item !== e.target.value
                          )
                        );
                      }
                    }}
                  />
                  Sugar Fondant + 10$
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Plastic Figure"
                    checked={cakeDecoration.includes("Plastic Figure")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCakeDecoration([...cakeDecoration, e.target.value]);
                      } else {
                        setCakeDecoration(
                          cakeDecoration.filter(
                            (item) => item !== e.target.value
                          )
                        );
                      }
                    }}
                  />
                  Plastic Figure + 10$
                </label>
              </div>
            </label>

            <label>Design:</label>
            <textarea
              value={cakeDesign}
              onChange={(e) => setCakeDesign(e.target.value)}
            ></textarea>
          </>
        )}

        {orderType && (
          <>
            <label>Date Needed:</label>
            <DatePicker
              selected={pickupDate}
              onChange={(date) => setPickupDate(date)}
              filterDate={(date) => !isBlockedDate(date)}
            />
            <br></br>
            <label>Pickup Option:</label>
            <select
              value={pickupOption}
              onChange={(e) => setPickupOption(e.target.value)}
              required
            >
              <option value="">Select...</option>
              <option value="Pickup">I would like to pick up for myself</option>
              <option value="Delivery">
                I would like to have my order delivered ($15 in Prosper + $1 per
                mile from Prosper)
              </option>
            </select>

            {pickupOption === "Delivery" && (
                <LoadScript googleMapsApiKey={GOOGLE_API_KEY} libraries={libraries}>

                <Autocomplete
                  onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                  onPlaceChanged={handlePlaceChanged}
                >
                  <input
                    type="text"
                    placeholder="Enter delivery address"
                    className="input-field"
                    value={delivery_address}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                  />
                </Autocomplete>
              </LoadScript>
            )}

            <label>Dietary Restrictions or Allergies:</label>
            <textarea
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
            ></textarea>
            <div className="photo-container">
              <label>Upload Photo:</label>
              <input
                type="file"
                onChange={(e) => setPhoto(e.target.files[0])}
                accept=".png,.jpeg"
                required
              />
            </div>
          </>
        )}

        <button type="submit">Submit Order</button>
      </form>
    </div>
  );
};

export default Order;

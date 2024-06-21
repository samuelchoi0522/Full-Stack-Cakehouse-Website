import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/Order.css";
import { useAuth } from "../AuthContext";

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
  
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:3001/order', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setMessage('Order placed successfully');
      } catch (err) {
        console.error('Error placing order:', err);
        setError('Error placing order');
      }
  };
  

  const isBlockedDate = (date) => {
    return blockedDates.some(
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

            <label>
              Fruit Toppings:
              <select
                multiple
                value={fruitToppings} // If you are using multiple selection
                onChange={(e) =>
                  setFruitToppings(
                    Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    )
                  )
                }
              >
                <option value="Strawberry">
                  Strawberry + 0.83¢ per cupcake
                </option>
                <option value="Blueberry">Blueberry + 0.83¢ per cupcake</option>
                <option value="Raspberry">Raspberry + 0.83¢ per cupcake</option>
                <option value="Blackberry">
                  Blackberry + 0.83¢ per cupcake
                </option>
              </select>
            </label>

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
              <div>
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

        <label>Date Needed:</label>
        <DatePicker
          selected={pickupDate}
          onChange={(date) => setPickupDate(date)}
          filterDate={(date) => !isBlockedDate(date)}
        />

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

        <label>Dietary Restrictions or Allergies:</label>
        <textarea
          value={dietaryRestrictions}
          onChange={(e) => setDietaryRestrictions(e.target.value)}
        ></textarea>

        <label>Upload Photo:</label>
        <input
          type="file"
          onChange={(e) => setPhoto(e.target.files[0])}
          required
        />

        <label>
          <input
            type="checkbox"
            checked={agreedToPolicies}
            onChange={(e) => setAgreedToPolicies(e.target.checked)}
            required
          />
          I read/agree above "Important Information: Cake Flavor and Texture
          Policies"
        </label>

        <button type="submit">Submit Order</button>
      </form>
    </div>
  );
};

export default Order;

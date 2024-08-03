import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/Order.css";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { LoadScript, Autocomplete, GoogleMap } from "@react-google-maps/api";

const libraries = ["places"];
const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
console.log(GOOGLE_API_KEY);

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
  const [blockedDates, setBlockedDates] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [guestInfoSubmitted, setGuestInfoSubmitted] = useState(false);

  const [guestInfo, setGuestInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isGuest, setIsGuest] = useState(false);
  const [delivery_address, setDeliveryAddress] = useState(""); // Add state for delivery address
  const autocompleteRef = useRef(null);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        const response = await axios.get("http://sweetpluscake-dev.eba-md5dtzmg.us-west-2.elasticbeanstalk.com:8080/api/blocked-dates");
        setBlockedDates(response.data);
      } catch (error) {
        console.error("Error fetching blocked dates:", error);
      }
    };

    fetchBlockedDates();
  }, []);

  useEffect(() => {
    if (blockedDates.length > 0) {
      const firstValidDate = getFirstValidDate();
      setPickupDate(firstValidDate);
    }
  }, [blockedDates]);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place) {
      setDeliveryAddress(place.formatted_address || place.name || "");
    }
  };

  // Inside your Order.js
  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    if (!isGuest && !isAuthenticated && !guestInfoSubmitted) {
      setError("Please log in or continue as a guest to place an order.");
      return;
    }

    if (!orderType || !pickupDate || !photo) {
      setError("All fields are required.");
      return;
    }

    if (
      isGuest &&
      (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email)
    ) {
      setError("All guest fields are required.");
      return;
    }

    const formData = new FormData();
    formData.append("orderType", orderType);
    formData.append("cupcakeCount", cupcakeCount);
    formData.append("cupcakeFlavor", cupcakeFlavor);
    formData.append("frostingFlavor", frostingFlavor);
    formData.append("fruitToppings", JSON.stringify(fruitToppings));
    formData.append("flowerDecoration", flowerDecoration);
    formData.append("cupcakeDesign", cupcakeDesign);
    formData.append("cakeSize", cakeSize);
    formData.append("cakeFlavor", cakeFlavor);
    formData.append("cakeFilling", cakeFilling);
    formData.append("cakeDecoration", JSON.stringify(cakeDecoration));
    formData.append("cakeDesign", cakeDesign);
    formData.append("pickupDate", pickupDate.toISOString());
    formData.append("pickupOption", pickupOption);
    formData.append("dietaryRestrictions", dietaryRestrictions);
    formData.append("photo", photo);
    formData.append("delivery_address", delivery_address);

    if (isGuest) {
      formData.append("guestFirstName", guestInfo.firstName);
      formData.append("guestLastName", guestInfo.lastName);
      formData.append("guestEmail", guestInfo.email);
    }

    try {
      const headers = {
        "Content-Type": "multipart/form-data",
      };

      if (!isGuest && isAuthenticated) {
        const token = localStorage.getItem("token");
        headers["Authorization"] = `Bearer ${token}`;
      }

      console.log("Headers being sent: ", headers);

      const response = await axios.post(
        "http://sweetpluscake-dev.eba-md5dtzmg.us-west-2.elasticbeanstalk.com:8080/api/order",
        formData,
        { headers }
      );
      setMessage("Order placed successfully");
      navigate("/order-success");
    } catch (err) {
      console.error("Error placing order:", err);
      setError("Error placing order");
    }
  };

  const isBlockedDate = (date) => {
    const today = new Date();
    const twoDaysFromToday = new Date(today);
    twoDaysFromToday.setDate(today.getDate() + 2);

    return (
      date < today ||
      date <= twoDaysFromToday ||
      blockedDates.some(
        (blockedDate) =>
          new Date(blockedDate).toDateString() === date.toDateString()
      )
    );
  };

  const getFirstValidDate = () => {
    const today = new Date();
    let firstValidDate = new Date(today);
    firstValidDate.setDate(today.getDate() + 3); // Start checking from the day after the auto-blocked period

    while (isBlockedDate(firstValidDate)) {
      firstValidDate.setDate(firstValidDate.getDate() + 1);
    }

    return firstValidDate;
  };

  if (!isAuthenticated && !isGuest) {
    return (
      <div className="order-container">
        <h1>Place Your Order</h1>
        <p>Please sign in to order or continue as a guest</p>
        <button onClick={() => navigate("/login")}>Sign In</button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <button onClick={() => setIsGuest(true)}>Continue as Guest</button>
      </div>
    );
  }

  if (!isAuthenticated && isGuest && !guestInfoSubmitted) {
    return (
      <div className="order-container">
        <h1>Guest Order Information</h1>
        {error && <p className="error">{error}</p>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (guestInfo.firstName && guestInfo.lastName && guestInfo.email) {
              setError(""); // Clear any previous errors
              setGuestInfoSubmitted(true); // Mark guest info as submitted
            } else {
              setError("All fields are required.");
            }
          }}
        >
          <label>
            First Name:
            <input
              type="text"
              value={guestInfo.firstName}
              onChange={(e) =>
                setGuestInfo({ ...guestInfo, firstName: e.target.value })
              }
              required
            />
          </label>
          <label>
            Last Name:
            <input
              type="text"
              value={guestInfo.lastName}
              onChange={(e) =>
                setGuestInfo({ ...guestInfo, lastName: e.target.value })
              }
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              value={guestInfo.email}
              onChange={(e) =>
                setGuestInfo({ ...guestInfo, email: e.target.value })
              }
              required
            />
          </label>
          <button type="submit">Continue to Order</button>
        </form>
      </div>
    );
  }

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
              selected={getFirstValidDate()}
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
              <LoadScript
                googleMapsApiKey={GOOGLE_API_KEY}
                libraries={libraries}
              >
                <Autocomplete
                  onLoad={(autocomplete) =>
                    (autocompleteRef.current = autocomplete)
                  }
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

            <div className="important-info">
              <h2>Important Information: Cake Flavor and Texture Policies</h2>
              <ol>
                <li>
                  <strong>Acceptance of Cake:</strong>
                  <p>
                    By accepting and picking up your cake from Sweetplus
                    Cakehouse, you acknowledge that:
                  </p>
                  <ul>
                    <li>
                      Cake flavor and texture are subjective and may vary from
                      individual preferences.
                    </li>
                    <li>
                      Once the cake has been accepted and picked up, full
                      refunds requested solely based on personal preferences
                      regarding flavor or texture will not be honored.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>
                    Quality Determination, Store Credit, and Refund Limitations:
                  </strong>
                  <p>
                    If you believe the cake does not meet our quality standards,
                    you may qualify for a percentage of a store credit. To be
                    eligible, the cake must be reported/returned to us within a
                    timely manner, preferably within 24 hours of pick up.
                    Quality determination is solely at the discretion of
                    [Sweet_Plus Cake House]. Please understand that we cannot
                    issue refunds for cakes that have already been completely
                    consumed or destroyed.
                  </p>
                </li>
                <li>
                  <strong>Store Credit Calculation:</strong>
                  <p>
                    Store credit percentages will be based on the promptness of
                    the cake return, the amount consumed, and our determination
                    of the overall quality. Customers who fail to contact us
                    within 24 hours of cake pick-up will not be eligible for any
                    store credits.
                  </p>
                </li>
              </ol>
              <p>
                By clicking "Submit Order" you agree to our Policies and Terms
                and Conditions.
              </p>
            </div>
          </>
        )}

        <br></br>
        <button type="submit">Submit Order</button>
      </form>
    </div>
  );
};

export default Order;

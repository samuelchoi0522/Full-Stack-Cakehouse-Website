import React, { useState } from 'react';
import axios from 'axios';

const Order = () => {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    size: '',
    flavor: '',
    email: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('file', file);
    data.append('type', formData.type);
    data.append('size', formData.size);
    data.append('flavor', formData.flavor);
    data.append('email', formData.email);
    await axios.post('/api/order', data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={handleFileChange} />
      <input type="text" name="type" value={formData.type} onChange={handleChange} placeholder="Cake or Cupcake" />
      <input type="text" name="size" value={formData.size} onChange={handleChange} placeholder="Size" />
      <input type="text" name="flavor" value={formData.flavor} onChange={handleChange} placeholder="Flavor" />
      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Your Email" />
      <button type="submit">Submit</button>
    </form>
  );
};

export default Order;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:3000/products';

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '' });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
      setError('');
    } catch (err) {
      setError('Không thể kết nối đến server. Vui lòng chạy backend NestJS.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    try {
      if (editing !== null) {
        await axios.put(`${API_URL}/${editing}`, {
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
        });
        setEditing(null);
      } else {
        await axios.post(API_URL, {
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
        });
      }
      setForm({ name: '', description: '', price: '' });
      fetchProducts();
    } catch (err) {
      setError('Lỗi khi lưu sản phẩm');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchProducts();
      } catch (err) {
        setError('Xóa thất bại');
      }
    }
  };

  const handleEdit = (product) => {
    setEditing(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
    });
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setForm({ name: '', description: '', price: '' });
  };

  return (
    <div className="container">
      <h1>📦 Quản lý sản phẩm</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit} className="product-form">
        <input
          type="text"
          placeholder="Tên sản phẩm"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Mô tả"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          type="number"
          placeholder="Giá (VND)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <div className="form-buttons">
          <button type="submit">{editing !== null ? 'Cập nhật' : 'Thêm sản phẩm'}</button>
          {editing !== null && <button type="button" onClick={handleCancelEdit}>Hủy</button>}
        </div>
      </form>

      {loading && <p>Đang tải...</p>}

      <ul className="product-list">
        {products.map((product) => (
          <li key={product.id} className="product-item">
            <div className="product-info">
              <strong>{product.name}</strong> - {product.price}đ
              {product.description && <p>{product.description}</p>}
            </div>
            <div className="product-actions">
              <button onClick={() => handleEdit(product)}>✏️ Sửa</button>
              <button onClick={() => handleDelete(product.id)}>🗑️ Xóa</button>
            </div>
          </li>
        ))}
      </ul>
      {!loading && products.length === 0 && <p>Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!</p>}
    </div>
  );
}

export default App;
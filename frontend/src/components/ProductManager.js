import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './ProductManager.css';

const API_URL = 'http://localhost:3000';

export default function ProductManager({ token, user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', description: '' });
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('');
  const [uploading, setUploading] = useState({});

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 5, search: searchTerm, sort };
      if (minPrice) params.minPrice = parseFloat(minPrice);
      if (maxPrice) params.maxPrice = parseFloat(maxPrice);
      const res = await axios.get(`${API_URL}/products`, { params });
      setProducts(res.data.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      toast.error('Lỗi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, minPrice, maxPrice, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Giá phải là số không âm');
      return;
    }
    const payload = { ...form, price: priceNum };
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      if (editing) {
        await axios.put(`${API_URL}/products/${editing}`, payload, config);
        toast.success('Cập nhật thành công');
      } else {
        await axios.post(`${API_URL}/products`, payload, config);
        toast.success('Thêm sản phẩm thành công');
      }
      setForm({ name: '', price: '', description: '' });
      setEditing(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu sản phẩm');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa sản phẩm?')) return;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      await axios.delete(`${API_URL}/products/${id}`, config);
      toast.success('Xóa thành công');
      fetchProducts();
    } catch (err) {
      toast.error('Lỗi xóa');
    }
  };

  const handleUpload = async (id, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(prev => ({ ...prev, [id]: true }));
    const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
    try {
      await axios.post(`${API_URL}/products/upload/${id}`, formData, config);
      toast.success('Upload ảnh thành công');
      fetchProducts();
    } catch (err) {
      toast.error('Upload thất bại');
    } finally {
      setUploading(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Quản lý sản phẩm</h1>
        <div>
          Xin chào, {user?.username} <button onClick={onLogout}>Đăng xuất</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="Tên sản phẩm"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Giá"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
          required
        />
        <textarea
          placeholder="Mô tả"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
        <button type="submit">{editing ? 'Cập nhật' : 'Thêm'}</button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm({ name: '', price: '', description: '' });
            }}
          >
            Hủy
          </button>
        )}
      </form>

      <div className="filters">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <input
          type="number"
          placeholder="Giá từ"
          value={minPrice}
          onChange={e => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Giá đến"
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
        />
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="">Sắp xếp</option>
          <option value="name_asc">Tên A-Z</option>
          <option value="name_desc">Tên Z-A</option>
          <option value="price_asc">Giá tăng</option>
          <option value="price_desc">Giá giảm</option>
        </select>
      </div>

      {loading && <div>Đang tải...</div>}
      {!loading && products.length === 0 && (
        <div>Không có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!</div>
      )}

      {products.map(p => (
        <div key={p.id} className="productCard">
          {p.imageUrl && <img src={p.imageUrl} alt={p.name} />}
          <div style={{ overflow: 'hidden' }}>
            <h3>{p.name}</h3>
            <p>{p.price.toLocaleString()} VND</p>
            <p>{p.description}</p>
            <div>
              <button
                onClick={() => {
                  setEditing(p.id);
                  setForm({
                    name: p.name,
                    price: p.price,
                    description: p.description || '',
                  });
                }}
              >
                Sửa
              </button>
              <button onClick={() => handleDelete(p.id)}>Xóa</button>
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={e => handleUpload(p.id, e.target.files[0])}
              />
              {uploading[p.id] && <span>Đang upload...</span>}
            </div>
          </div>
        </div>
      ))}

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
          Previous
        </button>
        <span>
          Trang {page} / {totalPages} (Tổng: {total})
        </span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
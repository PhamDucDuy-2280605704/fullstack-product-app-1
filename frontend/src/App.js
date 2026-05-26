import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';

const API_URL = 'http://localhost:3000/products';

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '' });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5;

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}?page=${page}&limit=${limit}`);
      setProducts(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      toast.success('Tải dữ liệu thành công');
    } catch (err) {
      toast.error('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error('Vui lòng nhập tên và giá');
      return;
    }
    try {
      if (editing !== null) {
        await axios.put(`${API_URL}/${editing}`, {
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
        });
        toast.success('Cập nhật sản phẩm thành công');
        setEditing(null);
      } else {
        await axios.post(API_URL, {
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
        });
        toast.success('Thêm sản phẩm thành công');
      }
      setForm({ name: '', description: '', price: '' });
      setPage(1);
      fetchProducts();
    } catch (err) {
      toast.error('Lỗi khi lưu sản phẩm');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        toast.success('Xóa sản phẩm thành công');
        fetchProducts();
      } catch (err) {
        toast.error('Xóa thất bại');
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
    toast('Đang chỉnh sửa sản phẩm', { icon: '✏️' });
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setForm({ name: '', description: '', price: '' });
  };

  const goToPreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const goToNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="container">
      <Toaster position="top-right" reverseOrder={false} />
      <h1>📦 Quản lý sản phẩm</h1>
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

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={goToPreviousPage} disabled={page === 1}>◀ Trước</button>
          <span> Trang {page} / {totalPages} (Tổng {total} sản phẩm) </span>
          <button onClick={goToNextPage} disabled={page === totalPages}>Sau ▶</button>
        </div>
      )}
    </div>
  );
}

export default App;
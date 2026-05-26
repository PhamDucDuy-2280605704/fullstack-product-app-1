import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';

const API_URL = 'http://localhost:3000/products';

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', description: '' });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('');
  const [uploading, setUploading] = useState({});

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (page === 1) {
        fetchProducts();
      } else {
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, minPrice, maxPrice, sort]);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 5,
        search: searchTerm,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sort: sort || undefined,
      };
      const response = await axios.get(API_URL, { params });
      setProducts(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
      toast.success('Tải dữ liệu thành công');
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải sản phẩm');
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
    // Chuyển price sang số và kiểm tra
    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum)) {
      toast.error('Giá phải là số');
      return;
    }
    if (priceNum < 0) {
      toast.error('Giá không được nhỏ hơn 0');
      return;
    }
    const submitData = {
      name: form.name,
      price: priceNum,
      description: form.description || '',
    };
    try {
      if (editing) {
        await axios.put(`${API_URL}/${editing}`, submitData);
        toast.success('Cập nhật thành công');
      } else {
        await axios.post(API_URL, submitData);
        toast.success('Thêm sản phẩm thành công');
      }
      resetForm();
      fetchProducts();
      if (!editing && page !== 1) setPage(1);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const messages = error.response.data.message;
        if (Array.isArray(messages)) toast.error(messages.join(', '));
        else toast.error('Dữ liệu không hợp lệ');
      } else {
        toast.error('Có lỗi xảy ra');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        toast.success('Xóa thành công');
        if (products.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchProducts();
        }
      } catch (error) {
        toast.error('Xóa thất bại');
      }
    }
  };

  const handleEdit = (product) => {
    setEditing(product.id);
    setForm({
      name: product.name,
      price: product.price,
      description: product.description || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ name: '', price: '', description: '' });
  };

  const handleFileChange = (productId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(prev => ({ ...prev, [productId]: { file, uploading: false } }));
  };

  const handleUpload = async (productId) => {
    const fileObj = uploading[productId];
    if (!fileObj || !fileObj.file) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }
    const formData = new FormData();
    formData.append('image', fileObj.file);
    setUploading(prev => ({ ...prev, [productId]: { ...prev[productId], uploading: true } }));
    try {
      await axios.post(`${API_URL}/upload/${productId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Upload ảnh thành công');
      fetchProducts();
      setUploading(prev => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
    } catch (error) {
      toast.error('Upload ảnh thất bại');
    } finally {
      setUploading(prev => ({ ...prev, [productId]: { ...prev[productId], uploading: false } }));
    }
  };

  return (
    <div className="container">
      <Toaster position="top-right" />
      <h1>Quản lý sản phẩm</h1>

      <form onSubmit={handleSubmit} className="product-form">
        <input
          type="text"
          placeholder="Tên sản phẩm *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Giá *"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Mô tả (không bắt buộc)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="form-buttons">
          <button type="submit">{editing ? 'Cập nhật' : 'Thêm mới'}</button>
          {editing && <button type="button" onClick={resetForm}>Hủy</button>}
        </div>
      </form>

      <div className="filters">
        <input
          type="text"
          placeholder="Tìm theo tên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-input"
        />
        <div className="price-filters">
          <input
            type="number"
            placeholder="Giá từ"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="filter-input small"
          />
          <input
            type="number"
            placeholder="Giá đến"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="filter-input small"
          />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="filter-select">
          <option value="">Sắp xếp mặc định</option>
          <option value="name_asc">Tên A → Z</option>
          <option value="name_desc">Tên Z → A</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
        </select>
      </div>

      {loading && <p>Đang tải...</p>}
      {!loading && products.length === 0 && <p>Không có sản phẩm nào.</p>}
      <ul className="product-list">
        {products.map((product) => (
          <li key={product.id} className="product-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {product.imageUrl && (
                <img src={product.imageUrl} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
              )}
              <div>
                <strong>{product.name}</strong> - {Number(product.price).toLocaleString()} VND
                {product.description && <div className="description">{product.description}</div>}
              </div>
            </div>
            <div className="product-actions">
              <button onClick={() => handleEdit(product)}>Sửa</button>
              <button onClick={() => handleDelete(product.id)}>Xóa</button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(product.id, e)}
                  style={{ fontSize: '0.8rem' }}
                />
                <button
                  onClick={() => handleUpload(product.id)}
                  disabled={uploading[product.id]?.uploading}
                  style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                >
                  {uploading[product.id]?.uploading ? 'Đang upload...' : 'Upload ảnh'}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="pagination">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          Previous
        </button>
        <span>Trang {page} / {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
          Next
        </button>
      </div>
      <div className="total-info">Tổng số sản phẩm: {total}</div>
    </div>
  );
}

export default App;
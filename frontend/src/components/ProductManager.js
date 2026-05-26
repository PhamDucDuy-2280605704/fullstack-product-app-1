import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './ProductManager.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function ProductManager({ token, user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', price: '', description: '', imageFile: null, imagePreview: null });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  // Hàm fetchProducts dựa trên page, search, minPrice, maxPrice, sort
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sort) params.sort = sort;
      console.log('Fetching with params:', params); // Kiểm tra
      const res = await axios.get(`${API_URL}/products`, { params });
      setProducts(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error('Lỗi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [page, search, minPrice, maxPrice, sort]);

  // 1. Khi page thay đổi -> fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); // fetchProducts thay đổi khi page, search,... thay đổi

  // 2. Khi sort thay đổi -> reset page về 1 (page thay đổi sẽ kích hoạt fetch)
  useEffect(() => {
    setPage(1);
  }, [sort]);

  // 3. Debounce cho search, minPrice, maxPrice: sau 500ms thì reset page về 1
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, minPrice, maxPrice]);

  // Các hàm xử lý khác giữ nguyên
  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, imageFile: file, imagePreview: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error('Vui lòng nhập tên và giá');
      return;
    }
    try {
      let imageUrl = form.imagePreview && !form.imagePreview.startsWith('http') ? null : form.imagePreview;
      if (form.imageFile) {
        const uploadData = new FormData();
        uploadData.append('file', form.imageFile);
        const uploadRes = await axios.post(`${API_URL}/products/upload`, uploadData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = uploadRes.data.url;
      }
      const productData = { name: form.name, price: parseFloat(form.price), description: form.description, imageUrl };
      if (editingId) {
        await axios.put(`${API_URL}/products/${editingId}`, productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Cập nhật thành công');
      } else {
        await axios.post(`${API_URL}/products`, productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Thêm sản phẩm thành công');
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      toast.error('Lỗi khi lưu sản phẩm');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: product.price,
      description: product.description || '',
      imageFile: null,
      imagePreview: product.imageUrl
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn chắc chắn xóa?')) {
      try {
        await axios.delete(`${API_URL}/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Xóa thành công');
        fetchProducts();
      } catch (err) {
        toast.error('Xóa thất bại');
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: '', price: '', description: '', imageFile: null, imagePreview: null });
  };

  const renderSkeletons = () => {
    return Array(limit).fill(0).map((_, idx) => (
      <div className="skeleton-card" key={idx}>
        <div className="skeleton-image shimmer"></div>
        <div className="skeleton-info">
          <div className="skeleton-line title shimmer"></div>
          <div className="skeleton-line price shimmer"></div>
          <div className="skeleton-line desc shimmer"></div>
          <div className="skeleton-line desc short shimmer"></div>
        </div>
      </div>
    ));
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Quản lý sản phẩm</h1>
        <div>
          <span>Xin chào, {user?.username} &nbsp;|&nbsp;</span>
          <button onClick={onLogout}>Đăng xuất</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <input name="name" placeholder="Tên sản phẩm" value={form.name} onChange={handleInputChange} required />
        <input name="price" type="number" step="0.01" placeholder="Giá" value={form.price} onChange={handleInputChange} required />
        <textarea name="description" placeholder="Mô tả" value={form.description} onChange={handleInputChange} />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {form.imagePreview && <img src={form.imagePreview} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12 }} />}
        <div className="formButtons" style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit">{editingId ? 'Cập nhật' : 'Thêm mới'}</button>
          {editingId && <button type="button" onClick={resetForm}>Hủy</button>}
        </div>
      </form>

      <div className="filters">
        <input type="text" placeholder="Tìm theo tên..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <input type="number" placeholder="Giá từ" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        <input type="number" placeholder="Đến" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sắp xếp</option>
          <option value="name_ASC">Tên A-Z</option>
          <option value="name_DESC">Tên Z-A</option>
          <option value="price_ASC">Giá tăng dần</option>
          <option value="price_DESC">Giá giảm dần</option>
        </select>
      </div>

      <div className="productGrid">
        {loading ? renderSkeletons() : products.map(product => (
          <div className="productCard" key={product.id}>
            {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="productImage" />}
            <div className="productInfo">
              <h3>{product.name}</h3>
              <p className="price">{product.price.toLocaleString()} đ</p>
              <p className="description">{product.description}</p>
              <div className="cardActions">
                <button onClick={() => handleEdit(product)}>Sửa</button>
                <button onClick={() => handleDelete(product.id)}>Xóa</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(p => p-1)}>Trước</button>
          <span>Trang {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p+1)}>Sau</button>
        </div>
      )}
    </div>
  );
}

export default ProductManager;
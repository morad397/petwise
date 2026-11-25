import { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Edit2, Plus } from 'lucide-react';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmationModal from '../../components/admin/ConfirmationModal';

import { getProducts, createProduct, updateProduct, deleteProduct, productImage } from '../../services/shopService';

// API product <-> the shape this page's table and form use
const fromApi = (p) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  category: p.category,
  stock: p.stockQuantity,
  detail: p.description || '',
  image: p.imageUrl || '',
  status: p.status,
});
const toApi = (f) => ({
  name: f.name.trim(),
  price: Number(f.price),
  category: f.category,
  stockQuantity: Number(f.stock),
  description: f.detail?.trim() || null,
  imageUrl: f.image?.trim() || null,
});

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  
  // Modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProductData, setEditProductData] = useState(null);

  const loadProducts = () =>
    getProducts({ includeHidden: true })
      .then((list) => setProducts(list.map(fromApi)))
      .catch((e) => alert(e.message));

  useEffect(() => {
    loadProducts();
  }, []);

  const getStockStatus = (qty) => {
    if (qty > 10) return 'In Stock';
    if (qty > 0) return 'Low Stock';
    return 'Out of Stock';
  };

  const handleDeleteRequest = (prod) => {
    setProductToDelete(prod);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.id);
        await loadProducts();
      } catch (e) {
        alert(e.message);
      }
    }
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const openEditModal = (prod = null) => {
    if (prod) {
      setEditProductData({ ...prod });
    } else {
      setEditProductData({ id: null, name: '', price: 0, category: 'Food', stock: 0, detail: '', image: '' });
    }
    setIsEditModalOpen(true);
  };

  const saveProductEdit = async (e) => {
    e.preventDefault();
    if (editProductData.price < 0) return alert('Price cannot be negative');
    if (editProductData.stock < 0) return alert('Stock cannot be negative');
    try {
      if (editProductData.id) {
        await updateProduct(editProductData.id, toApi(editProductData));
      } else {
        await createProduct(toApi(editProductData));
      }
      await loadProducts();
      setIsEditModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  let displayed = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesStock = stockFilter === 'All' || getStockStatus(p.stock) === stockFilter;
    return matchesSearch && matchesCat && matchesStock;
  });

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.stock > 10).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    value: products.reduce((acc, p) => acc + (p.price * p.stock), 0)
  };

  return (
    <>
      <header className="admin-header">
        <div>
          <p className="eyebrow">Inventory Management</p>
          <h1>Manage shop products and stock.</h1>
        </div>
        <button className="btn btn-primary" onClick={() => openEditModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Product
        </button>
      </header>

      <section className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card"><h3>{stats.total}</h3><p>Total Products</p></div>
        <div className="stat-card"><h3>{stats.inStock}</h3><p>In Stock</p></div>
        <div className="stat-card"><h3>{stats.lowStock}</h3><p>Low Stock</p></div>
        <div className="stat-card"><h3>{stats.outOfStock}</h3><p>Out of Stock</p></div>
        <div className="stat-card"><h3>${stats.value.toLocaleString()}</h3><p>Inventory Value</p></div>
      </section>

      <section className="section-card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', padding: '8px 12px', borderRadius: '8px', flex: 1, minWidth: '250px' }}>
            <Search size={18} color="#666" style={{ marginRight: '8px' }} />
            <input 
              type="text" 
              placeholder="Search products..." 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Filter size={18} color="#666" />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={selectStyle}>
              <option value="All">All Categories</option>
              <option value="Food">Food</option>
              <option value="Health">Health</option>
              <option value="Toys">Toys</option>
              <option value="Grooming">Grooming</option>
              <option value="Accessories">Accessories</option>
              <option value="Beds">Beds</option>
            </select>
            <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} style={selectStyle}>
              <option value="All">All Stock Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length > 0 ? displayed.map((prod) => (
                <tr key={prod.id}>
                  <td>
                    <div className="table-user">
                      <img src={productImage(prod.image)} alt={prod.name} style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
                      <strong>{prod.name}</strong>
                    </div>
                  </td>
                  <td><span className="role-badge">{prod.category}</span></td>
                  <td>${Number(prod.price).toFixed(2)}</td>
                  <td><strong>{prod.stock}</strong> units</td>
                  <td><StatusBadge status={getStockStatus(prod.stock)} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button className="icon-btn" title="Edit Product" onClick={() => openEditModal(prod)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-btn" title="Delete Product" onClick={() => handleDeleteRequest(prod)} style={{ color: '#d93025' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>
                    <p style={{ color: '#666' }}>No products match your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Product"
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      {isEditModalOpen && editProductData && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>{editProductData.id ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={saveProductEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label>Product Name</label>
                <input required type="text" className="input-field" value={editProductData.name} onChange={e => setEditProductData({...editProductData, name: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Price ($)</label>
                  <input required type="number" step="0.01" min="0" className="input-field" value={editProductData.price} onChange={e => setEditProductData({...editProductData, price: Number(e.target.value)})} />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Stock Quantity</label>
                  <input required type="number" min="0" className="input-field" value={editProductData.stock} onChange={e => setEditProductData({...editProductData, stock: Number(e.target.value)})} />
                </div>
              </div>
              <div className="input-group">
                <label>Category</label>
                <select className="input-field" value={editProductData.category} onChange={e => setEditProductData({...editProductData, category: e.target.value})}>
                  <option value="Food">Food</option>
                  <option value="Health">Health</option>
                  <option value="Toys">Toys</option>
                  <option value="Grooming">Grooming</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Beds">Beds</option>
                </select>
              </div>
              <div className="input-group">
                <label>Image URL (Optional)</label>
                <input type="text" className="input-field" value={editProductData.image} onChange={e => setEditProductData({...editProductData, image: e.target.value})} placeholder="https://..." />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const selectStyle = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  background: '#fff',
  outline: 'none',
  cursor: 'pointer'
};

import { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Edit2, Plus } from 'lucide-react';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmationModal from '../../components/admin/ConfirmationModal';

// Images imported for initialization matching Shop.jsx
import shopShampoo from '../../assets/shop-shampoo.png';
import shopToy from '../../assets/shop-toy.png';
import shopFood from '../../assets/shop-food.png';
import shopClothes from '../../assets/shop-clothes.png';
import shopBed from '../../assets/shop-bed.png';

const DEFAULT_INVENTORY = [
  { id: '1', name: 'Premium Pet Shampoo', price: 18, category: 'Grooming', detail: 'Gentle, soothing wash for a shiny, healthy coat.', image: shopShampoo, stock: 15 },
  { id: '2', name: 'Interactive Rubber Ball', price: 12, category: 'Toys', detail: 'Durable, bouncy toy perfect for fetch and playtime.', image: shopToy, stock: 45 },
  { id: '3', name: 'Healthy Dry Pet Food', price: 45, category: 'Food', detail: 'Nutrient-rich, balanced meal for optimal health.', image: shopFood, stock: 5 },
  { id: '4', name: 'Cozy Knitted Sweater', price: 24, category: 'Accessories', detail: 'Keep your pet warm and stylish in cold weather.', image: shopClothes, stock: 12 },
  { id: '5', name: 'Luxurious Plush Pet Bed', price: 65, category: 'Beds', detail: 'Ultra-soft, comfortable bed for perfect sleep.', image: shopBed, stock: 0 },
  { id: '6', name: 'Cat Litter Tray', price: 22, category: 'Accessories', detail: 'Easy-clean enclosure for daily care.', image: 'https://images.unsplash.com/photo-1615461066841-211d7a4166b5?auto=format&fit=crop&w=900&q=80', stock: 8 },
  { id: '7', name: 'Dog Leash & Collar', price: 21, category: 'Accessories', detail: 'Comfortable everyday walking set.', image: 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?auto=format&fit=crop&w=900&q=80', stock: 24 },
  { id: '8', name: 'Dog Bath Set', price: 19, category: 'Grooming', detail: 'Cleaning essentials for grooming and hygiene.', image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=900&q=80', stock: 0 }
];

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

  useEffect(() => {
    const savedStr = localStorage.getItem('petwise-inventory');
    const saved = JSON.parse(savedStr || '[]');
    if (!savedStr) {
      localStorage.setItem('petwise-inventory', JSON.stringify(DEFAULT_INVENTORY));
      setProducts(DEFAULT_INVENTORY);
    } else {
      setProducts(saved);
    }
  }, []);

  const saveProducts = (updated) => {
    setProducts(updated);
    localStorage.setItem('petwise-inventory', JSON.stringify(updated));
  };

  const getStockStatus = (qty) => {
    if (qty > 10) return 'In Stock';
    if (qty > 0) return 'Low Stock';
    return 'Out of Stock';
  };

  const handleDeleteRequest = (prod) => {
    setProductToDelete(prod);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      saveProducts(products.filter(p => p.id !== productToDelete.id));
    }
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const openEditModal = (prod = null) => {
    if (prod) {
      setEditProductData({ ...prod });
    } else {
      setEditProductData({ id: Date.now().toString(), name: '', price: 0, category: 'Food', stock: 0, detail: '', image: '' });
    }
    setIsEditModalOpen(true);
  };

  const saveProductEdit = (e) => {
    e.preventDefault();
    if (editProductData.price < 0) return alert('Price cannot be negative');
    if (editProductData.stock < 0) return alert('Stock cannot be negative');
    
    let updated;
    const exists = products.find(p => p.id === editProductData.id);
    if (exists) {
      updated = products.map(p => p.id === editProductData.id ? editProductData : p);
    } else {
      updated = [...products, editProductData];
    }
    saveProducts(updated);
    setIsEditModalOpen(false);
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
                      {prod.image && <img src={prod.image} alt={prod.name} style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover', display: 'none' }} />}
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
            <h3 style={{ margin: '0 0 16px 0' }}>{products.find(p => p.id === editProductData.id) ? 'Edit Product' : 'Add Product'}</h3>
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

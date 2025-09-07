import { useState, useEffect,useCallback } from "react";
import axios from "axios";
import "./App.css";

const API = process.env.REACT_APP_API_URL ;

export default function App() {
  const [view,setView] = useState("products"); // products, cart, login, signup
  const [user,setUser] = useState(JSON.parse(localStorage.getItem("user"))||null);
  const [token,setToken] = useState(localStorage.getItem("token")||null);
  const [form,setForm] = useState({name:"",email:"",password:""});
  const [items,setItems] = useState([]);
  const [q,setQ] = useState("");
  const [cart,setCart] = useState({items:[]});
  const [categoryFilter, setCategoryFilter] = useState("");
const [priceFilter, setPriceFilter] = useState({min:"", max:""});

  const axiosAuth = useCallback(() => 
  axios.create({
    baseURL: API,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }),
  [token] 
);

  const loadProducts = useCallback(async () => {
  let query = `?q=${q}`;
  if (categoryFilter) query += `&category=${categoryFilter}`;
  if (priceFilter.min) query += `&minPrice=${priceFilter.min}`;
  if (priceFilter.max) query += `&maxPrice=${priceFilter.max}`;
  const res = await axiosAuth().get(`/items${query}`);
  setItems(res.data);
}, [q, categoryFilter, priceFilter,axiosAuth]); 

const loadCart = useCallback(async () => {
  if (!user) return;
  const res = await axiosAuth().get("/cart");
  setCart(res.data || { items: [] });
}, [user,axiosAuth]); 
  useEffect(()=>{ if(view==="products") loadProducts(); if(view==="cart") loadCart(); },[view,loadProducts, loadCart]);

  const handleSignup=async e=>{ e.preventDefault(); const res=await axios.post(`${API}/auth/signup`,form); localStorage.setItem("token",res.data.token); localStorage.setItem("user",JSON.stringify(res.data.user)); setToken(res.data.token); setUser(res.data.user); setView("products"); };
  const handleLogin=async e=>{ e.preventDefault(); const res=await axios.post(`${API}/auth/login`,form); localStorage.setItem("token",res.data.token); localStorage.setItem("user",JSON.stringify(res.data.user)); setToken(res.data.token); setUser(res.data.user); setView("products"); };
  const handleLogout=()=>{ localStorage.removeItem("token"); localStorage.removeItem("user"); setToken(null); setUser(null);setCart({items: []}); setView("login"); };

  const addToCart=async id=>{ if(!user) return alert("Login first!"); await axiosAuth().post("/cart/add",{itemId:id,quantity:1}); loadCart(); alert("Added to cart"); };
  // Increase quantity
const increaseQty = async (id) => {
  const updatedCart = {...cart};
  const itemIndex = updatedCart.items.findIndex(c => c.itemId._id === id);
  if(itemIndex >= 0) {
    updatedCart.items[itemIndex].quantity += 1;
    setCart(updatedCart);
    if(user) await axiosAuth().post("/cart/add", {itemId:id, quantity:1});
  }
};

// Decrease quantity
const decreaseQty = async (id) => {
  const updatedCart = {...cart};
  const itemIndex = updatedCart.items.findIndex(c => c.itemId._id === id);
  if(itemIndex >= 0 && updatedCart.items[itemIndex].quantity > 1) {
    updatedCart.items[itemIndex].quantity -= 1;
    setCart(updatedCart);
    if(user) await axiosAuth().post("/cart/remove", {itemId:id, quantity:1});
  }
};

  const removeItem = async (id) => {
  const updatedCart = {...cart};
  updatedCart.items = updatedCart.items.filter(c => c.itemId._id !== id);
  setCart(updatedCart);
  if(user) await axiosAuth().post("/cart/remove", {itemId:id});
};

  return (
    <div>
      <header style={{background:"#2563eb",color:"white",padding:"1rem 2rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h1>E-Shop</h1>
        <nav style={{display:"flex",gap:"1rem"}}>
          <button onClick={()=>setView("products")} style={{color:"white",background:"none",border:"none",cursor:"pointer"}}>Products</button>
          <button onClick={()=>setView("cart")} style={{color:"white",background:"none",border:"none",cursor:"pointer"}}>Cart</button>
          {user? <button onClick={handleLogout} style={{color:"white",background:"none",border:"none",cursor:"pointer"}}>Logout</button> : <>
            <button onClick={()=>setView("login")} style={{color:"white",background:"none",border:"none",cursor:"pointer"}}>Login</button>
            <button onClick={()=>setView("signup")} style={{color:"white",background:"none",border:"none",cursor:"pointer"}}>Signup</button>
          </>}
        </nav>
      </header>

      <main style={{maxWidth:"960px",margin:"2rem auto",padding:"0 1rem"}}>
        {view==="signup" && <div className="form-container"><h2>Sign Up</h2><form onSubmit={handleSignup}><input placeholder="Name" onChange={e=>setForm({...form,name:e.target.value})}/><input placeholder="Email" onChange={e=>setForm({...form,email:e.target.value})}/><input type="password" placeholder="Password" onChange={e=>setForm({...form,password:e.target.value})}/><button type="submit">Sign Up</button></form></div>}
        {view==="login" && <div className="form-container"><h2>Login</h2><form onSubmit={handleLogin}><input placeholder="Email" onChange={e=>setForm({...form,email:e.target.value})}/><input type="password" placeholder="Password" onChange={e=>setForm({...form,password:e.target.value})}/><button type="submit">Login</button></form></div>}
        {view==="products" && <>
          <h2>Products</h2>
          <div style={{display:"flex",gap:"0.5rem",marginBottom:"1rem"}}>
  <input placeholder="Search products" value={q} onChange={e=>setQ(e.target.value)} />
  <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}>
    <option value="">All Categories</option>
    <option value="electronics">Electronics</option>
    <option value="clothing">Fashion</option>
    <option value="mobile">Mobile</option>
   
  </select>
  <input type="number" placeholder="Min Price" value={priceFilter.min} onChange={e=>setPriceFilter({...priceFilter,min:e.target.value})} />
  <input type="number" placeholder="Max Price" value={priceFilter.max} onChange={e=>setPriceFilter({...priceFilter,max:e.target.value})} />
  <button onClick={loadProducts}>Search</button>
</div>
          <div className="grid">{items.map(it=><div className="card" key={it._id}>
            {it.image && <img src={it.image} alt={it.name} className="item-img" />}<h3>{it.name}</h3><p>Rs.{it.price}</p><button onClick={()=>addToCart(it._id)}>Add to Cart</button></div>)}</div>
        </>}
        {view==="cart" && <>
  <h2>Your Cart</h2>
  {cart.items.length === 0 ? (
    <p>No items in cart</p>
  ) : (
    <div className="cart-grid">
      {cart.items.map(c => (
        <div className="cart-item" key={c.itemId._id}>
          {c.itemId.image && <img src={c.itemId.image} alt={c.itemId.name} className="cart-img"/>}
          <div className="cart-details">
            <h3>{c.itemId.name}</h3>
            <p>Price: ${c.itemId.price}</p>
            <div className="cart-actions">
              <button onClick={() => decreaseQty(c.itemId._id)}>-</button>
              <span>{c.quantity}</span>
              <button onClick={() => increaseQty(c.itemId._id)}>+</button>
              <button onClick={() => removeItem(c.itemId._id)} className="remove-btn">Remove</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</>}

      </main>

      <footer style={{textAlign:"center",fontSize:"0.9rem",padding:"1rem",background:"#f3f4f6"}}>© {new Date().getFullYear()} E-Shop Demo</footer>
    </div>
  );
}

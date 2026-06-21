import React, { useEffect, useMemo, useRef, useState } from 'react';
import { apiRequest } from './api/client';

const cities = ['Bengaluru', 'Pune', 'Hyderabad', 'Delhi NCR', 'Mumbai'];
const rupees = new Intl.NumberFormat('en-IN');

function formatMoney(value) {
  return `Rs. ${rupees.format(value || 0)}`;
}

function formatDate(value) {
  if (!value) return 'Not scheduled';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function authHeaders(session) {
  return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
}

function nextDeliveryDate() {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date.toISOString().slice(0, 10);
}

function defaultCheckoutForm() {
  return {
    deliveryDate: nextDeliveryDate(),
    notes: '',
    deliveryAddress: {
      line1: '',
      line2: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '',
      landmark: ''
    }
  };
}

function defaultMaintenanceForm() {
  return {
    rental: '',
    product: '',
    type: 'repair',
    priority: 'medium',
    description: ''
  };
}

function defaultReturnForm() {
  return {
    rentalId: '',
    preferredPickupDate: nextDeliveryDate(),
    reason: ''
  };
}

function defaultAdminProductForm() {
  return {
    name: '',
    slug: '',
    category: '',
    type: 'furniture',
    shortDescription: '',
    monthlyRent: '',
    securityDeposit: '',
    stock: '',
    availableStock: '',
    status: 'active',
    serviceCities: 'Bengaluru, Pune, Hyderabad',
    imageUrl: '',
    tenure3: '',
    tenure6: '',
    tenure12: ''
  };
}

function defaultServiceAreaForm() {
  return {
    city: '',
    state: '',
    pincodes: '',
    deliveryFee: '',
    pickupFee: '',
    standardDeliveryDays: 2
  };
}

function defaultRegisterForm() {
  return {
    name: '',
    email: '',
    phone: '',
    city: 'Bengaluru',
    password: ''
  };
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function splitList(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const pagePaths = new Set(['/', '/catalog', '/plans', '/checkout', '/rentals', '/support', '/admin']);

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Catalog', path: '/catalog' },
  { label: 'Plans', path: '/plans' },
  { label: 'Cart', path: '/checkout' },
  { label: 'Rentals', path: '/rentals' },
  { label: 'Support', path: '/support' },
  { label: 'Admin', path: '/admin' }
];

function normalizePath(pathname) {
  const path = pathname === '/index.html' ? '/' : pathname;
  if (/^\/products\/[^/]+$/.test(path)) return path;
  return pagePaths.has(path) ? path : '/';
}

function productDetailPath(product) {
  return `/products/${encodeURIComponent(product.slug || product._id)}`;
}

function getPremiumHoverKind(element) {
  if (element.matches('.solid-button')) return 'button';
  if (element.matches('.outline-button, .category-list button')) return 'soft-button';
  return 'surface';
}

function CustomSelect({ value, onChange, options, placeholder = 'Select', disabled = false }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selectedOption = options.find((option) => String(option.value) === String(value));

  useEffect(() => {
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  function handleSelect(nextValue) {
    onChange(nextValue);
    setOpen(false);
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen((current) => !current);
    }
  }

  return (
    <div className={`custom-select ${open ? 'open' : ''}`} ref={rootRef}>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        className="custom-select-trigger"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        type="button"
      >
        <span className={selectedOption ? '' : 'custom-select-placeholder'}>{selectedOption?.label || placeholder}</span>
      </button>
      {open && (
        <div className="custom-select-menu" role="listbox">
          {options.map((option) => {
            const selected = String(option.value) === String(value);
            return (
              <button
                aria-selected={selected}
                className={selected ? 'selected' : ''}
                key={String(option.value)}
                onClick={() => handleSelect(option.value)}
                role="option"
                type="button"
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailTenure, setDetailTenure] = useState(6);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authOpen, setAuthOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [registerForm, setRegisterForm] = useState(defaultRegisterForm);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState('');
  const [checkoutForm, setCheckoutForm] = useState(defaultCheckoutForm);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [operationsLoading, setOperationsLoading] = useState(false);
  const [operationsError, setOperationsError] = useState('');
  const [operationsNotice, setOperationsNotice] = useState('');
  const [maintenanceForm, setMaintenanceForm] = useState(defaultMaintenanceForm);
  const [returnForm, setReturnForm] = useState(defaultReturnForm);
  const [adminOverview, setAdminOverview] = useState(null);
  const [adminProducts, setAdminProducts] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminRentals, setAdminRentals] = useState([]);
  const [adminTickets, setAdminTickets] = useState([]);
  const [adminReports, setAdminReports] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminServiceAreas, setAdminServiceAreas] = useState([]);
  const [adminDamageClaims, setAdminDamageClaims] = useState([]);
  const [adminAuditLogs, setAdminAuditLogs] = useState([]);
  const [productForm, setProductForm] = useState(defaultAdminProductForm);
  const [editingProductId, setEditingProductId] = useState('');
  const [serviceAreaForm, setServiceAreaForm] = useState(defaultServiceAreaForm);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminNotice, setAdminNotice] = useState('');
  const [currentPath, setCurrentPath] = useState(() => normalizePath(window.location.pathname));
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedSession = window.localStorage.getItem('rentease-session');
    if (!storedSession) return;

    try {
      setSession(JSON.parse(storedSession));
    } catch {
      window.localStorage.removeItem('rentease-session');
    }
  }, []);

  useEffect(() => {
    function handlePopState() {
      setCurrentPath(normalizePath(window.location.pathname));
      window.scrollTo({ top: 0 });
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const selector = [
      '.product-card:not(.skeleton)',
      '.estimate-panel',
      '.cart-panel',
      '.checkout-form',
      '.signin-panel',
      '.cart-item',
      '.rental-card',
      '.service-form',
      '.ticket-card',
      '.ops-grid article',
      '.admin-panel',
      '.admin-list article',
      '.admin-ticket-card',
      '.admin-kpi-grid article',
      '.footer-card',
      '.footer-links a',
      '.solid-button:not(:disabled)',
      '.outline-button:not(:disabled)',
      '.category-list button'
    ].join(',');
    const targets = Array.from(document.querySelectorAll(selector));

    function handleMove(event) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      const rotateY = ((x - 50) / 50) * 5;
      const rotateX = ((50 - y) / 50) * 4;

      event.currentTarget.style.setProperty('--premium-hover-x', `${x.toFixed(2)}%`);
      event.currentTarget.style.setProperty('--premium-hover-y', `${y.toFixed(2)}%`);
      event.currentTarget.style.setProperty('--premium-rotate-x', `${rotateX.toFixed(2)}deg`);
      event.currentTarget.style.setProperty('--premium-rotate-y', `${rotateY.toFixed(2)}deg`);
    }

    function handleEnter(event) {
      event.currentTarget.dataset.premiumActive = 'true';
    }

    function handleLeave(event) {
      event.currentTarget.dataset.premiumActive = 'false';
      event.currentTarget.style.setProperty('--premium-rotate-x', '0deg');
      event.currentTarget.style.setProperty('--premium-rotate-y', '0deg');
    }

    targets.forEach((target) => {
      target.dataset.premiumHoverTarget = 'true';
      target.dataset.premiumKind = getPremiumHoverKind(target);
      target.addEventListener('pointermove', handleMove);
      target.addEventListener('pointerenter', handleEnter);
      target.addEventListener('pointerleave', handleLeave);
    });

    return () => {
      targets.forEach((target) => {
        target.removeEventListener('pointermove', handleMove);
        target.removeEventListener('pointerenter', handleEnter);
        target.removeEventListener('pointerleave', handleLeave);
      });
    };
  }, [
    currentPath,
    products.length,
    cart?.items?.length,
    rentals.length,
    maintenanceRequests.length,
    adminProducts.length,
    adminOrders.length,
    adminRentals.length,
    adminTickets.length,
    adminUsers.length,
    adminServiceAreas.length,
    adminDamageClaims.length,
    adminAuditLogs.length
  ]);

  useEffect(() => {
    let ignore = false;

    async function loadCatalog() {
      try {
        setLoading(true);
        const [productResponse, categoryResponse] = await Promise.all([
          apiRequest('/products'),
          apiRequest('/categories')
        ]);

        if (!ignore) {
          const nextProducts = productResponse.data || [];
          setProducts(nextProducts);
          setCategories(categoryResponse.data || []);
          setSelectedProduct(nextProducts[0] || null);
          setError('');
        }
      } catch (requestError) {
        if (!ignore) setError(requestError.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadCatalog();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;

    const tenureOptions = selectedProduct.tenureOptions || [];
    const preferredOption = tenureOptions.find((option) => option.months === 6) || tenureOptions[0];
    if (preferredOption) setDetailTenure(preferredOption.months);
    setDetailQuantity(1);
  }, [selectedProduct]);

  useEffect(() => {
    if (session) {
      if (['admin', 'vendor'].includes(session.user?.role)) {
        loadAdminData(session);
      } else {
        loadCustomerData(session);
      }
      return;
    }

    setCart(null);
    setCartError('');
    setOrderResult(null);
    setRentals([]);
    setMaintenanceRequests([]);
    setOperationsError('');
    setOperationsNotice('');
    setMaintenanceForm(defaultMaintenanceForm());
    setReturnForm(defaultReturnForm());
    setAdminOverview(null);
    setAdminProducts([]);
    setAdminOrders([]);
    setAdminRentals([]);
    setAdminTickets([]);
    setAdminReports([]);
    setAdminUsers([]);
    setAdminServiceAreas([]);
    setAdminDamageClaims([]);
    setAdminAuditLogs([]);
    setProductForm(defaultAdminProductForm());
    setEditingProductId('');
    setServiceAreaForm(defaultServiceAreaForm());
    setAdminError('');
    setAdminNotice('');
  }, [session]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const categorySlug = product.category?.slug;
      const matchesCategory = selectedCategory === 'all' || categorySlug === selectedCategory;
      const matchesCity = !selectedCity || product.serviceCities?.includes(selectedCity);
      const matchesSearch =
        !normalizedSearch ||
        [product.name, product.shortDescription, product.type, ...(product.tags || [])]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesCity && matchesSearch;
    });
  }, [products, search, selectedCategory, selectedCity]);

  const productRouteSlug = currentPath.startsWith('/products/') ? decodeURIComponent(currentPath.slice('/products/'.length)) : '';
  const routeProduct = productRouteSlug
    ? products.find((product) => String(product.slug) === productRouteSlug || String(product._id) === productRouteSlug)
    : null;
  const visibleProduct = routeProduct || selectedProduct || filteredProducts[0] || null;
  const selectedTenure =
    visibleProduct?.tenureOptions?.find((option) => option.months === Number(detailTenure)) ||
    visibleProduct?.tenureOptions?.[0];
  const estimateRent = selectedTenure?.monthlyRent || visibleProduct?.monthlyRent || 0;
  const estimateDeposit = visibleProduct?.securityDeposit || 0;
  const cartItems = cart?.items || [];
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartMonthlyTotal = cart?.monthlyTotal || 0;
  const cartDepositTotal = cart?.depositTotal || 0;
  const activeRentals = rentals.filter((rental) => ['active', 'extended', 'return_requested'].includes(rental.status));
  const rentalHistory = rentals.filter((rental) => !['active', 'extended', 'return_requested'].includes(rental.status));
  const selectedMaintenanceRental = rentals.find((rental) => String(rental._id) === String(maintenanceForm.rental));
  const maintenanceProductOptions = selectedMaintenanceRental?.items || [];
  const isOperator = ['admin', 'vendor'].includes(session?.user?.role);
  const visibleNavItems = navItems.filter((item) => item.path !== '/admin' || isOperator);
  const activeServiceCities = adminServiceAreas.filter((area) => area.isActive).map((area) => area.city);

  async function loadCart(activeSession = session) {
    if (!activeSession?.token) return null;

    try {
      setCartLoading(true);
      setCartError('');
      const response = await apiRequest('/cart', {
        headers: authHeaders(activeSession)
      });
      setCart(response.data);
      return response.data;
    } catch (requestError) {
      setCartError(requestError.message);
      return null;
    } finally {
      setCartLoading(false);
    }
  }

  async function loadRentals(activeSession = session) {
    if (!activeSession?.token) return [];

    const response = await apiRequest('/rentals', {
      headers: authHeaders(activeSession)
    });
    const nextRentals = response.data || [];
    setRentals(nextRentals);

    const firstActionableRental = nextRentals.find((rental) => ['active', 'extended', 'return_requested'].includes(rental.status));
    if (firstActionableRental) {
      setMaintenanceForm((current) => ({
        ...current,
        rental: current.rental || firstActionableRental._id,
        product: current.product || firstActionableRental.items?.[0]?.product || ''
      }));
      setReturnForm((current) => ({
        ...current,
        rentalId: current.rentalId || firstActionableRental._id
      }));
    }

    return nextRentals;
  }

  async function loadMaintenanceRequests(activeSession = session) {
    if (!activeSession?.token) return [];

    const response = await apiRequest('/maintenance', {
      headers: authHeaders(activeSession)
    });
    const nextRequests = response.data || [];
    setMaintenanceRequests(nextRequests);
    return nextRequests;
  }

  async function loadCustomerData(activeSession = session) {
    if (!activeSession?.token) return;

    try {
      setOperationsLoading(true);
      setOperationsError('');
      await Promise.all([loadCart(activeSession), loadRentals(activeSession), loadMaintenanceRequests(activeSession)]);
    } catch (requestError) {
      setOperationsError(requestError.message);
    } finally {
      setOperationsLoading(false);
    }
  }

  async function loadAdminData(activeSession = session) {
    if (!activeSession?.token || !['admin', 'vendor'].includes(activeSession.user?.role)) return;

    try {
      setAdminLoading(true);
      setAdminError('');
      const [
        overviewResponse,
        productsResponse,
        ordersResponse,
        rentalsResponse,
        ticketsResponse,
        reportsResponse,
        usersResponse,
        serviceAreasResponse,
        damageClaimsResponse,
        auditLogsResponse
      ] = await Promise.all([
        apiRequest('/admin/overview', { headers: authHeaders(activeSession) }),
        apiRequest('/admin/products', { headers: authHeaders(activeSession) }),
        apiRequest('/admin/orders', { headers: authHeaders(activeSession) }),
        apiRequest('/admin/rentals', { headers: authHeaders(activeSession) }),
        apiRequest('/maintenance', { headers: authHeaders(activeSession) }),
        apiRequest('/admin/reports', { headers: authHeaders(activeSession) }),
        apiRequest('/admin/users', { headers: authHeaders(activeSession) }),
        apiRequest('/admin/service-areas', { headers: authHeaders(activeSession) }),
        apiRequest('/admin/damage-claims', { headers: authHeaders(activeSession) }),
        apiRequest('/admin/audit-logs', { headers: authHeaders(activeSession) })
      ]);

      setAdminOverview(overviewResponse.data);
      setAdminProducts(productsResponse.data || []);
      setAdminOrders(ordersResponse.data || []);
      setAdminRentals(rentalsResponse.data || []);
      setAdminTickets(ticketsResponse.data || []);
      setAdminReports(reportsResponse.data || []);
      setAdminUsers(usersResponse.data || []);
      setAdminServiceAreas(serviceAreasResponse.data || []);
      setAdminDamageClaims(damageClaimsResponse.data || []);
      setAdminAuditLogs(auditLogsResponse.data || []);
    } catch (requestError) {
      setAdminError(requestError.message);
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleProductStatus(productId, status) {
    try {
      setAdminLoading(true);
      setAdminError('');
      setAdminNotice('');
      const response =
        status === 'retired'
          ? await apiRequest(`/admin/products/${productId}`, {
              method: 'DELETE',
              headers: authHeaders(session)
            })
          : await apiRequest(`/admin/products/${productId}`, {
              method: 'PATCH',
              headers: authHeaders(session),
              body: JSON.stringify({ status })
            });

      setAdminProducts((current) => current.map((product) => (product._id === productId ? response.data : product)));
      syncCatalogProduct(response.data);
      setAdminNotice(`${response.data.name} marked as ${response.data.status}.`);
      await loadAdminData(session);
    } catch (requestError) {
      setAdminError(requestError.message);
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleMaintenanceStatus(ticketId, status) {
    try {
      setAdminLoading(true);
      setAdminError('');
      setAdminNotice('');
      const response = await apiRequest(`/admin/maintenance/${ticketId}`, {
        method: 'PATCH',
        headers: authHeaders(session),
        body: JSON.stringify(
          status === 'resolved'
            ? { status, resolution: { notes: 'Marked resolved from admin dashboard.', resolvedAt: new Date().toISOString() } }
            : { status }
        )
      });

      setAdminTickets((current) => current.map((ticket) => (ticket._id === ticketId ? response.data : ticket)));
      setAdminNotice(`Ticket ${response.data.ticketNumber} updated to ${response.data.status}.`);
      await loadAdminData(session);
    } catch (requestError) {
      setAdminError(requestError.message);
    } finally {
      setAdminLoading(false);
    }
  }

  function resetProductForm() {
    setEditingProductId('');
    setProductForm(defaultAdminProductForm());
  }

  function beginProductEdit(product) {
    const tenureByMonth = new Map((product.tenureOptions || []).map((option) => [Number(option.months), option]));
    const productCities = product.serviceCities?.length ? product.serviceCities : activeServiceCities.length ? activeServiceCities : cities;
    setEditingProductId(product._id);
    setProductForm({
      name: product.name || '',
      slug: product.slug || '',
      category: product.category?._id || product.category || '',
      type: product.type || 'furniture',
      shortDescription: product.shortDescription || '',
      monthlyRent: String(product.monthlyRent ?? ''),
      securityDeposit: String(product.securityDeposit ?? ''),
      stock: String(product.stock ?? ''),
      availableStock: String(product.availableStock ?? ''),
      status: product.status || 'active',
      serviceCities: productCities.join(', '),
      imageUrl: product.images?.[0] || '',
      tenure3: String(tenureByMonth.get(3)?.monthlyRent ?? ''),
      tenure6: String(tenureByMonth.get(6)?.monthlyRent ?? ''),
      tenure12: String(tenureByMonth.get(12)?.monthlyRent ?? '')
    });
  }

  function buildProductPayload() {
    const stock = Number(productForm.stock || 0);
    const availableStock = Number(productForm.availableStock || 0);
    const monthlyRent = Number(productForm.monthlyRent || productForm.tenure6 || productForm.tenure3 || productForm.tenure12 || 0);
    const category = productForm.category || categories[0]?._id;

    if (!category) throw new Error('Create a category before adding products.');
    if (availableStock > stock) throw new Error('Available stock cannot be greater than total stock.');

    const tenureOptions = [
      { months: 3, monthlyRent: Number(productForm.tenure3 || monthlyRent), discountPercent: 0 },
      { months: 6, monthlyRent: Number(productForm.tenure6 || monthlyRent), discountPercent: 7 },
      { months: 12, monthlyRent: Number(productForm.tenure12 || monthlyRent), discountPercent: 15 }
    ].filter((option) => option.monthlyRent > 0);

    return {
      name: productForm.name.trim(),
      slug: slugify(productForm.slug || productForm.name),
      category,
      type: productForm.type,
      shortDescription: productForm.shortDescription.trim(),
      monthlyRent,
      securityDeposit: Number(productForm.securityDeposit || 0),
      stock,
      availableStock,
      status: productForm.status,
      serviceCities: splitList(productForm.serviceCities),
      images: splitList(productForm.imageUrl),
      tenureOptions,
      maintenanceIncluded: true,
      deliveryWindowDays: 2
    };
  }

  function syncCatalogProduct(product) {
    setProducts((current) => {
      const exists = current.some((item) => item._id === product._id);
      if (product.status !== 'active') return current.filter((item) => item._id !== product._id);
      return exists ? current.map((item) => (item._id === product._id ? product : item)) : [product, ...current];
    });
    setSelectedProduct((current) => (current?._id === product._id ? product : current));
  }

  async function handleProductSubmit(event) {
    event.preventDefault();

    try {
      setAdminLoading(true);
      setAdminError('');
      setAdminNotice('');
      const payload = buildProductPayload();
      const response = await apiRequest(editingProductId ? `/admin/products/${editingProductId}` : '/admin/products', {
        method: editingProductId ? 'PATCH' : 'POST',
        headers: authHeaders(session),
        body: JSON.stringify(payload)
      });

      setAdminProducts((current) => {
        const exists = current.some((product) => product._id === response.data._id);
        return exists
          ? current.map((product) => (product._id === response.data._id ? response.data : product))
          : [response.data, ...current];
      });
      syncCatalogProduct(response.data);
      setAdminNotice(`${response.data.name} ${editingProductId ? 'updated' : 'created'} successfully.`);
      resetProductForm();
      await loadAdminData(session);
    } catch (requestError) {
      setAdminError(requestError.message);
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleServiceAreaSubmit(event) {
    event.preventDefault();

    try {
      setAdminLoading(true);
      setAdminError('');
      setAdminNotice('');
      const response = await apiRequest('/admin/service-areas', {
        method: 'POST',
        headers: authHeaders(session),
        body: JSON.stringify({
          city: serviceAreaForm.city.trim(),
          state: serviceAreaForm.state.trim(),
          pincodes: splitList(serviceAreaForm.pincodes),
          deliveryFee: Number(serviceAreaForm.deliveryFee || 0),
          pickupFee: Number(serviceAreaForm.pickupFee || 0),
          standardDeliveryDays: Number(serviceAreaForm.standardDeliveryDays || 0),
          isActive: true
        })
      });

      setAdminServiceAreas((current) => [...current, response.data].sort((a, b) => a.city.localeCompare(b.city)));
      setServiceAreaForm(defaultServiceAreaForm());
      setAdminNotice(`${response.data.city} service area added.`);
      await loadAdminData(session);
    } catch (requestError) {
      setAdminError(requestError.message);
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleServiceAreaToggle(area) {
    try {
      setAdminLoading(true);
      setAdminError('');
      setAdminNotice('');
      const response = await apiRequest(`/admin/service-areas/${area._id}`, {
        method: 'PATCH',
        headers: authHeaders(session),
        body: JSON.stringify({ isActive: !area.isActive })
      });

      setAdminServiceAreas((current) => current.map((item) => (item._id === area._id ? response.data : item)));
      setAdminNotice(`${response.data.city} is now ${response.data.isActive ? 'active' : 'inactive'}.`);
      await loadAdminData(session);
    } catch (requestError) {
      setAdminError(requestError.message);
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleDamageClaimStatus(claim, status) {
    try {
      setAdminLoading(true);
      setAdminError('');
      setAdminNotice('');
      const isResolvedStatus = ['approved', 'rejected', 'settled'].includes(status);
      const response = await apiRequest(`/admin/damage-claims/${claim._id}`, {
        method: 'PATCH',
        headers: authHeaders(session),
        body: JSON.stringify({
          status,
          resolutionNotes: isResolvedStatus ? `Marked ${status} from admin dashboard.` : claim.resolutionNotes,
          resolvedAt: isResolvedStatus ? new Date().toISOString() : claim.resolvedAt
        })
      });

      setAdminDamageClaims((current) => current.map((item) => (item._id === claim._id ? response.data : item)));
      setAdminNotice(`Damage claim ${response.data.claimNumber} updated to ${response.data.status}.`);
      await loadAdminData(session);
    } catch (requestError) {
      setAdminError(requestError.message);
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleOrderStatus(order, status) {
    try {
      setAdminLoading(true);
      setAdminError('');
      setAdminNotice('');
      const response = await apiRequest(`/admin/orders/${order._id}`, {
        method: 'PATCH',
        headers: authHeaders(session),
        body: JSON.stringify({ status })
      });

      setAdminOrders((current) => current.map((item) => (item._id === order._id ? response.data : item)));
      setAdminNotice(`${response.data.orderNumber} moved to ${response.data.status}.`);
      await loadAdminData(session);
    } catch (requestError) {
      setAdminError(requestError.message);
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleRentalStatus(rental, patch) {
    try {
      setAdminLoading(true);
      setAdminError('');
      setAdminNotice('');
      const response = await apiRequest(`/admin/rentals/${rental._id}`, {
        method: 'PATCH',
        headers: authHeaders(session),
        body: JSON.stringify(patch)
      });

      setAdminRentals((current) => current.map((item) => (item._id === rental._id ? response.data : item)));
      setAdminNotice(`${response.data.rentalNumber} updated to ${response.data.status.replace('_', ' ')}.`);
      await loadAdminData(session);
    } catch (requestError) {
      setAdminError(requestError.message);
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleUserStatus(user, status) {
    if (String(user._id) === String(session?.user?._id) && status !== 'active') {
      setAdminError('You cannot disable your own admin account.');
      return;
    }

    try {
      setAdminLoading(true);
      setAdminError('');
      setAdminNotice('');
      const response = await apiRequest(`/admin/users/${user._id}`, {
        method: 'PATCH',
        headers: authHeaders(session),
        body: JSON.stringify({ status })
      });

      setAdminUsers((current) => current.map((item) => (item._id === user._id ? response.data : item)));
      setAdminNotice(`${response.data.name} is now ${response.data.status}.`);
      await loadAdminData(session);
    } catch (requestError) {
      setAdminError(requestError.message);
    } finally {
      setAdminLoading(false);
    }
  }

  function selectProduct(product) {
    setSelectedProduct(product);
    navigateTo(productDetailPath(product));
  }

  async function handleLogin(event) {
    event.preventDefault();

    try {
      setAuthLoading(true);
      setAuthError('');
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: authEmail,
          password: authPassword
        })
      });

      await applyAuthenticatedSession(response.data);
    } catch (requestError) {
      setAuthError(requestError.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();

    try {
      setAuthLoading(true);
      setAuthError('');
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(registerForm)
      });

      setAuthEmail(registerForm.email);
      await applyAuthenticatedSession(response.data);
      setNotice('Account created. You can now start renting.');
    } catch (requestError) {
      setAuthError(requestError.message);
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    setSession(null);
    setCart(null);
    setOrderResult(null);
    setRentals([]);
    setMaintenanceRequests([]);
    setMaintenanceForm(defaultMaintenanceForm());
    setReturnForm(defaultReturnForm());
    setAdminOverview(null);
    setAdminProducts([]);
    setAdminOrders([]);
    setAdminRentals([]);
    setAdminTickets([]);
    setAdminReports([]);
    setAdminUsers([]);
    setAdminServiceAreas([]);
    setAdminDamageClaims([]);
    setAdminAuditLogs([]);
    setProductForm(defaultAdminProductForm());
    setEditingProductId('');
    setServiceAreaForm(defaultServiceAreaForm());
    setAdminError('');
    setAdminNotice('');
    setNotice('');
    window.localStorage.removeItem('rentease-session');
  }

  async function handleAddToCart() {
    if (!visibleProduct) return;

    if (!session?.token) {
      setNotice('Sign in to add this rental to your cart.');
      openAuth('login');
      return;
    }

    try {
      setCartLoading(true);
      setCartError('');
      setNotice('');
      setOrderResult(null);
      const response = await apiRequest('/cart/items', {
        method: 'POST',
        headers: authHeaders(session),
        body: JSON.stringify({
          productId: visibleProduct._id,
          quantity: Number(detailQuantity),
          tenureMonths: Number(detailTenure)
        })
      });
      setCart(response.data);
      setNotice(`${visibleProduct.name} added to cart.`);
      navigateTo('/checkout');
    } catch (requestError) {
      setCartError(requestError.message);
    } finally {
      setCartLoading(false);
    }
  }

  async function handleCartItemChange(itemId, patch) {
    try {
      setCartLoading(true);
      setCartError('');
      const response = await apiRequest(`/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: authHeaders(session),
        body: JSON.stringify(patch)
      });
      setCart(response.data);
    } catch (requestError) {
      setCartError(requestError.message);
    } finally {
      setCartLoading(false);
    }
  }

  async function handleRemoveCartItem(itemId) {
    try {
      setCartLoading(true);
      setCartError('');
      const response = await apiRequest(`/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: authHeaders(session)
      });
      setCart(response.data);
    } catch (requestError) {
      setCartError(requestError.message);
    } finally {
      setCartLoading(false);
    }
  }

  function updateCheckoutAddress(field, value) {
    setCheckoutForm((current) => ({
      ...current,
      deliveryAddress: {
        ...current.deliveryAddress,
        [field]: value
      }
    }));
  }

  async function handleCheckout(event) {
    event.preventDefault();

    if (!session?.token) {
      openAuth('login');
      return;
    }

    try {
      setCheckoutLoading(true);
      setCartError('');
      setNotice('');
      const response = await apiRequest('/orders', {
        method: 'POST',
        headers: authHeaders(session),
        body: JSON.stringify({
          deliveryAddress: checkoutForm.deliveryAddress,
          deliveryDate: checkoutForm.deliveryDate,
          notes: checkoutForm.notes
        })
      });
      setOrderResult(response.data);
      setCart({ ...cart, items: [], monthlyTotal: 0, depositTotal: 0 });
      setCheckoutForm(defaultCheckoutForm());
      setNotice('Order placed. Your rental is now active.');
      await loadRentals(session);
    } catch (requestError) {
      setCartError(requestError.message);
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleExtendRental(rentalId, months = 1) {
    try {
      setOperationsLoading(true);
      setOperationsError('');
      setOperationsNotice('');
      const response = await apiRequest(`/rentals/${rentalId}/extend`, {
        method: 'PATCH',
        headers: authHeaders(session),
        body: JSON.stringify({ months })
      });
      setRentals((current) => current.map((rental) => (rental._id === rentalId ? response.data : rental)));
      setOperationsNotice(`Rental ${response.data.rentalNumber} extended by ${months} month${months > 1 ? 's' : ''}.`);
    } catch (requestError) {
      setOperationsError(requestError.message);
    } finally {
      setOperationsLoading(false);
    }
  }

  async function handleReturnRequest(event) {
    event.preventDefault();

    if (!returnForm.rentalId) {
      setOperationsError('Select a rental before requesting return pickup.');
      return;
    }

    try {
      setOperationsLoading(true);
      setOperationsError('');
      setOperationsNotice('');
      const response = await apiRequest(`/rentals/${returnForm.rentalId}/return`, {
        method: 'PATCH',
        headers: authHeaders(session),
        body: JSON.stringify({
          preferredPickupDate: returnForm.preferredPickupDate,
          reason: returnForm.reason
        })
      });
      setRentals((current) => current.map((rental) => (rental._id === returnForm.rentalId ? response.data : rental)));
      setOperationsNotice(`Return pickup requested for ${response.data.rentalNumber}.`);
      setReturnForm(defaultReturnForm());
    } catch (requestError) {
      setOperationsError(requestError.message);
    } finally {
      setOperationsLoading(false);
    }
  }

  function handleMaintenanceRentalChange(rentalId) {
    const rental = rentals.find((item) => String(item._id) === String(rentalId));
    setMaintenanceForm((current) => ({
      ...current,
      rental: rentalId,
      product: rental?.items?.[0]?.product || ''
    }));
  }

  async function handleMaintenanceSubmit(event) {
    event.preventDefault();

    if (!maintenanceForm.rental) {
      setOperationsError('Select a rental before creating a maintenance ticket.');
      return;
    }

    if (maintenanceForm.type !== 'pickup_support' && !maintenanceForm.product) {
      setOperationsError('Select a product for this maintenance request.');
      return;
    }

    try {
      setOperationsLoading(true);
      setOperationsError('');
      setOperationsNotice('');
      const response = await apiRequest('/maintenance', {
        method: 'POST',
        headers: authHeaders(session),
        body: JSON.stringify(maintenanceForm)
      });
      setMaintenanceRequests((current) => [response.data, ...current]);
      setOperationsNotice(`Maintenance ticket ${response.data.ticketNumber} created.`);
      setMaintenanceForm((current) => ({
        ...defaultMaintenanceForm(),
        rental: current.rental,
        product: current.product
      }));
    } catch (requestError) {
      setOperationsError(requestError.message);
    } finally {
      setOperationsLoading(false);
    }
  }

  async function applyAuthenticatedSession(nextSession) {
    setSession(nextSession);
    window.localStorage.setItem('rentease-session', JSON.stringify(nextSession));
    setAuthOpen(false);
    setAuthPassword('');
    setRegisterForm(defaultRegisterForm());
    if (['admin', 'vendor'].includes(nextSession.user?.role)) {
      await loadAdminData(nextSession);
    } else {
      await loadCustomerData(nextSession);
    }
  }

  function openAuth(mode = 'login') {
    setAuthMode(mode);
    setAuthError('');
    setAuthOpen(true);
  }

  function navigateTo(path) {
    const nextPath = normalizePath(path);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    setCurrentPath(nextPath);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleRouteClick(event, path) {
    event.preventDefault();
    navigateTo(path);
  }

  return (
    <main>
      <header className="site-header" aria-label="Primary navigation">
        <a className="brand" href="/" aria-label="RentEase home" onClick={(event) => handleRouteClick(event, '/')}>
          <span className="brand-mark">R</span>
          RentEase
        </a>
        <nav className={`nav-links ${mobileNavOpen ? 'open' : ''}`} aria-label="Main menu">
          {visibleNavItems.map((item) => (
            <a
              aria-current={currentPath === item.path ? 'page' : undefined}
              className={currentPath === item.path ? 'active' : ''}
              href={item.path}
              key={item.path}
              onClick={(event) => handleRouteClick(event, item.path)}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          {session ? (
            <>
              <span className="user-chip">{session.user.name}</span>
              <button className="ghost-button" type="button" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <button className="ghost-button" type="button" onClick={() => openAuth('login')}>
              Sign in
            </button>
          )}
          <a className="solid-button" href="/checkout" onClick={(event) => handleRouteClick(event, '/checkout')}>
            Cart {cartItemCount ? `(${cartItemCount})` : ''}
          </a>
          <button
            aria-expanded={mobileNavOpen}
            aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className={`mobile-nav-toggle ${mobileNavOpen ? 'open' : ''}`}
            onClick={() => setMobileNavOpen((current) => !current)}
            type="button"
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </header>

      {currentPath === '/' && (
        <>
          <section className="hero" id="top">
            <div className="hero-overlay">
              <p className="eyebrow">Monthly furniture and appliance rentals</p>
              <h1>Settle in faster. Rent the essentials monthly.</h1>
              <p className="hero-copy">
                Flexible home packages for professionals, students, and families who need a ready living space without
                ownership overhead.
              </p>
              <div className="hero-actions">
                <a className="solid-button large" href="/catalog" onClick={(event) => handleRouteClick(event, '/catalog')}>
                  Explore furniture
                </a>
                <a className="outline-button large" href="/plans" onClick={(event) => handleRouteClick(event, '/plans')}>
                  See rental plans
                </a>
              </div>
            </div>
          </section>

          <section className="trust-strip" aria-label="Service promises">
            <span>Flexible tenure</span>
            <span>Sanitized inventory</span>
            <span>Delivery scheduling</span>
            <span>Maintenance support</span>
          </section>
        </>
      )}

      {(currentPath === '/' || currentPath === '/catalog') && (
        <section className="section-shell catalog-section" id="catalog">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Shop by need</p>
              <h2>Furniture and appliances for a complete move-in.</h2>
            </div>
            <p>
              Browse city-ready inventory with transparent monthly rent, deposit, tenure, and availability.
            </p>
          </div>

        <div className="catalog-layout">
          <aside className="filter-panel" aria-label="Catalog filters">
            <label>
              Search
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Sofa, fridge, work setup"
              />
            </label>
            <label>
              City
              <CustomSelect
                value={selectedCity}
                onChange={setSelectedCity}
                options={cities.map((city) => ({ value: city, label: city }))}
              />
            </label>
            <div className="category-list" aria-label="Categories">
              <button
                className={selectedCategory === 'all' ? 'active' : ''}
                type="button"
                onClick={() => setSelectedCategory('all')}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  className={selectedCategory === category.slug ? 'active' : ''}
                  key={category._id || category.slug}
                  type="button"
                  onClick={() => setSelectedCategory(category.slug)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </aside>

          <div className="product-area">
            {error && <div className="status-banner error">{error}</div>}
            {loading && <ProductSkeleton />}
            {!loading && !error && !filteredProducts.length && (
              <div className="empty-state">
                <h3>No matching rentals found.</h3>
                <p>Try another category, city, or search term.</p>
              </div>
            )}
            {!loading && !error && filteredProducts.length > 0 && (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <article className="product-card" key={product._id || product.slug}>
                    <div className="product-image">
                      <img src={product.images?.[0]} alt={product.name} />
                      <span>{product.category?.name || product.type}</span>
                    </div>
                    <div className="product-body">
                      <h3>{product.name}</h3>
                      <p>{product.shortDescription}</p>
                      <div className="price-row">
                        <strong>{formatMoney(product.monthlyRent)}</strong>
                        <span>/ month</span>
                      </div>
                      <div className="product-meta">
                        <span>Deposit {formatMoney(product.securityDeposit)}</span>
                        <span>{product.availableStock} available</span>
                      </div>
                      <a
                        className="outline-button"
                        href={productDetailPath(product)}
                        onClick={(event) => {
                          event.preventDefault();
                          selectProduct(product);
                        }}
                      >
                        View details
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
        </section>
      )}

      {(currentPath === '/plans' || productRouteSlug) && (
        <section className="section-shell plan-section" id="plans">
        <div className="plan-copy">
          <p className="eyebrow">Product detail</p>
          <h2>{productRouteSlug ? 'Review this rental before adding it to cart.' : 'Choose tenure, quantity, and review the monthly cost.'}</h2>
          <p>
            Product plans include rent, security deposit, tenure options, city coverage, delivery window, and maintenance
            eligibility.
          </p>
          {notice && <div className="status-banner success">{notice}</div>}
          {cartError && <div className="status-banner error">{cartError}</div>}
        </div>
        <div className="estimate-panel">
          {loading ? (
            <div className="product-detail-loading">
              <span className="skeleton-line title" />
              <span className="skeleton-line copy" />
              <span className="skeleton-line copy short" />
            </div>
          ) : visibleProduct ? (
            <>
              <div className="estimate-product">
                <img src={visibleProduct.images?.[0]} alt={visibleProduct.name} />
                <div>
                  <h3>{visibleProduct.name}</h3>
                  <p>{visibleProduct.description || visibleProduct.shortDescription}</p>
                </div>
              </div>
              <div className="estimate-grid">
                <div>
                  <span>Monthly rent</span>
                  <strong>{formatMoney(estimateRent)}</strong>
                </div>
                <div>
                  <span>Security deposit</span>
                  <strong>{formatMoney(estimateDeposit)}</strong>
                </div>
                <div>
                  <span>Available stock</span>
                  <strong>{visibleProduct.availableStock}</strong>
                </div>
                <div>
                  <span>Maintenance</span>
                  <strong>{visibleProduct.maintenanceIncluded ? 'Included' : 'Optional'}</strong>
                </div>
              </div>
              <div className="detail-controls">
                <label>
                  Tenure
                  <CustomSelect
                    value={detailTenure}
                    onChange={(value) => setDetailTenure(Number(value))}
                    options={(visibleProduct.tenureOptions || []).map((option) => ({
                      value: option.months,
                      label: `${option.months} months - ${formatMoney(option.monthlyRent)} / month`
                    }))}
                  />
                </label>
                <label>
                  Quantity
                  <input
                    min="1"
                    max={visibleProduct.availableStock}
                    type="number"
                    value={detailQuantity}
                    onChange={(event) => setDetailQuantity(Math.max(1, Number(event.target.value || 1)))}
                  />
                </label>
                <button className="solid-button large" disabled={cartLoading || !visibleProduct.availableStock} type="button" onClick={handleAddToCart}>
                  {cartLoading ? 'Updating cart' : 'Add to cart'}
                </button>
              </div>
              <div className="tenure-row">
                {(visibleProduct.tenureOptions || []).map((option) => (
                  <span key={option.months}>
                    {option.months} months - {formatMoney(option.monthlyRent)}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h3>{productRouteSlug ? 'Product not found.' : 'Select a product to view plan details.'}</h3>
              <p>{productRouteSlug ? 'The rental may be unavailable or retired. Browse the catalog for active options.' : 'Open the catalog and choose any rental item.'}</p>
              <a className="outline-button" href="/catalog" onClick={(event) => handleRouteClick(event, '/catalog')}>
                Browse catalog
              </a>
            </div>
          )}
        </div>
        </section>
      )}

      {currentPath === '/checkout' && (
        <section className="section-shell checkout-section" id="checkout">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Cart and checkout</p>
            <h2>Confirm the rental cart and schedule delivery.</h2>
          </div>
          <p>
            Checkout creates a placed order and active rental from the cart. Payment collection can be connected after
            provider selection.
          </p>
        </div>

        {!session ? (
          <div className="signin-panel">
            <div>
              <h3>Sign in to manage your cart.</h3>
              <p>Cart, checkout, rentals, and maintenance requests are protected account actions.</p>
            </div>
            <button className="solid-button large" type="button" onClick={() => openAuth('login')}>
              Sign in
            </button>
          </div>
        ) : (
          <div className="checkout-layout">
            <div className="cart-panel">
              <div className="panel-title-row">
                <div>
                  <p className="eyebrow">Selected rentals</p>
                  <h3>{cartItemCount ? `${cartItemCount} item${cartItemCount > 1 ? 's' : ''} in cart` : 'Cart is empty'}</h3>
                </div>
                <button className="ghost-button" type="button" onClick={() => loadCart()} disabled={cartLoading}>
                  Refresh
                </button>
              </div>

              {cartLoading && <div className="status-banner">Updating cart...</div>}
              {cartError && <div className="status-banner error">{cartError}</div>}
              {orderResult && (
                <div className="status-banner success">
                  Order {orderResult.order.orderNumber} created. Rental {orderResult.rental.rentalNumber} is active.
                </div>
              )}

              {!cartItems.length && !cartLoading ? (
                <div className="empty-state">
                  <h3>No products selected yet.</h3>
                  <p>Choose a product above and add it to cart before checkout.</p>
                </div>
              ) : (
                <div className="cart-list">
                  {cartItems.map((item) => (
                    <article className="cart-item" key={item._id}>
                      <img src={item.product?.images?.[0]} alt={item.product?.name || 'Rental item'} />
                      <div>
                        <h3>{item.product?.name || 'Rental item'}</h3>
                        <p>
                          {item.tenureMonths} months at {formatMoney(item.monthlyRent)} / month
                        </p>
                        <div className="cart-controls">
                          <label>
                            Qty
                            <input
                              min="1"
                              max={item.product?.availableStock || 1}
                              type="number"
                              value={item.quantity}
                              onChange={(event) => handleCartItemChange(item._id, { quantity: Number(event.target.value || 1) })}
                            />
                          </label>
                          <label>
                            Tenure
                            <CustomSelect
                              value={item.tenureMonths}
                              onChange={(value) => handleCartItemChange(item._id, { tenureMonths: Number(value) })}
                              options={[3, 6, 12].map((months) => ({ value: months, label: `${months} months` }))}
                            />
                          </label>
                          <button className="ghost-button danger" type="button" onClick={() => handleRemoveCartItem(item._id)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <div className="cart-summary">
                <div>
                  <span>Monthly total</span>
                  <strong>{formatMoney(cartMonthlyTotal)}</strong>
                </div>
                <div>
                  <span>Security deposit</span>
                  <strong>{formatMoney(cartDepositTotal)}</strong>
                </div>
              </div>
            </div>

            <form className="checkout-form" onSubmit={handleCheckout}>
              <p className="eyebrow">Delivery details</p>
              <div className="form-grid">
                <label>
                  Address line 1
                  <input
                    required
                    value={checkoutForm.deliveryAddress.line1}
                    onChange={(event) => updateCheckoutAddress('line1', event.target.value)}
                    placeholder="Flat, building, street"
                  />
                </label>
                <label>
                  Address line 2
                  <input
                    value={checkoutForm.deliveryAddress.line2}
                    onChange={(event) => updateCheckoutAddress('line2', event.target.value)}
                    placeholder="Area or locality"
                  />
                </label>
                <label>
                  City
                  <CustomSelect
                    value={checkoutForm.deliveryAddress.city}
                    onChange={(value) => updateCheckoutAddress('city', value)}
                    options={cities.map((city) => ({ value: city, label: city }))}
                  />
                </label>
                <label>
                  State
                  <input
                    required
                    value={checkoutForm.deliveryAddress.state}
                    onChange={(event) => updateCheckoutAddress('state', event.target.value)}
                    placeholder="State"
                  />
                </label>
                <label>
                  Pincode
                  <input
                    required
                    value={checkoutForm.deliveryAddress.pincode}
                    onChange={(event) => updateCheckoutAddress('pincode', event.target.value)}
                    placeholder="560095"
                  />
                </label>
                <label>
                  Delivery date
                  <input
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    type="date"
                    value={checkoutForm.deliveryDate}
                    onChange={(event) => setCheckoutForm((current) => ({ ...current, deliveryDate: event.target.value }))}
                  />
                </label>
              </div>
              <label>
                Landmark or notes
                <textarea
                  value={checkoutForm.notes}
                  onChange={(event) => setCheckoutForm((current) => ({ ...current, notes: event.target.value }))}
                  placeholder="Lift availability, preferred time window, or access notes"
                />
              </label>
              <button className="solid-button large" disabled={checkoutLoading || !cartItems.length} type="submit">
                {checkoutLoading ? 'Placing order' : 'Place order'}
              </button>
            </form>
          </div>
        )}
        </section>
      )}

      {currentPath === '/rentals' && (
        <section className="section-shell rentals-section" id="rentals">
        <div className="section-heading">
          <div>
            <p className="eyebrow">My rentals</p>
            <h2>Manage active rentals and service requests.</h2>
          </div>
          <p>
            Customers can extend active tenure, request return pickup, and raise maintenance tickets against products in
            their rentals.
          </p>
        </div>

        {!session ? (
          <div className="signin-panel">
            <div>
              <h3>Sign in to view rentals.</h3>
              <p>Rental history, returns, and maintenance tickets are protected account actions.</p>
            </div>
            <button className="solid-button large" type="button" onClick={() => openAuth('login')}>
              Sign in
            </button>
          </div>
        ) : (
          <div className="rentals-layout">
            <div className="rentals-panel">
              <div className="panel-title-row">
                <div>
                  <p className="eyebrow">Active contracts</p>
                  <h3>{activeRentals.length ? `${activeRentals.length} active rental${activeRentals.length > 1 ? 's' : ''}` : 'No active rentals'}</h3>
                </div>
                <button className="ghost-button" disabled={operationsLoading} type="button" onClick={() => loadCustomerData()}>
                  Refresh
                </button>
              </div>

              {operationsLoading && <div className="status-banner">Updating rental data...</div>}
              {operationsError && <div className="status-banner error">{operationsError}</div>}
              {operationsNotice && <div className="status-banner success">{operationsNotice}</div>}

              {!activeRentals.length ? (
                <div className="empty-state">
                  <h3>No active rentals yet.</h3>
                  <p>Place an order from checkout and your rental contract will appear here.</p>
                </div>
              ) : (
                <div className="rental-list">
                  {activeRentals.map((rental) => (
                    <article className="rental-card" key={rental._id}>
                      <div className="rental-card-header">
                        <div>
                          <h3>{rental.rentalNumber}</h3>
                          <p>
                            {formatDate(rental.startDate)} to {formatDate(rental.endDate)}
                          </p>
                        </div>
                        <span className={`status-pill ${rental.status}`}>{rental.status.replace('_', ' ')}</span>
                      </div>
                      <div className="rental-items">
                        {rental.items.map((item) => (
                          <span key={`${rental._id}-${item.product}`}>
                            {item.productName} x {item.quantity}
                          </span>
                        ))}
                      </div>
                      <div className="rental-metrics">
                        <div>
                          <span>Monthly rent</span>
                          <strong>{formatMoney(rental.monthlyTotal)}</strong>
                        </div>
                        <div>
                          <span>Next billing</span>
                          <strong>{formatDate(rental.nextBillingDate)}</strong>
                        </div>
                      </div>
                      <div className="rental-actions">
                        <button
                          className="outline-button"
                          disabled={operationsLoading || rental.status === 'return_requested'}
                          type="button"
                          onClick={() => handleExtendRental(rental._id, 1)}
                        >
                          Extend 1 month
                        </button>
                        <button
                          className="outline-button"
                          disabled={operationsLoading}
                          type="button"
                          onClick={() =>
                            setReturnForm((current) => ({
                              ...current,
                              rentalId: rental._id
                            }))
                          }
                        >
                          Select for return
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <div className="rental-history-block">
                <div className="panel-title-row">
                  <div>
                    <p className="eyebrow">Rental history</p>
                    <h3>{rentalHistory.length ? `${rentalHistory.length} past rental${rentalHistory.length > 1 ? 's' : ''}` : 'No completed history yet'}</h3>
                  </div>
                </div>

                {!rentalHistory.length ? (
                  <div className="empty-state compact-empty">
                    <h3>No completed rental history yet.</h3>
                    <p>Returned, cancelled, and completed rental records will appear here.</p>
                  </div>
                ) : (
                  <div className="history-list">
                    {rentalHistory.map((rental) => (
                      <article className="history-card" key={rental._id}>
                        <div>
                          <strong>{rental.rentalNumber}</strong>
                          <span>{formatDate(rental.startDate)} to {formatDate(rental.endDate)}</span>
                        </div>
                        <span className={`status-pill ${rental.status}`}>{rental.status.replace('_', ' ')}</span>
                        <strong>{formatMoney(rental.monthlyTotal)} / month</strong>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="service-panel">
              <form className="service-form" onSubmit={handleReturnRequest}>
                <p className="eyebrow">Return pickup</p>
                <label>
                  Rental
                  <CustomSelect
                    value={returnForm.rentalId}
                    onChange={(value) => setReturnForm((current) => ({ ...current, rentalId: value }))}
                    options={activeRentals.map((rental) => ({ value: rental._id, label: rental.rentalNumber }))}
                    placeholder="Select rental"
                  />
                </label>
                <label>
                  Preferred pickup date
                  <input
                    min={new Date().toISOString().slice(0, 10)}
                    type="date"
                    value={returnForm.preferredPickupDate}
                    onChange={(event) => setReturnForm((current) => ({ ...current, preferredPickupDate: event.target.value }))}
                  />
                </label>
                <label>
                  Reason
                  <textarea
                    value={returnForm.reason}
                    onChange={(event) => setReturnForm((current) => ({ ...current, reason: event.target.value }))}
                    placeholder="Relocation, upgrade, tenure completed, or other reason"
                  />
                </label>
                <button className="outline-button large" disabled={operationsLoading || !activeRentals.length} type="submit">
                  Request return
                </button>
              </form>

              <form className="service-form" onSubmit={handleMaintenanceSubmit}>
                <p className="eyebrow">Maintenance support</p>
                <label>
                  Rental
                  <CustomSelect
                    value={maintenanceForm.rental}
                    onChange={handleMaintenanceRentalChange}
                    options={activeRentals.map((rental) => ({ value: rental._id, label: rental.rentalNumber }))}
                    placeholder="Select rental"
                  />
                </label>
                <label>
                  Product
                  <CustomSelect
                    value={maintenanceForm.product}
                    onChange={(value) => setMaintenanceForm((current) => ({ ...current, product: value }))}
                    options={maintenanceProductOptions.map((item) => ({ value: item.product, label: item.productName }))}
                    placeholder="Select product"
                  />
                </label>
                <div className="form-grid">
                  <label>
                    Type
                    <CustomSelect
                      value={maintenanceForm.type}
                      onChange={(value) => setMaintenanceForm((current) => ({ ...current, type: value }))}
                      options={[
                        { value: 'repair', label: 'Repair' },
                        { value: 'replacement', label: 'Replacement' },
                        { value: 'inspection', label: 'Inspection' },
                        { value: 'pickup_support', label: 'Pickup support' }
                      ]}
                    />
                  </label>
                  <label>
                    Priority
                    <CustomSelect
                      value={maintenanceForm.priority}
                      onChange={(value) => setMaintenanceForm((current) => ({ ...current, priority: value }))}
                      options={[
                        { value: 'low', label: 'Low' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'high', label: 'High' },
                        { value: 'urgent', label: 'Urgent' }
                      ]}
                    />
                  </label>
                </div>
                <label>
                  Description
                  <textarea
                    required
                    value={maintenanceForm.description}
                    onChange={(event) => setMaintenanceForm((current) => ({ ...current, description: event.target.value }))}
                    placeholder="Describe the issue, appliance behavior, noise, damage, or access details"
                  />
                </label>
                <button className="solid-button large" disabled={operationsLoading || !activeRentals.length} type="submit">
                  Create ticket
                </button>
              </form>

              <div className="ticket-list">
                <p className="eyebrow">Recent tickets</p>
                {!maintenanceRequests.length ? (
                  <div className="empty-state">
                    <h3>No maintenance tickets yet.</h3>
                    <p>Raise a support request from the form above.</p>
                  </div>
                ) : (
                  maintenanceRequests.slice(0, 4).map((ticket) => (
                    <article className="ticket-card" key={ticket._id}>
                      <div>
                        <h3>{ticket.ticketNumber}</h3>
                        <p>{ticket.description}</p>
                      </div>
                      <span className={`status-pill ${ticket.status}`}>{ticket.status}</span>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        </section>
      )}

      {currentPath === '/support' && (
        <section className="section-shell support-section" id="support">
        <div>
          <p className="eyebrow">Operations-ready</p>
          <h2>Delivery, pickup, maintenance, and claims are part of the platform flow.</h2>
        </div>
        <div className="ops-grid">
          <article>
            <span>01</span>
            <h3>Schedule delivery</h3>
            <p>Orders store delivery address, preferred date, fee, and city coverage.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Manage rentals</h3>
            <p>Active rentals track tenure, next billing date, extension, and return requests.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Resolve support</h3>
            <p>Maintenance tickets connect users, rentals, products, priority, schedule, and resolution.</p>
          </article>
        </div>
        </section>
      )}

      {currentPath === '/admin' && (
        <section className="section-shell admin-section" id="admin">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Admin workspace</p>
            <h2>Operate inventory, orders, rentals, and service requests.</h2>
          </div>
          <p>
            Admin and vendor users can monitor operational KPIs, product availability, active orders, rentals,
            maintenance tickets, and report snapshots from live API data.
          </p>
        </div>

        {!session ? (
          <div className="signin-panel admin-access-panel">
            <div>
              <h3>Sign in as admin or vendor.</h3>
              <p>Operational dashboards are protected by role-based access.</p>
            </div>
            <button className="solid-button large" type="button" onClick={() => openAuth('login')}>
              Sign in
            </button>
          </div>
        ) : !isOperator ? (
          <div className="signin-panel admin-access-panel">
            <div>
              <h3>Admin access required.</h3>
              <p>Your current account can browse, rent, and manage customer rentals, but cannot access operations.</p>
            </div>
            <button className="outline-button large" type="button" onClick={handleLogout}>
              Switch account
            </button>
          </div>
        ) : (
          <div className="admin-workspace">
            <div className="panel-title-row">
              <div>
                <p className="eyebrow">Operations control</p>
                <h3>{session.user.role === 'admin' ? 'Admin dashboard' : 'Vendor dashboard'}</h3>
              </div>
              <button className="ghost-button" disabled={adminLoading} type="button" onClick={() => loadAdminData()}>
                Refresh
              </button>
            </div>

            {adminLoading && <div className="status-banner">Loading admin data...</div>}
            {adminError && <div className="status-banner error">{adminError}</div>}
            {adminNotice && <div className="status-banner success">{adminNotice}</div>}

            <div className="admin-kpi-grid">
              <article>
                <span>Active rentals</span>
                <strong>{adminOverview?.activeRentals ?? 0}</strong>
              </article>
              <article>
                <span>MRR</span>
                <strong>{formatMoney(adminOverview?.monthlyRecurringRevenue || 0)}</strong>
              </article>
              <article>
                <span>Utilization</span>
                <strong>{adminOverview?.productUtilizationRate ?? 0}%</strong>
              </article>
              <article>
                <span>Open maintenance</span>
                <strong>{adminOverview?.openMaintenanceRequests ?? 0}</strong>
              </article>
              <article>
                <span>Pending orders</span>
                <strong>{adminOverview?.pendingOrders ?? 0}</strong>
              </article>
              <article>
                <span>Damage claims</span>
                <strong>{adminOverview?.damageClaims ?? 0}</strong>
              </article>
            </div>

            <div className="admin-grid">
              <section className="admin-panel wide-panel">
                <div className="panel-title-row">
                  <div>
                    <p className="eyebrow">Inventory</p>
                    <h3>{adminProducts.length} products</h3>
                  </div>
                </div>
                <form className="admin-form" onSubmit={handleProductSubmit}>
                  <div className="panel-title-row compact-title-row">
                    <div>
                      <p className="eyebrow">Product control</p>
                      <h3>{editingProductId ? 'Edit product' : 'Add product'}</h3>
                    </div>
                    {editingProductId && (
                      <button className="ghost-button" type="button" onClick={resetProductForm}>
                        Cancel edit
                      </button>
                    )}
                  </div>
                  <div className="form-grid admin-form-grid">
                    <label>
                      Product name
                      <input
                        required
                        value={productForm.name}
                        onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
                        placeholder="Urban queen bed"
                      />
                    </label>
                    <label>
                      Slug
                      <input
                        value={productForm.slug}
                        onChange={(event) => setProductForm((current) => ({ ...current, slug: event.target.value }))}
                        placeholder="auto-created from name"
                      />
                    </label>
                    <label>
                      Category
                      <CustomSelect
                        value={productForm.category}
                        onChange={(value) => setProductForm((current) => ({ ...current, category: value }))}
                        options={categories.map((category) => ({ value: category._id, label: category.name }))}
                        placeholder="Select category"
                      />
                    </label>
                    <label>
                      Type
                      <CustomSelect
                        value={productForm.type}
                        onChange={(value) => setProductForm((current) => ({ ...current, type: value }))}
                        options={[
                          { value: 'furniture', label: 'Furniture' },
                          { value: 'appliance', label: 'Appliance' },
                          { value: 'bundle', label: 'Bundle' },
                          { value: 'decor', label: 'Decor' }
                        ]}
                      />
                    </label>
                    <label>
                      Monthly rent
                      <input
                        required
                        min="0"
                        type="number"
                        value={productForm.monthlyRent}
                        onChange={(event) => setProductForm((current) => ({ ...current, monthlyRent: event.target.value }))}
                        placeholder="2499"
                      />
                    </label>
                    <label>
                      Security deposit
                      <input
                        required
                        min="0"
                        type="number"
                        value={productForm.securityDeposit}
                        onChange={(event) => setProductForm((current) => ({ ...current, securityDeposit: event.target.value }))}
                        placeholder="5000"
                      />
                    </label>
                    <label>
                      Stock
                      <input
                        required
                        min="0"
                        type="number"
                        value={productForm.stock}
                        onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))}
                        placeholder="12"
                      />
                    </label>
                    <label>
                      Available
                      <input
                        required
                        min="0"
                        type="number"
                        value={productForm.availableStock}
                        onChange={(event) => setProductForm((current) => ({ ...current, availableStock: event.target.value }))}
                        placeholder="10"
                      />
                    </label>
                    <label>
                      Status
                      <CustomSelect
                        value={productForm.status}
                        onChange={(value) => setProductForm((current) => ({ ...current, status: value }))}
                        options={[
                          { value: 'active', label: 'Active' },
                          { value: 'draft', label: 'Draft' },
                          { value: 'retired', label: 'Retired' }
                        ]}
                      />
                    </label>
                    <label>
                      Image URL
                      <input
                        required
                        value={productForm.imageUrl}
                        onChange={(event) => setProductForm((current) => ({ ...current, imageUrl: event.target.value }))}
                        placeholder="https://images.unsplash.com/..."
                      />
                    </label>
                    <label>
                      Service cities
                      <input
                        required
                        value={productForm.serviceCities}
                        onChange={(event) => setProductForm((current) => ({ ...current, serviceCities: event.target.value }))}
                        placeholder="Bengaluru, Pune"
                      />
                    </label>
                    <label>
                      3 month rent
                      <input
                        min="0"
                        type="number"
                        value={productForm.tenure3}
                        onChange={(event) => setProductForm((current) => ({ ...current, tenure3: event.target.value }))}
                        placeholder="2799"
                      />
                    </label>
                    <label>
                      6 month rent
                      <input
                        min="0"
                        type="number"
                        value={productForm.tenure6}
                        onChange={(event) => setProductForm((current) => ({ ...current, tenure6: event.target.value }))}
                        placeholder="2499"
                      />
                    </label>
                    <label>
                      12 month rent
                      <input
                        min="0"
                        type="number"
                        value={productForm.tenure12}
                        onChange={(event) => setProductForm((current) => ({ ...current, tenure12: event.target.value }))}
                        placeholder="2199"
                      />
                    </label>
                  </div>
                  <label>
                    Short description
                    <textarea
                      required
                      rows="3"
                      value={productForm.shortDescription}
                      onChange={(event) => setProductForm((current) => ({ ...current, shortDescription: event.target.value }))}
                      placeholder="A compact, sanitized rental-ready product for urban homes."
                    />
                  </label>
                  <button className="solid-button" disabled={adminLoading} type="submit">
                    {editingProductId ? 'Update product' : 'Create product'}
                  </button>
                </form>
                <div className="admin-table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Rent</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminProducts.slice(0, 8).map((product) => (
                        <tr key={product._id}>
                          <td>{product.name}</td>
                          <td>{product.category?.name || product.type}</td>
                          <td>{formatMoney(product.monthlyRent)}</td>
                          <td>
                            {product.availableStock}/{product.stock}
                          </td>
                          <td>
                            <span className={`status-pill ${product.status}`}>{product.status}</span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button className="ghost-button" type="button" onClick={() => beginProductEdit(product)}>
                                Edit
                              </button>
                              {product.status === 'active' ? (
                                <button className="ghost-button danger" type="button" onClick={() => handleProductStatus(product._id, 'retired')}>
                                  Retire
                                </button>
                              ) : (
                                <button className="ghost-button" type="button" onClick={() => handleProductStatus(product._id, 'active')}>
                                  Activate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="admin-panel">
                <p className="eyebrow">Orders</p>
                <h3>{adminOrders.length} orders</h3>
                <div className="admin-list">
                  {adminOrders.slice(0, 5).map((order) => (
                    <article key={order._id}>
                      <strong>{order.orderNumber}</strong>
                      <span>{order.user?.name || 'Customer'} - {order.status}</span>
                      <span>{formatMoney(order.monthlyTotal)} / month</span>
                      <div className="workflow-actions">
                        {order.status === 'placed' && (
                          <button className="outline-button" disabled={adminLoading} type="button" onClick={() => handleOrderStatus(order, 'confirmed')}>
                            Confirm
                          </button>
                        )}
                        {order.status === 'confirmed' && (
                          <button className="outline-button" disabled={adminLoading} type="button" onClick={() => handleOrderStatus(order, 'scheduled')}>
                            Schedule
                          </button>
                        )}
                        {order.status === 'scheduled' && (
                          <button className="outline-button" disabled={adminLoading} type="button" onClick={() => handleOrderStatus(order, 'delivered')}>
                            Delivered
                          </button>
                        )}
                        {order.status === 'delivered' && (
                          <button className="solid-button" disabled={adminLoading} type="button" onClick={() => handleOrderStatus(order, 'completed')}>
                            Complete
                          </button>
                        )}
                        {!['cancelled', 'completed'].includes(order.status) && (
                          <button className="ghost-button danger" disabled={adminLoading} type="button" onClick={() => handleOrderStatus(order, 'cancelled')}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                  {!adminOrders.length && <p className="muted-copy">No orders yet.</p>}
                </div>
              </section>

              <section className="admin-panel">
                <p className="eyebrow">Rentals</p>
                <h3>{adminRentals.length} rentals</h3>
                <div className="admin-list">
                  {adminRentals.slice(0, 5).map((rental) => (
                    <article key={rental._id}>
                      <strong>{rental.rentalNumber}</strong>
                      <span>{rental.user?.name || 'Customer'} - {rental.status.replace('_', ' ')}</span>
                      <span>Ends {formatDate(rental.endDate)}</span>
                      <span>Pickup {formatDate(rental.returnRequest?.preferredPickupDate)}</span>
                      <div className="workflow-actions">
                        {rental.status === 'return_requested' && rental.returnRequest?.status !== 'scheduled' && (
                          <button
                            className="outline-button"
                            disabled={adminLoading}
                            type="button"
                            onClick={() => handleRentalStatus(rental, { returnStatus: 'scheduled' })}
                          >
                            Schedule pickup
                          </button>
                        )}
                        {!['returned', 'cancelled'].includes(rental.status) && (
                          <button
                            className="solid-button"
                            disabled={adminLoading}
                            type="button"
                            onClick={() => handleRentalStatus(rental, { status: 'returned', returnStatus: 'completed' })}
                          >
                            Mark returned
                          </button>
                        )}
                        {!['returned', 'cancelled'].includes(rental.status) && (
                          <button
                            className="ghost-button danger"
                            disabled={adminLoading}
                            type="button"
                            onClick={() => handleRentalStatus(rental, { status: 'cancelled' })}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                  {!adminRentals.length && <p className="muted-copy">No rentals yet.</p>}
                </div>
              </section>

              <section className="admin-panel wide-panel">
                <div className="panel-title-row">
                  <div>
                    <p className="eyebrow">Maintenance queue</p>
                    <h3>{adminTickets.length} tickets</h3>
                  </div>
                </div>
                <div className="admin-ticket-grid">
                  {adminTickets.slice(0, 6).map((ticket) => (
                    <article className="admin-ticket-card" key={ticket._id}>
                      <div>
                        <h3>{ticket.ticketNumber}</h3>
                        <p>{ticket.description}</p>
                        <span className={`status-pill ${ticket.status}`}>{ticket.status}</span>
                      </div>
                      <div className="ticket-actions">
                        <button className="outline-button" type="button" onClick={() => handleMaintenanceStatus(ticket._id, 'assigned')}>
                          Assign
                        </button>
                        <button className="outline-button" type="button" onClick={() => handleMaintenanceStatus(ticket._id, 'scheduled')}>
                          Schedule
                        </button>
                        <button className="solid-button" type="button" onClick={() => handleMaintenanceStatus(ticket._id, 'resolved')}>
                          Resolve
                        </button>
                      </div>
                    </article>
                  ))}
                  {!adminTickets.length && <p className="muted-copy">No maintenance tickets yet.</p>}
                </div>
              </section>

              <section className="admin-panel">
                <p className="eyebrow">Service areas</p>
                <h3>{adminServiceAreas.length} cities</h3>
                <form className="admin-form compact-admin-form" onSubmit={handleServiceAreaSubmit}>
                  <label>
                    City
                    <input
                      required
                      value={serviceAreaForm.city}
                      onChange={(event) => setServiceAreaForm((current) => ({ ...current, city: event.target.value }))}
                      placeholder="Chennai"
                    />
                  </label>
                  <label>
                    State
                    <input
                      required
                      value={serviceAreaForm.state}
                      onChange={(event) => setServiceAreaForm((current) => ({ ...current, state: event.target.value }))}
                      placeholder="Tamil Nadu"
                    />
                  </label>
                  <label>
                    Pincodes
                    <input
                      required
                      value={serviceAreaForm.pincodes}
                      onChange={(event) => setServiceAreaForm((current) => ({ ...current, pincodes: event.target.value }))}
                      placeholder="600001, 600042"
                    />
                  </label>
                  <div className="form-grid service-fee-grid">
                    <label>
                      Delivery
                      <input
                        min="0"
                        type="number"
                        value={serviceAreaForm.deliveryFee}
                        onChange={(event) => setServiceAreaForm((current) => ({ ...current, deliveryFee: event.target.value }))}
                        placeholder="299"
                      />
                    </label>
                    <label>
                      Pickup
                      <input
                        min="0"
                        type="number"
                        value={serviceAreaForm.pickupFee}
                        onChange={(event) => setServiceAreaForm((current) => ({ ...current, pickupFee: event.target.value }))}
                        placeholder="249"
                      />
                    </label>
                    <label>
                      Days
                      <input
                        min="0"
                        type="number"
                        value={serviceAreaForm.standardDeliveryDays}
                        onChange={(event) => setServiceAreaForm((current) => ({ ...current, standardDeliveryDays: event.target.value }))}
                      />
                    </label>
                  </div>
                  <button className="solid-button" disabled={adminLoading} type="submit">
                    Add service area
                  </button>
                </form>
                <div className="admin-list">
                  {adminServiceAreas.slice(0, 6).map((area) => (
                    <article className="service-area-item" key={area._id}>
                      <div>
                        <strong>{area.city}</strong>
                        <span>
                          {area.state} - {area.pincodes?.length || 0} pincodes - {formatMoney(area.deliveryFee)} delivery
                        </span>
                      </div>
                      <button className="outline-button" type="button" onClick={() => handleServiceAreaToggle(area)}>
                        {area.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </article>
                  ))}
                  {!adminServiceAreas.length && <p className="muted-copy">No service areas yet.</p>}
                </div>
              </section>

              <section className="admin-panel">
                <p className="eyebrow">Damage claims</p>
                <h3>{adminDamageClaims.length} claims</h3>
                <div className="admin-list claim-list">
                  {adminDamageClaims.slice(0, 5).map((claim) => (
                    <article className="claim-item" key={claim._id}>
                      <div>
                        <strong>{claim.claimNumber}</strong>
                        <span>{claim.product?.name || 'Product'} - {claim.user?.name || 'Customer'}</span>
                        <span>{formatMoney(claim.claimAmount)} - {claim.rental?.rentalNumber || 'Rental'}</span>
                        <span className={`status-pill ${claim.status}`}>{claim.status.replace('_', ' ')}</span>
                      </div>
                      <p>{claim.description}</p>
                      <div className="claim-actions">
                        <button className="outline-button" type="button" onClick={() => handleDamageClaimStatus(claim, 'under_review')}>
                          Review
                        </button>
                        <button className="outline-button" type="button" onClick={() => handleDamageClaimStatus(claim, 'approved')}>
                          Approve
                        </button>
                        <button className="outline-button" type="button" onClick={() => handleDamageClaimStatus(claim, 'rejected')}>
                          Reject
                        </button>
                        <button className="solid-button" type="button" onClick={() => handleDamageClaimStatus(claim, 'settled')}>
                          Settle
                        </button>
                      </div>
                    </article>
                  ))}
                  {!adminDamageClaims.length && <p className="muted-copy">No damage claims yet.</p>}
                </div>
              </section>

              <section className="admin-panel">
                <p className="eyebrow">Reports</p>
                <h3>{adminReports.length} snapshots</h3>
                <div className="admin-list">
                  {adminReports.slice(0, 3).map((report) => (
                    <article key={report._id}>
                      <strong>{report.period?.type || 'Report'}</strong>
                      <span>MRR {formatMoney(report.metrics?.monthlyRecurringRevenue || 0)}</span>
                      <span>Utilization {report.metrics?.productUtilizationRate || 0}%</span>
                    </article>
                  ))}
                  {!adminReports.length && <p className="muted-copy">No reports yet.</p>}
                </div>
              </section>

              <section className="admin-panel">
                <p className="eyebrow">Audit trail</p>
                <h3>{adminAuditLogs.length} recent actions</h3>
                <div className="admin-list audit-list">
                  {adminAuditLogs.slice(0, 5).map((log) => (
                    <article key={log._id}>
                      <strong>{log.action.replace('.', ' ')}</strong>
                      <span>{log.entityLabel || log.entityType}</span>
                      <span>
                        {log.actorName} - {log.actorRole} - {formatDate(log.createdAt)}
                      </span>
                    </article>
                  ))}
                  {!adminAuditLogs.length && <p className="muted-copy">No audit actions yet.</p>}
                </div>
              </section>

              <section className="admin-panel">
                <p className="eyebrow">Users</p>
                <h3>{adminUsers.length} accounts</h3>
                <div className="admin-list">
                  {adminUsers.slice(0, 5).map((user) => (
                    <article key={user._id}>
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                      <span>{user.role} - {user.status}</span>
                      {session?.user?.role === 'admin' && (
                        <div className="workflow-actions">
                          <button
                            className={user.status === 'active' ? 'ghost-button danger' : 'outline-button'}
                            disabled={adminLoading || String(user._id) === String(session?.user?._id)}
                            type="button"
                            onClick={() => handleUserStatus(user, user.status === 'active' ? 'blocked' : 'active')}
                          >
                            {user.status === 'active' ? 'Block' : 'Activate'}
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                  {!adminUsers.length && <p className="muted-copy">No users yet.</p>}
                </div>
              </section>
            </div>
          </div>
        )}
        </section>
      )}

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand-block">
            <a className="brand" href="/" aria-label="RentEase home" onClick={(event) => handleRouteClick(event, '/')}>
              <span className="brand-mark">R</span>
              RentEase
            </a>
            <p>Monthly furniture and appliance rentals for flexible urban living.</p>
          </div>

          <nav className="footer-links" aria-label="Footer navigation">
            <h3>Explore</h3>
            {visibleNavItems.map((item) => (
              <a href={item.path} key={`footer-${item.path}`} onClick={(event) => handleRouteClick(event, item.path)}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="footer-links">
            <h3>Service cities</h3>
            {cities.map((city) => (
              <span key={city}>{city}</span>
            ))}
          </div>

          <div className="footer-card">
            <h3>Need help?</h3>
            <p>For maintenance, return pickup, or delivery support, open your rentals page and raise a ticket.</p>
            <a className="outline-button" href="/rentals" onClick={(event) => handleRouteClick(event, '/rentals')}>
              Manage rentals
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 RentEase. All rights reserved.</span>
          <span>MERN rental platform</span>
        </div>
      </footer>

      {authOpen && (
        <div className="modal-backdrop">
          <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
            <div className="auth-header">
              <div>
                <p className="eyebrow">Account</p>
                <h2 id="auth-title">{authMode === 'register' ? 'Create your RentEase account' : 'Sign in to RentEase'}</h2>
              </div>
              <button className="ghost-button" type="button" onClick={() => setAuthOpen(false)}>
                Close
              </button>
            </div>
            <div className="auth-tabs" role="tablist" aria-label="Account actions">
              <button
                aria-selected={authMode === 'login'}
                className={authMode === 'login' ? 'active' : ''}
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                role="tab"
                type="button"
              >
                Sign in
              </button>
              <button
                aria-selected={authMode === 'register'}
                className={authMode === 'register' ? 'active' : ''}
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
                role="tab"
                type="button"
              >
                Create account
              </button>
            </div>
            <form className="auth-form" onSubmit={authMode === 'register' ? handleRegister : handleLogin}>
              {notice && !session && <div className="status-banner">{notice}</div>}
              {authMode === 'register' && (
                <>
                  <label>
                    Full name
                    <input
                      autoComplete="name"
                      required
                      value={registerForm.name}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Ajay Kumar"
                    />
                  </label>
                  <label>
                    Phone
                    <input
                      autoComplete="tel"
                      required
                      value={registerForm.phone}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, phone: event.target.value }))}
                      placeholder="9876543210"
                    />
                  </label>
                  <label>
                    City
                    <CustomSelect
                      value={registerForm.city}
                      onChange={(value) => setRegisterForm((current) => ({ ...current, city: value }))}
                      options={cities.map((city) => ({ value: city, label: city }))}
                    />
                  </label>
                </>
              )}
              <label>
                Email
                <input
                  autoComplete="email"
                  required
                  type="email"
                  value={authMode === 'register' ? registerForm.email : authEmail}
                  onChange={(event) =>
                    authMode === 'register'
                      ? setRegisterForm((current) => ({ ...current, email: event.target.value }))
                      : setAuthEmail(event.target.value)
                  }
                />
              </label>
              <label>
                Password
                <input
                  autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                  minLength={8}
                  required
                  type="password"
                  value={authMode === 'register' ? registerForm.password : authPassword}
                  onChange={(event) =>
                    authMode === 'register'
                      ? setRegisterForm((current) => ({ ...current, password: event.target.value }))
                      : setAuthPassword(event.target.value)
                  }
                />
              </label>
              {authError && <div className="status-banner error">{authError}</div>}
              <button className="solid-button large" disabled={authLoading} type="submit">
                {authLoading ? 'Please wait' : authMode === 'register' ? 'Create account' : 'Sign in'}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

function ProductSkeleton() {
  return (
    <div className="product-grid skeleton-grid" aria-label="Loading products">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div className="product-card skeleton" key={item}>
          <div className="skeleton-media">
            <span className="skeleton-badge" />
          </div>
          <div className="product-body">
            <span className="skeleton-line title" />
            <span className="skeleton-line copy" />
            <span className="skeleton-line copy short" />
            <div className="skeleton-price-row">
              <span className="skeleton-line price" />
              <span className="skeleton-line micro" />
            </div>
            <div className="skeleton-meta-row">
              <span className="skeleton-chip" />
              <span className="skeleton-chip" />
            </div>
            <span className="skeleton-button" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;

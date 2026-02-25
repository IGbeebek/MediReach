const API_BASE = '/api';

async function request(endpoint, { method = 'GET', body, token, headers: extra } = {}) {
  const headers = { ...extra };
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.message || res.statusText || 'Request failed';
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),

  register: (payload) =>
    request('/auth/register', { method: 'POST', body: payload }),

  refreshToken: (refreshToken) =>
    request('/auth/refresh-token', { method: 'POST', body: { refreshToken } }),

  logout: (refreshToken, token) =>
    request('/auth/logout', { method: 'POST', body: { refreshToken }, token }),

  getProfile: (token) =>
    request('/auth/me', { token }),

  changePassword: (body, token) =>
    request('/auth/change-password', { method: 'POST', body, token }),

  forgotPassword: (email) =>
    request('/auth/forgot-password', { method: 'POST', body: { email } }),

  resetPassword: (token, newPassword) =>
    request('/auth/reset-password', { method: 'POST', body: { token, newPassword } }),

  // Medicines
  getMedicines: (params = '') => request(`/medicines${params ? '?' + params : ''}`),
  getMedicine: (id) => request(`/medicines/${id}`),

  // ─── Cart ───
  getCart: (token) => request('/cart', { token }),

  addToCart: (body, token) =>
    request('/cart/items', { method: 'POST', body, token }),

  updateCartItem: (medicineId, body, token) =>
    request(`/cart/items/${medicineId}`, { method: 'PUT', body, token }),

  removeCartItem: (medicineId, token) =>
    request(`/cart/items/${medicineId}`, { method: 'DELETE', token }),

  clearCart: (token) =>
    request('/cart', { method: 'DELETE', token }),

  // ─── Orders ───
  checkout: (body, token) =>
    request('/orders/checkout', { method: 'POST', body, token }),

  getMyOrders: (params, token) =>
    request(`/orders/my${params ? '?' + params : ''}`, { token }),

  getOrder: (id, token) => request(`/orders/${id}`, { token }),

  getAllOrders: (params, token) =>
    request(`/orders${params ? '?' + params : ''}`, { token }),

  updateOrderStatus: (id, body, token) =>
    request(`/orders/${id}/status`, { method: 'PATCH', body, token }),

  cancelOrder: (id, token) =>
    request(`/orders/${id}/cancel`, { method: 'POST', token }),

  // ─── Payments ───
  initiateEsewa: (body, token) =>
    request('/payments/esewa/initiate', { method: 'POST', body, token }),

  verifyEsewa: (body, token) =>
    request('/payments/esewa/verify', { method: 'POST', body, token }),

  initiateKhalti: (body, token) =>
    request('/payments/khalti/initiate', { method: 'POST', body, token }),

  verifyKhalti: (body, token) =>
    request('/payments/khalti/verify', { method: 'POST', body, token }),

  getOrderPayments: (orderId, token) =>
    request(`/payments/order/${orderId}`, { token }),

  // Prescriptions
  uploadPrescription: (formData, token) =>
    request('/prescriptions/upload', { method: 'POST', body: formData, token }),
  getMyPrescriptions: (token) => request('/prescriptions/my', { token }),

  // Chatbot
  sendMessage: (body, token) =>
    request('/chatbot/message', { method: 'POST', body, token }),
};

export default api;

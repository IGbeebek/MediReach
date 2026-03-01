import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PAYMENT_METHODS } from '../../data/constants';
import QtyControls from '../../components/ui/QtyControls';
import MapPlaceholder from '../../components/ui/MapPlaceholder';
import api from '../../services/api';

export default function CartCheckoutPage() {
  const { items, subtotal, tax, deliveryFee, grandTotal, freeDeliveryThreshold, updateQty, removeFromCart, fetchCart, loading: cartLoading } = useCart();
  const { accessToken } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({ street: '', city: 'Kathmandu', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderPlaced, setOrderPlaced] = useState(null); // holds placed order
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    if (!address.street.trim() || !address.phone.trim()) {
      addToast('Please fill in delivery address and phone.', 'error');
      setStep(2);
      return;
    }
    try {
      setPlacing(true);
      const shippingAddress = `${address.street}, ${address.city}`;
      const res = await api.checkout(
        { paymentMethod, shippingAddress, shippingPhone: address.phone },
        accessToken
      );
      const order = res.data?.order;
      setOrderPlaced(order);
      await fetchCart(); // refresh cart (should be empty now)
      addToast('Order placed successfully!');

      // If eSewa/Khalti, initiate payment flow
      if (paymentMethod === 'esewa' && order) {
        try {
          const payRes = await api.initiateEsewa({ orderId: order.id }, accessToken);
          const form = payRes.data;
          // Build and submit eSewa form
          const esewaForm = document.createElement('form');
          esewaForm.method = 'POST';
          esewaForm.action = form.paymentUrl;
          Object.entries(form.formData).forEach(([key, val]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = val;
            esewaForm.appendChild(input);
          });
          document.body.appendChild(esewaForm);
          esewaForm.submit();
          return;
        } catch (err) {
          addToast('eSewa initiation failed. You can pay later from order details.', 'error');
        }
      }

      if (paymentMethod === 'khalti' && order) {
        try {
          const payRes = await api.initiateKhalti({ orderId: order.id }, accessToken);
          const { paymentUrl } = payRes.data;
          window.location.href = paymentUrl;
          return;
        } catch (err) {
          addToast('Khalti initiation failed. You can pay later from order details.', 'error');
        }
      }
    } catch (err) {
      addToast(err.message || 'Checkout failed', 'error');
    } finally {
      setPlacing(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="max-w-md mx-auto text-center py-12 page-enter">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="font-fraunces text-2xl font-semibold text-charcoal">Order confirmed</h2>
        <p className="text-charcoal/60 mt-2">Order #{orderPlaced.orderNumber} — Rs. {orderPlaced.grandTotal}</p>
        <p className="text-charcoal/60 text-sm mt-1">Thank you for your order. We&apos;ll deliver soon.</p>
        <Link to="/customer/orders" className="mt-6 inline-block rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-primary-dark">
          View My Orders
        </Link>
      </div>
    );
  }

  if (items.length === 0 && step === 1 && !cartLoading) {
    return (
      <div className="max-w-md mx-auto text-center py-12 page-enter">
        <p className="text-charcoal/60">Your cart is empty.</p>
        <Link to="/customer/medicines" className="text-primary font-medium mt-2 inline-block">Browse medicines</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 page-enter">
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              step === s ? 'bg-primary text-white' : 'bg-charcoal/10 text-charcoal'
            }`}
          >
            {s === 1 ? 'Cart' : s === 2 ? 'Address' : 'Payment'}
          </button>
        ))}
      </div>

      {step === 1 && (
        <>
          <div className="rounded-xl border border-charcoal/10 bg-white overflow-hidden">
            <ul className="divide-y divide-charcoal/10">
              {items.map((item) => (
                <li key={item.medicineId} className="flex items-center gap-4 p-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">💊</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-charcoal">{item.medicineName}</p>
                    <p className="text-sm text-charcoal/60">Rs. {item.price} each</p>
                  </div>
                  <QtyControls
                    qty={item.quantity}
                    onIncrease={() => updateQty(item.medicineId, item.quantity + 1)}
                    onDecrease={() => updateQty(item.medicineId, item.quantity - 1)}
                  />
                  <p className="font-fraunces font-semibold text-charcoal w-20 text-right">Rs. {item.lineTotal}</p>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.medicineId)}
                    className="text-soft-red text-sm hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-charcoal/10 p-4 space-y-1 text-right">
              <p className="text-charcoal/70">Subtotal: Rs. {subtotal}</p>
              <p className="text-charcoal/70">Tax (13% VAT): Rs. {tax}</p>
              <p className="text-charcoal/70">
                Delivery: Rs. {deliveryFee}
                {deliveryFee === 0 && <span className="text-primary ml-1">(Free!)</span>}
              </p>
              <p className="font-fraunces text-lg font-semibold text-charcoal">Total: Rs. {grandTotal}</p>
              {subtotal < freeDeliveryThreshold && (
                <p className="text-xs text-charcoal/50">Add Rs. {freeDeliveryThreshold - subtotal} more for free delivery</p>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-primary-dark"
            >
              Continue to delivery
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="rounded-xl border border-charcoal/10 bg-white p-6 space-y-4">
            <h3 className="font-fraunces font-semibold text-charcoal">Delivery address</h3>
            <input
              type="text"
              value={address.street}
              onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
              placeholder="Street, Ward, Area"
              className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 focus:border-primary outline-none"
            />
            <input
              type="text"
              value={address.city}
              onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
              placeholder="City"
              className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 focus:border-primary outline-none"
            />
            <input
              type="tel"
              value={address.phone}
              onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))}
              placeholder="Phone"
              className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 focus:border-primary outline-none"
            />
            <MapPlaceholder />
          </div>
          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(1)} className="rounded-lg border border-charcoal/20 px-4 py-2.5 font-medium text-charcoal">
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!address.street.trim() || !address.phone.trim()}
              className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-primary-dark disabled:opacity-50"
            >
              Continue to payment
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="rounded-xl border border-charcoal/10 bg-white p-6">
            <h3 className="font-fraunces font-semibold text-charcoal mb-4">Payment method</h3>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((pm) => (
                <label
                  key={pm.id}
                  className={`flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-colors ${
                    paymentMethod === pm.id ? 'border-primary bg-primary/5' : 'border-charcoal/20 hover:bg-charcoal/5'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={pm.id}
                    checked={paymentMethod === pm.id}
                    onChange={() => setPaymentMethod(pm.id)}
                    className="text-primary"
                  />
                  <span className="text-2xl">{pm.logo}</span>
                  <span className="font-medium text-charcoal">{pm.name}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 space-y-1 text-sm text-charcoal/60">
              <p>Subtotal: Rs. {subtotal}</p>
              <p>Tax: Rs. {tax}</p>
              <p>Delivery: Rs. {deliveryFee}</p>
              <p className="font-semibold text-charcoal">Total: Rs. {grandTotal}</p>
            </div>
          </div>
          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(2)} className="rounded-lg border border-charcoal/20 px-4 py-2.5 font-medium text-charcoal">
              Back
            </button>
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={placing}
              className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {placing ? 'Placing order…' : 'Place order'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

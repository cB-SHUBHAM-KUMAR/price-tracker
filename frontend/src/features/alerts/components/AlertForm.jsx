import { useState } from 'react';
import './AlertForm.css';

const INITIAL_FORM = {
  title: '',
  type: 'product',
  targetPrice: '',
  currency: 'INR',
  condition: 'below',
  notifyEmail: '',
  trackingUrl: '',
  brand: '',
  category: '',
};

function AlertForm({ onSubmit, loading }) {
  const [form, setForm] = useState(INITIAL_FORM);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.targetPrice) return;

    onSubmit({
      title: form.title.trim(),
      type: form.type,
      targetPrice: parseFloat(form.targetPrice),
      currency: form.currency,
      condition: form.condition,
      notifyEmail: form.notifyEmail.trim(),
      trackingUrl: form.trackingUrl.trim(),
      metadata: {
        title: form.title.trim(),
        brand: form.brand.trim(),
        category: form.category.trim(),
      },
    });

    setForm(INITIAL_FORM);
  };

  return (
    <form className="alert-form" onSubmit={handleSubmit}>
      <h2 className="alert-form__title">Create alert</h2>
      <p className="alert-form__subtitle">
        Add a tracking URL to enable automatic scheduler checks and notifications.
      </p>

      <div className="alert-form__row">
        <div className="alert-form__group alert-form__group--wide">
          <label htmlFor="alert-title">Item name *</label>
          <input
            id="alert-title"
            type="text"
            placeholder="iPhone 15 Pro"
            value={form.title}
            onChange={(event) => update('title', event.target.value)}
            required
          />
        </div>

        <div className="alert-form__group">
          <label htmlFor="alert-type">Type</label>
          <select id="alert-type" value={form.type} onChange={(event) => update('type', event.target.value)}>
            <option value="product">Product</option>
            <option value="hotel">Hotel</option>
            <option value="flight">Flight</option>
          </select>
        </div>
      </div>

      <div className="alert-form__row">
        <div className="alert-form__group">
          <label htmlFor="alert-target">Target price *</label>
          <input
            id="alert-target"
            type="number"
            min="1"
            placeholder="20000"
            value={form.targetPrice}
            onChange={(event) => update('targetPrice', event.target.value)}
            required
          />
        </div>

        <div className="alert-form__group">
          <label htmlFor="alert-condition">Condition</label>
          <select id="alert-condition" value={form.condition} onChange={(event) => update('condition', event.target.value)}>
            <option value="below">Below</option>
            <option value="above">Above</option>
            <option value="equals">Equals</option>
          </select>
        </div>

        <div className="alert-form__group">
          <label htmlFor="alert-currency">Currency</label>
          <select id="alert-currency" value={form.currency} onChange={(event) => update('currency', event.target.value)}>
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>

      <div className="alert-form__row">
        <div className="alert-form__group">
          <label htmlFor="alert-brand">Brand (optional)</label>
          <input
            id="alert-brand"
            type="text"
            placeholder="Apple"
            value={form.brand}
            onChange={(event) => update('brand', event.target.value)}
          />
        </div>

        <div className="alert-form__group">
          <label htmlFor="alert-category">Category (optional)</label>
          <input
            id="alert-category"
            type="text"
            placeholder="electronics"
            value={form.category}
            onChange={(event) => update('category', event.target.value)}
          />
        </div>
      </div>

      <div className="alert-form__group">
        <label htmlFor="alert-email">Notification email (optional)</label>
        <input
          id="alert-email"
          type="email"
          placeholder="you@example.com"
          value={form.notifyEmail}
          onChange={(event) => update('notifyEmail', event.target.value)}
        />
      </div>

      <div className="alert-form__group">
        <label htmlFor="alert-url">Tracking URL (optional)</label>
        <input
          id="alert-url"
          type="url"
          placeholder="https://www.amazon.in/dp/..."
          value={form.trackingUrl}
          onChange={(event) => update('trackingUrl', event.target.value)}
        />
      </div>

      <button type="submit" className="alert-form__submit" disabled={loading}>
        {loading ? 'Creating alert...' : 'Create alert'}
      </button>
    </form>
  );
}

export default AlertForm;

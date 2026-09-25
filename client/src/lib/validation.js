export const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  phone: /^[6-9]\d{9}$/,
  pincode: /^\d{6}$/,
  name: /^[A-Za-z][A-Za-z\s.'-]{1,79}$/,
  orderId: /^[A-Za-z0-9-]{6,40}$/,
}

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
]

export function validateFields(values, rules) {
  const errors = {}
  for (const [field, rule] of Object.entries(rules)) {
    const value = String(values[field] ?? '').trim()
    if (rule.required && !value) {
      errors[field] = rule.required
      continue
    }
    if (!value) continue
    if (rule.min && value.length < rule.min) errors[field] = rule.minMessage || `Enter at least ${rule.min} characters`
    else if (rule.max && value.length > rule.max) errors[field] = rule.maxMessage || `Use at most ${rule.max} characters`
    else if (rule.pattern && !rule.pattern.test(value)) errors[field] = rule.message
    else if (typeof rule.test === 'function') {
      const result = rule.test(value, values)
      if (result) errors[field] = result
    }
  }
  return errors
}

export const AUTH_RULES = {
  name: { required: 'Enter your full name', min: 2, minMessage: 'Name must be at least 2 characters', pattern: PATTERNS.name, message: 'Use letters only in your name' },
  email: { required: 'Enter your email address', pattern: PATTERNS.email, message: 'Enter a valid email address' },
  phone: { required: 'Enter your mobile number', pattern: PATTERNS.phone, message: 'Enter a valid 10-digit Indian mobile number' },
  password: { required: 'Enter your password', min: 8, minMessage: 'Password must be at least 8 characters' },
}

export const ADDRESS_RULES = {
  label: { required: 'Add a label such as Home or Work', min: 2, max: 30 },
  fullName: AUTH_RULES.name,
  phone: AUTH_RULES.phone,
  email: { pattern: PATTERNS.email, message: 'Enter a valid email address' },
  address: { required: 'Enter house number, street and area', min: 8, minMessage: 'Enter a more complete street address' },
  city: { required: 'Enter your city', min: 2, minMessage: 'Enter a valid city' },
  state: { required: 'Select your state' },
  pincode: { required: 'Enter a 6-digit pincode', pattern: PATTERNS.pincode, message: 'Pincode must be 6 digits' },
  country: { required: 'Enter your country' },
}

export const TRACK_RULES = {
  orderId: { required: 'Enter your order ID', pattern: PATTERNS.orderId, message: 'Enter a valid order ID' },
  phone: AUTH_RULES.phone,
}

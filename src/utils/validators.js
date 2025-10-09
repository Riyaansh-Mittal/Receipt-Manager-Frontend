export const validators = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  required: (value) => {
    return value !== null && value !== undefined && value !== '';
  },

  minLength: (value, min) => {
    return value && value.length >= min;
  },

  maxLength: (value, max) => {
    return value && value.length <= max;
  },
};

export const validateEmail = (email) => {
  if (!validators.required(email)) {
    return 'Email is required';
  }
  if (!validators.email(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validateProfileUpdate = (data) => {
  const errors = {};

  if (data.first_name && !validators.minLength(data.first_name, 1)) {
    errors.first_name = 'First name is required';
  }

  if (data.last_name && !validators.minLength(data.last_name, 1)) {
    errors.last_name = 'Last name is required';
  }

  if (data.email && !validators.email(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  return errors;
};

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, selectUser, selectAuthStatus } from '../../../store/slices/auth.slice';
import { showNotification } from '../../../store/slices/notification.slice';
import { validateProfileUpdate } from '../../../utils/validators';
import { REQUEST_STATUS } from '../../../constants/status.constants';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';

/**
 * User Profile Form Component
 */
const ProfileForm = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const profileStatus = useSelector((state) => state.auth.profileStatus);
  const isLoading = profileStatus === REQUEST_STATUS.LOADING;
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isEdited, setIsEdited] = useState(false);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsEdited(true);
    
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateProfileUpdate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Only send changed fields (excluding email)
    const changedFields = {};
    Object.keys(formData).forEach((key) => {
      if (key !== 'email' && formData[key] !== user[key]) {
        changedFields[key] = formData[key];
      }
    });

    if (Object.keys(changedFields).length === 0) {
      dispatch(
        showNotification({
          type: 'info',
          message: 'No changes to save',
        })
      );
      return;
    }

    try {
      const resultAction = await dispatch(updateProfile(changedFields));
      
      if (updateProfile.fulfilled.match(resultAction)) {
        setIsEdited(false);
        dispatch(
          showNotification({
            type: 'success',
            message: 'Profile updated successfully!',
          })
        );
      } else {
        const errorMessage =
          resultAction.payload?.error?.message || 'Failed to update profile.';
        dispatch(
          showNotification({
            type: 'error',
            message: errorMessage,
          })
        );
      }
    } catch (error) {
      dispatch(
        showNotification({
          type: 'error',
          message: 'An unexpected error occurred.',
        })
      );
    }
  };

  const handleReset = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      });
      setErrors({});
      setIsEdited(false);
    }
  };

  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Profile Information
        </h3>
        <p className="text-gray-600 text-sm">
          Update your account information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            error={errors.first_name}
            placeholder="John"
          />

          <Input
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            error={errors.last_name}
            placeholder="Doe"
          />
        </div>

        <div>
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled
            helperText="To change your email, use the 'Change Email' section below"
          />
          <div className="mt-2">
            {user?.is_email_verified ? (
              <Badge variant="success">Verified</Badge>
            ) : (
              <Badge variant="warning">Not Verified</Badge>
            )}
          </div>
        </div>

        {isEdited && (
          <div className="flex gap-4">
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
            >
              Save Changes
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
};

export default ProfileForm;

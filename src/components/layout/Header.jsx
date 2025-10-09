import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated, logoutUser, fetchProfile } from '../../store/slices/auth.slice';
import { ROUTES } from '../../constants/routes.constants';
import Button from '../ui/Button';

/**
 * Header Component
 */
const Header = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Refresh user data when component mounts (if authenticated)
  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchProfile());
    }
  }, [isAuthenticated, user, dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          {isAuthenticated && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none"
            >
              <svg
                className="h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}
          
          <Link to={ROUTES.HOME} className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RM</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              Receipt Manager
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated && user ? (
            <>
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.email}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                {!user.is_email_verified && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Unverified
                  </span>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : isAuthenticated ? (
            <>
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Link to={ROUTES.LOGIN}>
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface NavbarProps {
  onLogout: () => void;
}

const Navbar = ({ onLogout }: NavbarProps) => {
  const user = useSelector((state: RootState) => state.auth.user);

  const renderNavItems = () => {
    if (!user) return null;

    if (user.isAdmin) {
      return (
        <>
          <Link to="/" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900">
            Home
          </Link>
          <Link
            to="/employee-profiles"
            className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
          >
            Employee Profiles
          </Link>
          <Link
            to="/visa-status-management"
            className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
          >
            Visa Status Management
          </Link>
          <Link
            to="/hiring-management"
            className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
          >
            Hiring Management
          </Link>
        </>
      );
    } else {
      return (
        <>
          <Link to="/" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900">
            Home
          </Link>
          <Link to="/visa" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900">
            Visa Status
          </Link>
          <Link to="/onboarding" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900">
            Onboarding
          </Link>
        </>
      );
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex space-x-8">{renderNavItems()}</div>
          </div>
          <div className="flex items-center">
            {user && (
              <Button variant="outline" onClick={onLogout} className="ml-4">
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

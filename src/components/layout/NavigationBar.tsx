/**
 * NavigationBar Component
 * Main navigation with links and settings button
 */

import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
}

interface NavigationBarProps {
  navItems: NavItem[];
  onSettingsClick: () => void;
}

export default function NavigationBar({
  navItems,
  onSettingsClick,
}: NavigationBarProps) {
  const location = useLocation();

  return (
    <nav className="nav">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <h1 className="nav-title">Scale Master</h1>
        </Link>
        <div className="nav-menu">
          <ul className="nav-links">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="settings-dropdown">
            <button
              className="settings-button"
              onClick={onSettingsClick}
              aria-label="Settings"
            >
              Settings
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

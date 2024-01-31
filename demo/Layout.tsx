import { useBreadcrumb, useMenu } from "@refinedev/core";
import { PropsWithChildren } from "react";
import { Link, NavLink } from "react-router-dom";

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  const { menuItems } = useMenu();
  const { breadcrumbs } = useBreadcrumb();

  return (
    <div className="layout">
      <nav className="menu">
        <ul>
          {menuItems.map((item) => (
            <li key={item.key}>
              <NavLink to={item.route ?? "/"}>{item.label}</NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="content">
        <ul className="breadcrumb">
          {breadcrumbs.map((breadcrumb) => {
            return (
              <li key={`breadcrumb-${breadcrumb.label}`}>
                {breadcrumb.href ? (
                  <Link to={breadcrumb.href}>{breadcrumb.label}</Link>
                ) : (
                  <span>{breadcrumb.label}</span>
                )}
              </li>
            );
          })}
        </ul>
        <div>{children}</div>
      </div>
    </div>
  );
};
-- Migration 002: Seed data for properties dashboard
-- Run: npx wrangler d1 execute gent-v2-db --file=migrations/002_seed.sql

INSERT OR IGNORE INTO properties (id, name, address, type, value, status, region, added_date) VALUES
  (8421, '123 Main St, NYC', '123 Main St, NYC', 'Single Family', 485000, 'Occupied', 'Northeast', '2026-06-14'),
  (8420, '456 Park Ave, LA', '456 Park Ave, LA', 'Condo', 325000, 'For Rent', 'West', '2026-06-13'),
  (8419, '789 Oak St, Chicago', '789 Oak St, Chicago', 'Townhouse', 275000, 'Under Contract', 'Midwest', '2026-06-12'),
  (8418, '101 Pine St, Seattle', '101 Pine St, Seattle', 'Single Family', 420000, 'Occupied', 'Pacific', '2026-06-11'),
  (8417, '202 Elm St, Boston', '202 Elm St, Boston', 'Condo', 295000, 'Sold', 'Northeast', '2026-06-10'),
  (8416, '303 Maple Dr, Austin', '303 Maple Dr, Austin', 'Single Family', 380000, 'Occupied', 'South', '2026-06-09'),
  (8415, '404 Cedar Ln, Denver', '404 Cedar Ln, Denver', 'Townhouse', 310000, 'For Rent', 'West', '2026-06-08'),
  (8414, '505 Birch Blvd, Miami', '505 Birch Blvd, Miami', 'Condo', 450000, 'Occupied', 'South', '2026-06-07'),
  (8413, '606 Walnut Ave, Portland', '606 Walnut Ave, Portland', 'Multi-Family', 550000, 'Occupied', 'Pacific', '2026-06-06'),
  (8412, '707 Spruce Ct, Atlanta', '707 Spruce Ct, Atlanta', 'Single Family', 340000, 'Under Contract', 'South', '2026-06-05'),
  (8411, '808 Ash St, Phoenix', '808 Ash St, Phoenix', 'Condo', 280000, 'Vacant', 'West', '2026-06-04'),
  (8410, '909 Poplar Rd, Dallas', '909 Poplar Rd, Dallas', 'Townhouse', 320000, 'Occupied', 'South', '2026-06-03'),
  (8409, '111 Birch Way, NYC', '111 Birch Way, NYC', 'Condo', 520000, 'Occupied', 'Northeast', '2026-06-02'),
  (8408, '222 Elm Ct, SF', '222 Elm Ct, SF', 'Single Family', 680000, 'For Rent', 'West', '2026-06-01'),
  (8407, '333 Oak Ave, Chicago', '333 Oak Ave, Chicago', 'Multi-Family', 490000, 'Occupied', 'Midwest', '2026-05-31'),
  (8406, '444 Pine Dr, Boston', '444 Pine Dr, Boston', 'Single Family', 410000, 'Vacant', 'Northeast', '2026-05-30'),
  (8405, '555 Maple Ln, Denver', '555 Maple Ln, Denver', 'Condo', 295000, 'Occupied', 'West', '2026-05-29'),
  (8404, '666 Cedar St, Austin', '666 Cedar St, Austin', 'Townhouse', 365000, 'Occupied', 'South', '2026-05-28'),
  (8403, '777 Spruce Ave, Seattle', '777 Spruce Ave, Seattle', 'Single Family', 445000, 'Under Contract', 'Pacific', '2026-05-27'),
  (8402, '888 Walnut Ct, Miami', '888 Walnut Ct, Miami', 'Condo', 470000, 'Occupied', 'South', '2026-05-26');

INSERT OR IGNORE INTO transactions (id, property, type, amount, description, date, contact) VALUES
  (1, '123 Main St', 'Income', 3450, 'Rent payment', '2026-06-14', 'Sarah K.'),
  (2, '456 Park Ave', 'Expense', 1200, 'Maintenance request', '2026-06-14', 'Michael R.'),
  (3, '789 Oak St', 'Income', 4500, 'Security deposit', '2026-06-13', 'Emily T.'),
  (4, '101 Pine St', 'Expense', 350, 'Inspection fee', '2026-06-12', 'John L.'),
  (5, '202 Elm St', 'Income', 3200, 'Rent payment', '2026-06-12', 'David W.'),
  (6, '303 Maple Dr', 'Income', 2800, 'Rent payment', '2026-06-11', 'Lisa M.'),
  (7, '404 Cedar Ln', 'Expense', 560, 'Plumbing repair', '2026-06-10', 'Tom H.'),
  (8, '505 Birch Blvd', 'Income', 3800, 'Rent payment', '2026-06-10', 'Anna P.');

INSERT OR IGNORE INTO contacts (id, name, email, role, property) VALUES
  (1, 'Sarah K.', 'sarah.k@example.com', 'Tenant', '123 Main St'),
  (2, 'Michael R.', 'michael.r@example.com', 'Tenant', '456 Park Ave'),
  (3, 'Emily T.', 'emily.t@example.com', 'Tenant', '789 Oak St'),
  (4, 'John L.', 'john.l@example.com', 'Contractor', ''),
  (5, 'David W.', 'david.w@example.com', 'Tenant', '202 Elm St');

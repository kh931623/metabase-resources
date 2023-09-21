export default {
  name: 'Big Orders',
  database: 'Sample Database',
  query: `
    select * from Orders o
    where o.total > 50;
  `
}

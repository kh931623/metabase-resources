export default {
  name: 'Small Orders',
  database: 'Sample Database',
  query: 'select * from Orders o where o.total < 50;'
}

fetch('http://localhost:3000/newFamily', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ key: 'value' }),
})
  .then(response => response.json())
  .then(function(data){console.log(data)})
  .catch(error => console.error('Ошибка:', error));
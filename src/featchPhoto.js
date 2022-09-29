const axios = require('axios');
const BASE_URL = 'https://pixabay.com/api/';
const KEY = '30238693-0e670d13d8b6be1c19eb21932';

export default async function fetchPhoto(searchValue, numberPage) {
  try {
    const response = await axios.get(
      `${BASE_URL}?key=${KEY}&q=${searchValue}&image_type=photo&orientation=horizontal&safesearch=true&page=${numberPage}&per_page=40`
    );
    return response;
  } catch (error) {
    return error;
  }
}

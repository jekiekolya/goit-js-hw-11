import { Notify } from 'notiflix/build/notiflix-notify-aio';
import fetchPhoto from './featchPhoto';

// Getting ref
const ref = {
  form: document.querySelector('.search-form'),
  boxLayout: document.querySelector('.gallery'),
};

// Add event listener on submit form for search images
ref.form.addEventListener('submit', onFormSubmit);

async function onFormSubmit(e) {
  e.preventDefault();
  let searchValue = e.target.elements.searchQuery.value;
  const response = await fetchPhoto(searchValue);
  const photoArray = await response.data.hits;
  if (photoArray.length === 0) {
    createNotifyFailure();
    return;
  }
  createNotifySuccess(response);
  createMarkupGallery(photoArray);
}

function createMarkupGallery(photoArray) {
  const stringMarkupGallery = photoArray
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
      <div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      <span>${likes}</span>
    </p>
    <p class="info-item">
      <b>Views</b>
      <span>${views}</span>
    </p>
    <p class="info-item">
      <b>Comments</b>
      <span>${comments}</span>
    </p>
    <p class="info-item">
      <b>Downloads</b>
      <span>${downloads}</span>
    </p>
  </div>
</div>
          `;
      }
    )
    .join('');

  ref.boxLayout.insertAdjacentHTML('beforeend', stringMarkupGallery);
}

function createNotifyFailure() {
  Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

function createNotifySuccess(response) {
  Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
}

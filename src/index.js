import { Notify } from 'notiflix/build/notiflix-notify-aio';
import fetchPhoto from './featchPhoto';

// Getting ref
const ref = {
  form: document.querySelector('.search-form'),
  boxLayout: document.querySelector('.gallery'),
  buttonLoadMore: document.querySelector('.load-more'),
};

// Variables
let numberPage;
let searchValue;
let per_page = 40;

// Add event listener on submit form for search images
ref.form.addEventListener('submit', onFormSubmit);
ref.buttonLoadMore.addEventListener('click', onButtonClick);

async function onFormSubmit(e) {
  e.preventDefault();
  ref.boxLayout.innerHTML = '';
  hideElement(ref.buttonLoadMore);
  searchValue = e.target.elements.searchQuery.value;
  numberPage = 1;

  if (searchValue === '') {
    Notify.failure('Hey, put something!');
    hideElement(ref.buttonLoadMore);
    return;
  }
  //
  showElement(ref.boxLayout);

  try {
    const response = await fetchPhoto(searchValue, numberPage);
    numberPage += 1;

    if (response.name === 'AxiosError') {
      throw new Error(response.message);
    }

    const photoArray = await response.data.hits;

    if (photoArray.length === 0) {
      createNotifyFailure();
      return;
    }

    createNotifySuccess(response);
    createMarkupGallery(photoArray);

    switchVisibilityButton(photoArray);
  } catch (error) {
    console.log(error);
    createNotifyFailureRequest(error);
  }
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

function createNotifyFailureRequest(error) {
  Notify.failure(`Sir, we have a problem: ${error}`);
}

function showElement(elem) {
  elem.classList.remove('visually-hidden');
}

function hideElement(elem) {
  elem.classList.add('visually-hidden');
}

function switchVisibilityButton(photoArray) {
  if (photoArray.length % per_page === 0) {
    showElement(ref.buttonLoadMore);
  } else {
    hideElement(ref.buttonLoadMore);
  }
}

// Load more photo after click button
async function onButtonClick(e) {
  try {
    const response = await fetchPhoto(searchValue, numberPage);

    if (response.name === 'AxiosError') {
      throw new Error(response.message);
    }

    numberPage += 1;

    const photoArray = await response.data.hits;

    if (photoArray.length % per_page !== 0) {
      hideElement(ref.buttonLoadMore);
    }

    createMarkupGallery(photoArray);
  } catch (error) {
    createNotifyFailureRequest(error);
  }
}

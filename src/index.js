import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import fetchPhoto from './featchPhoto';

// Getting ref
const ref = {
  form: document.querySelector('.search-form'),
  boxLayout: document.querySelector('.gallery'),
  loader: document.querySelector('.loader'),
  emptyList: document.querySelector('.empty-list'),
};

// Variables
let numberPage;
let searchValue;
let per_page = 40;
let isFetching = false;

ref.form.addEventListener('submit', onFormSubmit);

async function onFormSubmit(e) {
  e.preventDefault();
  ref.boxLayout.innerHTML = '';
  hideElement(ref.emptyList);
  searchValue = e.target.elements.searchQuery.value;
  numberPage = 1;
  isFetching = false;

  if (searchValue === '') {
    Notify.failure('Hey, put something!');
    hideElement(ref.loader);
    return;
  }

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
    switchVisibilityFinishElement(photoArray);
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
      <a href="${largeImageURL}">
  <img src="${webformatURL}" alt="Tag: ${tags}" loading="lazy" />
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
  </a>
</div>
          `;
      }
    )
    .join('');

  ref.boxLayout.insertAdjacentHTML('beforeend', stringMarkupGallery);
  lightbox.refresh();
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

function switchVisibilityFinishElement(photoArray) {
  if (photoArray.length % per_page !== 0) {
    hideElement(ref.loader);
    showElement(ref.emptyList);
    isFetching = true;
  }
}

// Load more photo after click button and infinity scroll

async function onLoadMoreClick(e) {
  isFetching = true;
  showElement(ref.loader);
  try {
    const response = await fetchPhoto(searchValue, numberPage);

    if (response.name === 'AxiosError') {
      throw new Error(response.message);
    }

    numberPage += 1;

    const photoArray = await response.data.hits;

    createMarkupGallery(photoArray);
    if (photoArray.length % per_page !== 0) {
      hideElement(ref.loader);
      showElement(ref.emptyList);
      return;
    }
    isFetching = false;
  } catch (error) {
    createNotifyFailureRequest(error);
  }
}

// Animation for open photo
ref.boxLayout.addEventListener('click', onClick);

function onClick(event) {
  event.preventDefault();

  if (event.target.nodeName !== 'IMG') {
    return;
  }
}

var lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

// Infinite scroll
window.addEventListener('scroll', async () => {
  // Do not run if currently fetching

  if (isFetching) return;

  // Scrolled to bottom
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    await onLoadMoreClick();
  }
});

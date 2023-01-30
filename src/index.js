import axios from 'axios';
import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
});

let page = 1;
const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-more');

loadBtn.style.display = 'none';

form.addEventListener('submit', evt => {
  evt.preventDefault();
  page = 1;
  gallery.innerHTML = '';
  loadBtn.style.display = 'none';
  runSearch().then(elementsNumber => {
    if (elementsNumber) {
      loadBtn.style.display = 'block';
    }
  });
});

loadBtn.addEventListener('click', () => {
  page += 1;
  runSearch();
});

async function runSearch() {
  const userSearch = form.searchQuery.value.trim();
  if (userSearch === '') {
    loadBtn.style.display = 'none';
    gallery.innerHTML = '';
    return;
  }

  async function getImages() {
    const response = await axios.get(
      `https://pixabay.com/api/?key=33195419-6a100955ee108d54dc0f94ed7&q=${userSearch}&image_type=photo&orientation =horizontal&safesearch =true&page=${page}&per_page=40`
    );
    const data = response.data.hits;

    return data;
  }

  try {
    const data = await getImages();

    if (!data.length) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      gallery.innerHTML = '';
      lightbox.refresh();
      return;
    }

    const elements = data.map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        const aEl = document.createElement('a');
        aEl.href = largeImageURL;
        aEl.innerHTML = `<div class="photo-card">
  <img  src="${webformatURL}" alt="${tags}" loading="lazy " />
  <div class="info">
    <p class="info-item">
      <b>Likes</b>${likes}
    </p>
    <p class="info-item">
      <b>Views</b>${views}
    </p>
    <p class="info-item">
      <b>Comments</b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>${downloads}
    </p>
  </div>
</div>`;

        return aEl;
      }
    );

    gallery.append(...elements);

    lightbox.refresh();

    return elements.length;
  } catch (err) {
    console.log('error', err);
  }
}

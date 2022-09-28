// Getting ref
const ref = {
  form: document.querySelector('.search-form'),
};

// Add event listener on submit form for search images
ref.form.addEventListener('submit', onFormSubmit);

function onFormSubmit(e) {
  e.preventDefault();
}

console.log(ref.form);

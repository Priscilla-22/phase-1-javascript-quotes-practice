document.addEventListener('DOMContentLoaded', () => {
  const quoteList = document.querySelector('#quote-list');
  const newQuoteForm = document.querySelector('#new-quote-form');
  const sortButton = document.querySelector('#sort-button');

  fetchQuotesAndSort();

  // Event listener for form submission
  newQuoteForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const newQuote = document.querySelector('#new-quote').value;
    const newAuthor = document.querySelector('#author').value;

    // Post new quote to the server
    fetch('http://localhost:3000/quotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        quote: newQuote,
        author: newAuthor,
      }),
    })
      .then((resp) => resp.json())
      .then((newQuoteData) => {
        addQuoteToUI(newQuoteData);
      });
    newQuoteForm.reset();
  });

  quoteList.addEventListener('click', (event) => {
    const quoteCard = event.target.closest('.quote-card');

    if (event.target.classList.contains('btn-danger')) {
      const quoteId = quoteCard.dataset.id;
      fetch(`http://localhost:3000/quotes/${quoteId}`, {
        method: 'DELETE',
      }).then(() => {
        quoteCard.remove();
      });
    } else if (event.target.classList.contains('btn-success')) {
      const quoteId = quoteCard.dataset.id;

      // Post a new like to the server
      fetch('http://localhost:3000/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          quoteId: parseInt(quoteId),
          createdAt: new Date().getTime() / 1000,
        }),
      })
        .then((resp) => resp.json())
        .then((likeData) => {
          const likeSpan = quoteCard.querySelector('.btn-success span');
          likeSpan.textContent = parseInt(likeSpan.textContent) + 1;
        });
    } else if (event.target.classList.contains('btn-edit')) {
      const paragraph = quoteCard.querySelector('.blockquote p');
      const blockquoteFooter = quoteCard.querySelector('.blockquote-footer');

      // Create an input field for editing
      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.value = paragraph.textContent;
      editInput.classList.add('form-control', 'mb-2');

      // Create a save button
      const saveButton = document.createElement('button');
      saveButton.classList.add('btn', 'btn-primary', 'btn-save');
      saveButton.textContent = 'Save';

      // Replace paragraph and footer with input and save button
      quoteCard.replaceChild(editInput, paragraph);
      quoteCard.replaceChild(saveButton, blockquoteFooter);

      saveButton.addEventListener('click', () => {
        const editedQuote = editInput.value;

        // Update the quote on the server
        fetch(`http://localhost:3000/quotes/${quoteCard.dataset.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            quote: editedQuote,
          }),
        }).then(() => {
          paragraph.textContent = editedQuote;
          quoteCard.replaceChild(paragraph, editInput);
          quoteCard.replaceChild(blockquoteFooter, saveButton);
        });
      });
    }
  });

  // Event listener for sort button
  sortButton.addEventListener('click', () => {
    fetchQuotesAndSort(!sortButton.classList.contains('active'));
  });

  // Function to fetch quotes with likes and sort
  function fetchQuotesAndSort(sortByAuthor = false) {
    const apiUrl = sortByAuthor
      ? 'http://localhost:3000/quotes?_embed=likes&_sort=author'
      : 'http://localhost:3000/quotes?_embed=likes';

    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((resp) => resp.json())
      .then((data) => {
        displayQuotes(data);
      });
  }

  // Function to display existing quotes
  function displayQuotes(data) {
    quoteList.innerHTML = '';

    data.forEach((quote) => {
      addQuoteToUI(quote);
    });
  }

  // Function to add a quote to the UI
  function addQuoteToUI(quote) {
    const quoteCard = document.createElement('li');
    quoteCard.classList.add('quote-card');
    quoteCard.dataset.id = quote.id;

    const blockQuote = document.createElement('blockquote');
    blockQuote.classList.add('blockquote');

    const paragraph = document.createElement('p');
    paragraph.classList.add('mb-0');
    paragraph.textContent = quote.quote;

    const blockquoteFooter = document.createElement('footer');
    blockquoteFooter.classList.add('blockquote-footer');
    blockquoteFooter.innerHTML = `${quote.author} <br>`;

    const likes = quote.likes ? quote.likes.length : 0;

    const btnSuccess = document.createElement('button');
    btnSuccess.classList.add('btn-success');
    btnSuccess.innerHTML = `Like: <span>${likes}</span>`;

    const btnDanger = document.createElement('button');
    btnDanger.classList.add('btn-danger'); 
    btnDanger.textContent = 'Delete';

    blockQuote.appendChild(paragraph);
    blockQuote.appendChild(blockquoteFooter);
    quoteCard.appendChild(blockQuote);
    quoteCard.appendChild(btnSuccess);
    quoteCard.appendChild(btnDanger); 

    quoteList.appendChild(quoteCard);
  }
});

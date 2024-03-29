// Make it so enter button clicks button
document.getElementById('searchInput')
    .addEventListener('keyup', e => {
        e.preventDefault()
        if (e.key === 'Enter') {
            document.getElementById("searchButton").click()
        }
    })

// API call to search videos on button click
document.getElementById('searchButton').addEventListener('click', function(event) {
    const query = document.getElementById('searchInput').value.trim();

    fetch('/search/videos?search=' + encodeURIComponent(query))
    .then(response => response.json())
    .then(data => {
        displaySearchResults(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

function displaySearchResults(results) {
    // Clear previous search results
    document.getElementById('searchResults').innerHTML = '';
    
    // Display new search results
    results.forEach(result => {
        const resultElement = document.createElement('div');

        const resultTitle = document.createElement('h2');
        resultTitle.textContent = result.title;

        const resultImg = document.createElement('img');
        resultImg.src = result.thumbnail_name;

        const resultLink = document.createElement('a');
        resultLink.href = result.video_url;
        resultLink.target = '_blank';
        
        resultLink.appendChild(resultImg)
        resultElement.append(resultLink)
        resultElement.append(resultTitle)
        
        
        document.getElementById('searchResults').appendChild(resultElement);
    });
}